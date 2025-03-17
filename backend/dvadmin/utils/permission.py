# -*- coding: utf-8 -*-

"""
@author: Yuan Xiaotian
@contact: QQ:1638245306
@Created on: 2021/6/6 006 10:30
@Remark: Custom permissions
"""
import re

from django.contrib.auth.models import AnonymousUser
from django.db.models import F
from rest_framework.permissions import BasePermission

from dvadmin.system.models import ApiWhiteList, RoleMenuButtonPermission


def ValidationApi(reqApi, validApi):
    """
    Verify that the current user has interface permissions
    :param reqApi: The currently requested interface
    :param validApi: Interface for verification
    :return: TrueorFalse
    """
    if validApi is not None:
        valid_api = validApi.replace('{id}', '.*?')
        matchObj = re.match(valid_api, reqApi, re.M | re.I)
        if matchObj:
            return True
        else:
            return False
    else:
        return False


class AnonymousUserPermission(BasePermission):
    """
    Anonymous user permissions
    """

    def has_permission(self, request, view):
        if isinstance(request.user, AnonymousUser):
            return False
        return True


class SuperuserPermission(BasePermission):
    """
    Super Administrator Permissions Class
    """

    def has_permission(self, request, view):
        if isinstance(request.user, AnonymousUser):
            return False
        # Determine whether you are a super administrator
        if request.user.is_superuser:
            return True


class AdminPermission(BasePermission):
    """
    Ordinary administrator permissions
    """

    def has_permission(self, request, view):
        if isinstance(request.user, AnonymousUser):
            return False
        # Determine whether you are a super administrator
        is_superuser = request.user.is_superuser
        # Determine whether it is an administrator role
        is_admin = request.user.role.values_list('admin', flat=True)
        if is_superuser or True in is_admin:
            return True


def ReUUID(api):
    """
    The interface isuuidReplace
    :param api:
    :return:
    """
    pattern = re.compile(r'[a-f\d]{4}(?:[a-f\d]{4}-){4}[a-f\d]{12}/$')
    m = pattern.search(api)
    if m:
        res = api.replace(m.group(0), ".*/")
        return res
    else:
        return None


class CustomPermission(BasePermission):
    """Custom permissions"""

    def has_permission(self, request, view):
        if isinstance(request.user, AnonymousUser):
            return False
        # Determine whether you are a super administrator
        if request.user.is_superuser:
            return True
        else:
            api = request.path  # Current request interface
            method = request.method  # Current request method
            methodList = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
            method = methodList.index(method)
            # ***Interface whitelist***
            api_white_list = ApiWhiteList.objects.values(permission__api=F('url'), permission__method=F('method'))
            api_white_list = [
                str(item.get('permission__api').replace('{id}', '([a-zA-Z0-9-]+)')) + ":" + str(
                    item.get('permission__method')) + '$' for item in api_white_list if item.get('permission__api')]
            # ********#
            if not hasattr(request.user, "role"):
                return False
            role_id_list = request.user.role.values_list('id', flat=True)
            userApiList = RoleMenuButtonPermission.objects.filter(role__in=role_id_list).values(
                permission__api=F('menu_button__api'), permission__method=F('menu_button__method'))  # Get all interfaces owned by the current user's role
            ApiList = [
                str(item.get('permission__api').replace('{id}', '([a-zA-Z0-9-]+)')) + ":" + str(
                    item.get('permission__method')) + '$' for item in userApiList if item.get('permission__api')]
            new_api_ist = api_white_list + ApiList
            new_api = api + ":" + str(method)
            for item in new_api_ist:
                matchObj = re.match(item, new_api, re.M | re.I)
                if matchObj is None:
                    continue
                else:
                    return True
            else:
                return False
