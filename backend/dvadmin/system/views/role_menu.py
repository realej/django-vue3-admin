# -*- coding: utf-8 -*-


from django.db.models import F
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from dvadmin.system.models import RoleMenuPermission, Menu, MenuButton
from dvadmin.utils.json_response import DetailResponse, ErrorResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet


class RoleMenuPermissionSerializer(CustomModelSerializer):
    """
    Menu Buttons-Serializer
    """

    class Meta:
        model = RoleMenuPermission
        fields = "__all__"
        read_only_fields = ["id"]


class RoleMenuPermissionInitSerializer(CustomModelSerializer):
    """
    Initialize menu button-Serializer
    """

    class Meta:
        model = RoleMenuPermission
        fields = "__all__"
        read_only_fields = ["id"]

class RoleMenuPermissionCreateUpdateSerializer(CustomModelSerializer):
    """
    Initialize menu button-Serializer
    """

    class Meta:
        model = RoleMenuPermission
        fields = "__all__"
        read_only_fields = ["id"]


class RoleMenuPermissionViewSet(CustomModelViewSet):
    """
    Menu Button Interface
    list:Query
    create:New
    update:Revise
    retrieve:Single case
    destroy:delete
    """
    queryset = RoleMenuPermission.objects.all()
    serializer_class = RoleMenuPermissionSerializer
    create_serializer_class = RoleMenuPermissionCreateUpdateSerializer
    update_serializer_class = RoleMenuPermissionCreateUpdateSerializer
    extra_filter_class = []

    @action(methods=['post'],detail=False)
    def save_auth(self,request):
        """
        Save page menu authorization
        :param request:
        :return:
        """
        body = request.data
        role_id = body.get('role',None)
        if role_id is None:
            return ErrorResponse(msg="Role parameters not obtained")
        menu_list = body.get('menu',None)
        if menu_list is None:
            return ErrorResponse(msg="Menu parameters not obtained")
        obj_list = RoleMenuPermission.objects.filter(role__id=role_id).values_list('menu__id',flat=True)
        old_set = set(obj_list)
        new_set = set(menu_list)
        #need_update = old_set.intersection(new_set) # Need to be updated
        need_del = old_set.difference(new_set) # Need to be deleted
        need_add = new_set.difference(old_set) # Need new ones
        RoleMenuPermission.objects.filter(role__id=role_id,menu__in=list(need_del)).delete()
        data = [{"role": role_id, "menu": item} for item in list(need_add)]
        serializer = RoleMenuPermissionSerializer(data=data,many=True,request=request)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return DetailResponse(msg="Save successfully",data=serializer.data)
