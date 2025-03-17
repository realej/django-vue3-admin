# -*- coding: utf-8 -*-

"""
@author: Yuan Xiaotian
@contact: QQ:1638245306
@Created on: 2021/6/3 003 0:30
@Remark: Role Management
"""
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from dvadmin.system.models import Role, Menu, MenuButton, Dept
from dvadmin.system.views.dept import DeptSerializer
from dvadmin.system.views.menu import MenuSerializer
from dvadmin.system.views.menu_button import MenuButtonSerializer
from dvadmin.utils.crud_mixin import FastCrudMixin
from dvadmin.utils.field_permission import FieldPermissionMixin
from dvadmin.utils.json_response import SuccessResponse, DetailResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.validator import CustomUniqueValidator
from dvadmin.utils.viewset import CustomModelViewSet


class RoleSerializer(CustomModelSerializer):
    """
    Role-Serializer
    """
    users = serializers.SerializerMethodField()

    @staticmethod
    def get_users(instance):
        users = instance.users_set.exclude(id=1).values('id', 'name', 'dept__name')
        return users

    class Meta:
        model = Role
        fields = "__all__"
        read_only_fields = ["id"]


class RoleCreateUpdateSerializer(CustomModelSerializer):
    """
    Role Management create/The serializer at update time
    """
    menu = MenuSerializer(many=True, read_only=True)
    dept = DeptSerializer(many=True, read_only=True)
    permission = MenuButtonSerializer(many=True, read_only=True)
    key = serializers.CharField(max_length=50,
                                validators=[CustomUniqueValidator(queryset=Role.objects.all(), message="Permission characters must be unique")])
    name = serializers.CharField(max_length=50, validators=[CustomUniqueValidator(queryset=Role.objects.all())])

    def validate(self, attrs: dict):
        return super().validate(attrs)

    # def save(self, **kwargs):
    #     is_superuser = self.request.user.is_superuser
    #     if not is_superuser:
    #         self.validated_data.pop('admin')
    #     data = super().save(**kwargs)
    #     return data

    class Meta:
        model = Role
        fields = '__all__'


class MenuPermissionSerializer(CustomModelSerializer):
    """
    Menu button permissions
    """
    menuPermission = serializers.SerializerMethodField()

    def get_menuPermission(self, instance):
        is_superuser = self.request.user.is_superuser
        if is_superuser:
            queryset = MenuButton.objects.filter(menu__id=instance.id)
        else:
            menu_permission_id_list = self.request.user.role.values_list('permission', flat=True)
            queryset = MenuButton.objects.filter(id__in=menu_permission_id_list, menu__id=instance.id)
        serializer = MenuButtonSerializer(queryset, many=True, read_only=True)
        return serializer.data

    class Meta:
        model = Menu
        fields = ['id', 'parent', 'name', 'menuPermission']


class MenuButtonPermissionSerializer(CustomModelSerializer):
    """
    Menu and button permissions
    """
    isCheck = serializers.SerializerMethodField()

    def get_isCheck(self, instance):
        is_superuser = self.request.user.is_superuser
        if is_superuser:
            return True
        else:
            return MenuButton.objects.filter(
                menu__id=instance.id,
                role__id__in=self.request.user.role.values_list('id', flat=True),
            ).exists()

    class Meta:
        model = Menu
        fields = '__all__'



class RoleViewSet(CustomModelViewSet, FastCrudMixin,FieldPermissionMixin):
    """
    Role Management Interface
    list:Query
    create:New
    update:Revise
    retrieve:Single case
    destroy:delete
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    create_serializer_class = RoleCreateUpdateSerializer
    update_serializer_class = RoleCreateUpdateSerializer
    search_fields = ['name', 'key']

    @action(methods=['PUT'], detail=True, permission_classes=[IsAuthenticated])
    def set_role_users(self, request, pk):
        """
        set up Role-user
        :param request:
        :return:
        """
        data = request.data
        direction = data.get('direction')
        movedKeys = data.get('movedKeys')
        role = Role.objects.get(pk=pk)
        if direction == "left":
            # left : Remove user permissions
            role.users_set.remove(*movedKeys)
        else:
            # right : Add user permissions
            role.users_set.add(*movedKeys)
        serializer = RoleSerializer(role)
        return DetailResponse(data=serializer.data, msg="Update successfully")