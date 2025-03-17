# -*- coding: utf-8 -*-
from django.db.models import F
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from dvadmin.system.models import FieldPermission, MenuField
from dvadmin.utils.json_response import DetailResponse


def merge_permission(data):
    """
    Merge permissions
    """
    result = {}
    for item in data:
        field_name = item.pop('field_name')
        if field_name not in result:
            result[field_name] = item
        else:
            for key, value in item.items():
                result[field_name][key] = result[field_name][key] or value
    return result


class FieldPermissionMixin:
    @action(methods=['get'], detail=False, permission_classes=[IsAuthenticated])
    def field_permission(self, request):
        """
        Get field permissions
        """
        model = self.serializer_class.Meta.model.__name__
        user = request.user
        # Create a default dictionary to store the final result
        if user.is_superuser == 1:
            data = MenuField.objects.filter(model=model).values('field_name')
            result = {item['field_name']: {"is_create": True, "is_query": True, "is_update": True} for item in data}
        else:
            roles = request.user.role.values_list('id', flat=True)
            data = FieldPermission.objects.filter(
                field__model=model, role__in=roles
            ).values('is_create', 'is_query', 'is_update', field_name=F('field__field_name'))
            result = merge_permission(data)
        return DetailResponse(data=result)
