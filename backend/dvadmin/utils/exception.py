# -*- coding: utf-8 -*-

"""
@author: Yuan Xiaotian
@contact: QQ:1638245306
@Created on: 2021/6/2 002 16:06
@Remark: Custom exception handling
"""
import logging
import traceback

from django.db.models import ProtectedError
from django.http import Http404
from rest_framework.exceptions import APIException as DRFAPIException, AuthenticationFailed, NotAuthenticated
from rest_framework.status import HTTP_401_UNAUTHORIZED
from rest_framework.views import set_rollback, exception_handler

from dvadmin.utils.json_response import ErrorResponse

logger = logging.getLogger(__name__)


class CustomAuthenticationFailed(NotAuthenticated):
    # set up status_code The attribute is 400
    status_code = 400

def CustomExceptionHandler(ex, context):
    """
    Unified exception interception processing
    Purpose:(1)Cancel all500Exception response,Unified response is returned as standard error
        (2)Display error messages accurately
    :param ex:
    :param context:
    :return:
    """
    msg = ''
    code = 4000
    # Call the default exception handling function
    response = exception_handler(ex, context)
    if isinstance(ex, AuthenticationFailed):
        # If it's an authentication error
        if response and response.data.get('detail') == "Given token not valid for any token type":
            code = 401
            msg = ex.detail
        elif response and response.data.get('detail') == "Token is blacklisted":
            # tokenOn the blacklist
            return ErrorResponse(status=HTTP_401_UNAUTHORIZED)
        else:
            code = 401
            msg = ex.detail
    elif isinstance(ex,Http404):
        code = 400
        msg = "Incorrect interface address"
    elif isinstance(ex, DRFAPIException):
        set_rollback()
        msg = ex.detail
        if isinstance(msg,dict):
            for k, v in msg.items():
                for i in v:
                    msg = "%s:%s" % (k, i)
    elif isinstance(ex, ProtectedError):
        set_rollback()
        msg = "Deletion failed:This piece of data is related to other data"
    # elif isinstance(ex, DatabaseError):
    #     set_rollback()
    #     msg = "Interface server exception,Please contact the administrator"
    elif isinstance(ex, Exception):
        logger.exception(traceback.format_exc())
        msg = str(ex)
    return ErrorResponse(msg=msg, code=code)
