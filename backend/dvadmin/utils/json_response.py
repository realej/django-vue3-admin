# -*- coding: utf-8 -*-

"""
@author: Yuan Xiaotian
@contact: QQ:1638245306
@Created on: 2021/6/2 002 14:43
@Remark: CustomJsonResonpsedocument
"""

from rest_framework.response import Response


class SuccessResponse(Response):
    """
    Returns with successful standard response, SuccessResponse(data)orSuccessResponse(data=data)
    (1)defaultcodereturn2000, Specifying other return codes is not supported
    """

    def __init__(self, data=None, msg='success', status=None, template_name=None, headers=None, exception=False,
                 content_type=None,page=1,limit=1,total=1):
        std_data = {
            "code": 2000,
            "page": page,
            "limit": limit,
            "total": total,
            "data": data,
            "msg": msg
        }
        super().__init__(std_data, status, template_name, headers, exception, content_type)


class DetailResponse(Response):
    """
    Returns to interfaces that do not contain paging information,Mainly used for single data query
    (1)defaultcodereturn2000, Specifying other return codes is not supported
    """

    def __init__(self, data=None, msg='success', status=None, template_name=None, headers=None, exception=False,
                 content_type=None,):
        std_data = {
            "code": 2000,
            "data": data,
            "msg": msg
        }
        super().__init__(std_data, status, template_name, headers, exception, content_type)


class ErrorResponse(Response):
    """
    Return of standard response error,ErrorResponse(msg='xxx')
    (1)The default error code returns400, You can also specify other return codes:ErrorResponse(code=xxx)
    """

    def __init__(self, data=None, msg='error', code=400, status=None, template_name=None, headers=None,
                 exception=False, content_type=None):
        std_data = {
            "code": code,
            "data": data,
            "msg": msg
        }
        super().__init__(std_data, status, template_name, headers, exception, content_type)
