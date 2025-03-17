# -*- coding: utf-8 -*-

"""
@author: Yuan Xiaotian
@contact: QQ:1638245306
@Created on: 2022/1/21 003 0:30
@Remark: System configuration
"""
import django_filters
from django.db.models import Q
from django_filters.rest_framework import BooleanFilter
from rest_framework import serializers
from rest_framework.views import APIView

from application import dispatch
from dvadmin.system.models import SystemConfig
from dvadmin.utils.json_response import DetailResponse, SuccessResponse, ErrorResponse
from dvadmin.utils.models import get_all_models_objects
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.validator import CustomValidationError
from dvadmin.utils.viewset import CustomModelViewSet


class SystemConfigCreateSerializer(CustomModelSerializer):
    """
    System configuration-Used when added-Serializer
    """
    form_item_type_label = serializers.CharField(source='get_form_item_type_display', read_only=True)

    class Meta:
        model = SystemConfig
        fields = "__all__"
        read_only_fields = ["id"]

    def validate_key(self, value):
        """
        verifykeyWhether to allow duplication
        parentNo repetition allowed when it is empty,Otherwise, allow it
        """
        instance = SystemConfig.objects.filter(key=value, parent__isnull=True).exists()
        if instance:
            raise CustomValidationError('The same variable name already exists')
        return value




class SystemConfigSerializer(CustomModelSerializer):
    """
    System configuration-Serializer
    """
    form_item_type_label = serializers.CharField(source='get_form_item_type_display', read_only=True)

    class Meta:
        model = SystemConfig
        fields = "__all__"
        read_only_fields = ["id"]


class SystemConfigChinldernSerializer(CustomModelSerializer):
    """
    System configuration sublevel-Serializer
    """
    children = serializers.SerializerMethodField()
    form_item_type_label = serializers.CharField(source='get_form_item_type_display', read_only=True)

    def get_children(self, instance):
        queryset = SystemConfig.objects.filter(parent=instance)
        serializer = SystemConfigSerializer(queryset, many=True)
        return serializer.data

    class Meta:
        model = SystemConfig
        fields = "__all__"
        read_only_fields = ["id"]


class SystemConfigListSerializer(CustomModelSerializer):
    """
    Saving modules under system configuration-Serializer
    """

    def update(self, instance, validated_data):
        instance_mapping = {obj.id: obj for obj in instance}
        data_mapping = {item['id']: item for item in validated_data}
        for obj_id, data in data_mapping.items():
            instance_obj = instance_mapping.get(obj_id, None)
            if instance_obj is None:
                return SystemConfig.objects.create(**data)
            else:
                return instance_obj.objects.update(**data)

    class Meta:
        model = SystemConfig
        fields = "__all__"
        read_only_fields = ["id"]


class SystemConfigSaveSerializer(serializers.Serializer):
    class Meta:
        read_only_fields = ["id"]
        list_serializer_class = SystemConfigListSerializer


class SystemConfigFilter(django_filters.rest_framework.FilterSet):
    """
    Filter
    """
    parent__isnull = BooleanFilter(field_name='parent', lookup_expr="isnull")

    class Meta:
        model = SystemConfig
        fields = ['id', 'parent', 'status', 'parent__isnull']


class SystemConfigViewSet(CustomModelViewSet):
    """
    System configuration interface
    """
    queryset = SystemConfig.objects.order_by('sort', 'create_datetime')
    serializer_class = SystemConfigChinldernSerializer
    create_serializer_class = SystemConfigCreateSerializer
    retrieve_serializer_class = SystemConfigChinldernSerializer
    # filter_fields = ['id','parent']
    filter_class = SystemConfigFilter

    def save_content(self, request):
        body = request.data
        data_mapping = {item['id']: item for item in body}
        for obj_id, data in data_mapping.items():
            instance_obj = SystemConfig.objects.filter(id=obj_id).first()
            if instance_obj is None:
                # return SystemConfig.objects.create(**data)
                serializer = SystemConfigCreateSerializer(data=data)
            else:
                serializer = SystemConfigCreateSerializer(instance_obj, data=data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
        return DetailResponse(msg="Save successfully")

    def get_association_table(self, request):
        """
        Get allmodeland field information
        """
        res = [ele.get('table') for ele in get_all_models_objects().values()]
        return DetailResponse(msg="Get successful", data=res)

    def get_table_data(self, request, pk):
        """
        Dynamically obtain data from the associated table
        """
        instance = SystemConfig.objects.filter(id=pk).first()
        if instance is None:
            return ErrorResponse(msg="There was an error in the query~")
        setting = instance.setting
        if setting is None:
            return ErrorResponse(msg="There was an error in the query~")
        table = setting.get('table')  # Getmodelname
        model = get_all_models_objects(table).get("object", {})
        # Just judge it does not exist
        queryset = model.objects.values()
        body = request.query_params
        search_value = body.get('search', None)
        if search_value:
            search_fields = setting.get('searchField')
            filters = Q()
            filters.connector = 'OR'
            for item in search_fields:
                filed = '{0}__icontains'.format(item.get('field'))
                filters.children.append((filed, search_value))
            queryset = model.objects.filter(filters).values()
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(queryset)
        return SuccessResponse(msg="Get successful", data=queryset, total=len(queryset))

    def get_relation_info(self, request):
        """
        Query associated template information
        """
        body = request.query_params
        var_name = body.get('varName', None)
        table = body.get('table', None)
        instance = SystemConfig.objects.filter(key=var_name, setting__table=table).first()
        if instance is None:
            return ErrorResponse(msg="No associated information was obtained")
        relation_id = body.get('relationIds', None)
        relationIds = []
        if relation_id is None:
            return ErrorResponse(msg="No associated information was obtained")
        if instance.form_item_type in [13]:
            relationIds = [relation_id]
        elif instance.form_item_type in [14]:
            relationIds = relation_id.split(',')
        queryset = SystemConfig.objects.filter(value__in=relationIds).first()
        if queryset is None:
            return ErrorResponse(msg="No associated information was obtained")
        serializer = SystemConfigChinldernSerializer(queryset.parent)
        return DetailResponse(msg="Query successful", data=serializer.data)


class InitSettingsViewSet(APIView):
    """
    Get initialization configuration
    """
    authentication_classes = []
    permission_classes = []

    def filter_system_config_values(self, data: dict):
        """
        Filter system initialization configuration
        :param data:
        :return:
        """
        if not self.request.query_params.get('key', ''):
            return data
        new_data = {}
        for key in self.request.query_params.get('key', '').split('|'):
            if key:
                new_data.update(**dict(filter(lambda x: x[0].startswith(key), data.items())))
        return new_data

    def get(self, request):
        data = dispatch.get_system_config()
        if not data:
            dispatch.refresh_system_config()
            data = dispatch.get_system_config()
        # No backend dedicated configuration is returned
        backend_config = [f"{ele.get('parent__key')}.{ele.get('key')}" for ele in
                          SystemConfig.objects.filter(status=False, parent_id__isnull=False).values('parent__key',
                                                                                                    'key')]
        data = dict(filter(lambda x: x[0] not in backend_config, data.items()))
        data = self.filter_system_config_values(data=data)
        return DetailResponse(data=data)
