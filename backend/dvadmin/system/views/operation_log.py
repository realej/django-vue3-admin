# -*- coding: utf-8 -*-

"""
@author: Li Qiang
@contact: QQ:1206709430
@Created on: 2021/6/8 003 0:30
@Remark: Operation log management
"""

from dvadmin.system.models import OperationLog
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.viewset import CustomModelViewSet


class OperationLogSerializer(CustomModelSerializer):
    """
    log-Serializer
    """

    class Meta:
        model = OperationLog
        fields = "__all__"
        read_only_fields = ["id"]


class OperationLogCreateUpdateSerializer(CustomModelSerializer):
    """
    Operation log  create/The serializer at update time
    """

    class Meta:
        model = OperationLog
        fields = '__all__'


class OperationLogViewSet(CustomModelViewSet):
    """
    Operation log interface
    list:Query
    create:New
    update:Revise
    retrieve:Single case
    destroy:delete
    """
    queryset = OperationLog.objects.order_by('-create_datetime')
    serializer_class = OperationLogSerializer
    # permission_classes = []
