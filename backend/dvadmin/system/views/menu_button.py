# -*- coding: utf-8 -*-

"""
@author: Yuan Xiaotian
@contact: QQ:1638245306
@Created on: 2021/6/3 003 0:30
@Remark: Menu Button Management
"""
from django.db.models import F
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from dvadmin.system.models import MenuButton, RoleMenuButtonPermission, Menu
from dvadmin.utils.json_response import DetailResponse, SuccessResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet




class MenuButtonSerializer(CustomModelSerializer):
    """
    Menu Buttons-Serializer
    """

    class Meta:
        model = MenuButton
        fields = ['id', 'name', 'value', 'api', 'method','menu']
        read_only_fields = ["id"]




class MenuButtonCreateUpdateSerializer(CustomModelSerializer):
    """
    Initialize menu button-Serializer
    """

    class Meta:
        model = MenuButton
        fields = "__all__"
        read_only_fields = ["id"]


class MenuButtonViewSet(CustomModelViewSet):
    """
    Menu Button Interface
    list:Query
    create:New
    update:Revise
    retrieve:Single case
    destroy:delete
    """
    queryset = MenuButton.objects.order_by('create_datetime')
    serializer_class = MenuButtonSerializer
    create_serializer_class = MenuButtonCreateUpdateSerializer
    update_serializer_class = MenuButtonCreateUpdateSerializer
    extra_filter_class = []

    def list(self, request, *args, **kwargs):
        """
        Rewritelistmethod
        :param request:
        :param args:
        :param kwargs:
        :return:
        """
        queryset = self.filter_queryset(self.get_queryset()).order_by('name')
        serializer = self.get_serializer(queryset, many=True, request=request)
        return SuccessResponse(serializer.data,msg="Get successful")

    @action(methods=['get'],detail=False,permission_classes=[IsAuthenticated])
    def menu_button_all_permission(self,request):
        """
        Get all button permissions
        :param request:
        :return:
        """
        is_superuser = request.user.is_superuser
        if is_superuser:
            queryset = MenuButton.objects.values_list('value',flat=True)
        else:
            role_id = request.user.role.values_list('id', flat=True)
            queryset = RoleMenuButtonPermission.objects.filter(role__in=role_id).values_list('menu_button__value',flat=True).distinct()
        return DetailResponse(data=queryset)

    @action(methods=['post'], detail=False, permission_classes=[IsAuthenticated])
    def batch_create(self, request, *args, **kwargs):
        """
        Bulk creating menus“Add, delete, modify and check”Permissions
        The data created comes from the menu，Need to create menu parameters in a standard way
        value：Menucomponent_name:method
        api:Menuweb_pathIncrease'/api'Prefix，And according tomethodIncrease{id}
        """
        menu_obj = Menu.objects.filter(id=request.data['menu']).first()
        result_list = [
            {'menu': menu_obj.id, 'name': 'New', 'value': f'{menu_obj.component_name}:Create', 'api': f'/api/{menu_obj.component_name}/', 'method': 1},
            {'menu': menu_obj.id, 'name': 'delete', 'value': f'{menu_obj.component_name}:Delete', 'api': f'/api/{menu_obj.component_name}/{{id}}/', 'method': 3},
            {'menu': menu_obj.id, 'name': 'edit', 'value': f'{menu_obj.component_name}:Update', 'api': f'/api/{menu_obj.component_name}/{{id}}/', 'method': 2},
            {'menu': menu_obj.id, 'name': 'Query', 'value': f'{menu_obj.component_name}:Search', 'api': f'/api/{menu_obj.component_name}/', 'method': 0},
            {'menu': menu_obj.id, 'name': 'Details', 'value': f'{menu_obj.component_name}:Retrieve', 'api': f'/api/{menu_obj.component_name}/{{id}}/', 'method': 0},
            {'menu': menu_obj.id, 'name': 'copy', 'value': f'{menu_obj.component_name}:Copy', 'api': f'/api/{menu_obj.component_name}/', 'method': 1},
            {'menu': menu_obj.id, 'name': 'Import', 'value': f'{menu_obj.component_name}:Import', 'api': f'/api/{menu_obj.component_name}/import_data/', 'method': 1},
            {'menu': menu_obj.id, 'name': 'Export', 'value': f'{menu_obj.component_name}:Export', 'api': f'/api{menu_obj.component_name}/export_data/', 'method': 1},]
        serializer = self.get_serializer(data=result_list, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return SuccessResponse(serializer.data, msg="Bulk creation successfully")