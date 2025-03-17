# -*- coding: utf-8 -*-

"""
@author: Yuan Xiaotian
@contact: QQ:1638245306
@Created on: 2021/6/1 001 22:47
@Remark: Custom serializer
"""
from rest_framework import serializers
from rest_framework.fields import empty
from rest_framework.request import Request
from rest_framework.serializers import ModelSerializer
from django.utils.functional import cached_property
from rest_framework.utils.serializer_helpers import BindingDict

from dvadmin.system.models import Users
from django_restql.mixins import DynamicFieldsMixin


class CustomModelSerializer(DynamicFieldsMixin, ModelSerializer):
    """
    EnhancedDRFofModelSerializer,Automatically update the audit field records of the model
    (1)self.requestCan be obtainedrest_framework.request.RequestObject
    """

    # Modify the audit field name of the person, defaultmodifier, Custom override when inheriting
    modifier_field_id = "modifier"
    modifier_name = serializers.SerializerMethodField(read_only=True)

    def get_modifier_name(self, instance):
        if not hasattr(instance, "modifier"):
            return None
        queryset = (
            Users.objects.filter(id=instance.modifier)
            .values_list("name", flat=True)
            .first()
        )
        if queryset:
            return queryset
        return None

    # The audit field name of the creator, defaultcreator, Custom override when inheriting
    creator_field_id = "creator"
    creator_name = serializers.SlugRelatedField(
        slug_field="name", source="creator", read_only=True
    )
    # Data department fields
    dept_belong_id_field_name = "dept_belong_id"
    # Add default time return format
    create_datetime = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S", required=False, read_only=True
    )
    update_datetime = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S", required=False, read_only=True
    )

    def __init__(self, instance=None, data=empty, request=None, **kwargs):
        super().__init__(instance, data, **kwargs)
        self.request: Request = request or self.context.get("request", None)

    def save(self, **kwargs):
        return super().save(**kwargs)

    def create(self, validated_data):
        if self.request:
            if str(self.request.user) != "AnonymousUser":
                if self.modifier_field_id in self.fields.fields:
                    validated_data[self.modifier_field_id] = self.get_request_user_id()
                if self.creator_field_id in self.fields.fields:
                    validated_data[self.creator_field_id] = self.request.user

                if (
                        self.dept_belong_id_field_name in self.fields.fields
                        and validated_data.get(self.dept_belong_id_field_name, None) is None
                ):
                    validated_data[self.dept_belong_id_field_name] = getattr(
                        self.request.user, "dept_id", validated_data.get(self.dept_belong_id_field_name, None)
                    )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if self.request:
            if str(self.request.user) != "AnonymousUser":
                if self.modifier_field_id in self.fields.fields:
                    validated_data[self.modifier_field_id] = self.get_request_user_id()
            if hasattr(self.instance, self.modifier_field_id):
                setattr(
                    self.instance, self.modifier_field_id, self.get_request_user_id()
                )
        return super().update(instance, validated_data)

    def get_request_username(self):
        if getattr(self.request, "user", None):
            return getattr(self.request.user, "username", None)
        return None

    def get_request_name(self):
        if getattr(self.request, "user", None):
            return getattr(self.request.user, "name", None)
        return None

    def get_request_user_id(self):
        if getattr(self.request, "user", None):
            return getattr(self.request.user, "id", None)
        return None

    @property
    def errors(self):
        # get errors
        errors = super().errors
        verbose_errors = {}

        # fields = { field.name: field.verbose_name } for each field in model
        fields = {field.name: field.verbose_name for field in
                  self.Meta.model._meta.get_fields() if hasattr(field, 'verbose_name')}

        # iterate over errors and replace error key with verbose name if exists
        for field_name, error in errors.items():
            if field_name in fields:
                verbose_errors[str(fields[field_name])] = error
            else:
                verbose_errors[field_name] = error
        return verbose_errors

    # @cached_property
    # def fields(self):
    #     fields = BindingDict(self)
    #     for key, value in self.get_fields().items():
    #         fields[key] = value
    #
    #     if not hasattr(self, '_context'):
    #         return fields
    #     is_root = self.root == self
    #     parent_is_list_root = self.parent == self.root and getattr(self.parent, 'many', False)
    #     if not (is_root or parent_is_list_root):
    #         return fields
    #
    #     try:
    #         request = self.request or self.context['request']
    #     except KeyError:
    #         return fields
    #     params = getattr(
    #         request, 'query_params', getattr(request, 'GET', None)
    #     )
    #     if params is None:
    #         pass
    #     try:
    #         filter_fields = params.get('_fields', None).split(',')
    #     except AttributeError:
    #         filter_fields = None
    #
    #     try:
    #         omit_fields = params.get('_exclude', None).split(',')
    #     except AttributeError:
    #         omit_fields = []
    #
    #     existing = set(fields.keys())
    #     if filter_fields is None:
    #         allowed = existing
    #     else:
    #         allowed = set(filter(None, filter_fields))
    #
    #     omitted = set(filter(None, omit_fields))
    #     for field in existing:
    #         if field not in allowed:
    #             fields.pop(field, None)
    #         if field in omitted:
    #             fields.pop(field, None)
    #
    #     return fields
