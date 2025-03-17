import hashlib

from django.contrib.auth.hashers import make_password, check_password
from django_restql.fields import DynamicSerializerMethodField
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import connection
from django.db.models import Q
from application import dispatch
from dvadmin.system.models import Users, Role, Dept
from dvadmin.system.views.role import RoleSerializer
from dvadmin.utils.json_response import ErrorResponse, DetailResponse, SuccessResponse
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.validator import CustomUniqueValidator
from dvadmin.utils.viewset import CustomModelViewSet


def recursion(instance, parent, result):
    new_instance = getattr(instance, parent, None)
    res = []
    data = getattr(instance, result, None)
    if data:
        res.append(data)
    if new_instance:
        array = recursion(new_instance, parent, result)
        res += array
    return res


class UserSerializer(CustomModelSerializer):
    """
    User Management-Serializer
    """
    dept_name = serializers.CharField(source='dept.name', read_only=True)
    role_info = DynamicSerializerMethodField()
    dept_name_all = serializers.SerializerMethodField()

    class Meta:
        model = Users
        read_only_fields = ["id"]
        exclude = ["password"]
        extra_kwargs = {
            "post": {"required": False},
            "mobile": {"required": False},
        }

    def get_dept_name_all(self, instance):
        dept_name_all = recursion(instance.dept, "parent", "name")
        dept_name_all.reverse()
        return "/".join(dept_name_all)

    def get_role_info(self, instance, parsed_query):
        roles = instance.role.all()
        # You can do what ever you want in here
        # `parsed_query` param is passed to BookSerializer to allow further querying
        serializer = RoleSerializer(
            roles,
            many=True,
            parsed_query=parsed_query
        )
        return serializer.data


class UserCreateSerializer(CustomModelSerializer):
    """
    New users-Serializer
    """

    username = serializers.CharField(
        max_length=50,
        validators=[
            CustomUniqueValidator(queryset=Users.objects.all(), message="The account must be unique")
        ],
    )
    password = serializers.CharField(
        required=False,
    )

    def validate_password(self, value):
        """
        Verify password
        """
        md5 = hashlib.md5()
        md5.update(value.encode('utf-8'))
        md5_password = md5.hexdigest()
        return make_password(md5_password)

    def save(self, **kwargs):
        data = super().save(**kwargs)
        data.dept_belong_id = data.dept_id
        data.save()
        data.post.set(self.initial_data.get("post", []))
        return data

    class Meta:
        model = Users
        fields = "__all__"
        read_only_fields = ["id"]
        extra_kwargs = {
            "post": {"required": False},
            "mobile": {"required": False},
        }


class UserUpdateSerializer(CustomModelSerializer):
    """
    User modification-Serializer
    """

    username = serializers.CharField(
        max_length=50,
        validators=[
            CustomUniqueValidator(queryset=Users.objects.all(), message="The account must be unique")
        ],
    )

    def validate_is_active(self, value):
        """
        Change the activation status
        """
        if value:
            self.initial_data["login_error_count"] = 0
        return value

    def save(self, **kwargs):
        data = super().save(**kwargs)
        data.dept_belong_id = data.dept_id
        data.save()
        data.post.set(self.initial_data.get("post", []))
        return data

    class Meta:
        model = Users
        read_only_fields = ["id", "password"]
        fields = "__all__"
        extra_kwargs = {
            "post": {"required": False, "read_only": True},
            "mobile": {"required": False},
        }


class UserInfoUpdateSerializer(CustomModelSerializer):
    """
    User modification-Serializer
    """
    mobile = serializers.CharField(
        max_length=50,
        validators=[
            CustomUniqueValidator(queryset=Users.objects.all(), message="Mobile phone number must be unique")
        ],
        allow_blank=True
    )

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

    class Meta:
        model = Users
        fields = ['email', 'mobile', 'avatar', 'name', 'gender']
        extra_kwargs = {
            "post": {"required": False, "read_only": True},
            "mobile": {"required": False},
        }


class ExportUserProfileSerializer(CustomModelSerializer):
    """
    User Export Serializer
    """

    last_login = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S", required=False, read_only=True
    )
    is_active = serializers.SerializerMethodField(read_only=True)
    dept_name = serializers.CharField(source="dept.name", default="")
    dept_owner = serializers.CharField(source="dept.owner", default="")
    gender = serializers.CharField(source="get_gender_display", read_only=True)

    def get_is_active(self, instance):
        return "Enable" if instance.is_active else "Disable"

    class Meta:
        model = Users
        fields = (
            "username",
            "name",
            "email",
            "mobile",
            "gender",
            "is_active",
            "last_login",
            "dept_name",
            "dept_owner",
        )


class UserProfileImportSerializer(CustomModelSerializer):
    password = serializers.CharField(read_only=True, required=False)

    def save(self, **kwargs):
        data = super().save(**kwargs)
        password = hashlib.new(
            "md5", str(self.initial_data.get("password", "admin123456")).encode(encoding="UTF-8")
        ).hexdigest()
        data.set_password(password)
        data.save()
        return data

    class Meta:
        model = Users
        exclude = (
            "post",
            "user_permissions",
            "groups",
            "is_superuser",
            "date_joined",
        )


class UserViewSet(CustomModelViewSet):
    """
    User Interface
    list:Query
    create:New
    update:Revise
    retrieve:Single case
    destroy:delete
    """

    queryset = Users.objects.exclude(is_superuser=1).all()
    serializer_class = UserSerializer
    create_serializer_class = UserCreateSerializer
    update_serializer_class = UserUpdateSerializer
    filter_fields = ["name", "username", "gender", "is_active", "dept", "user_type"]
    search_fields = ["username", "name", "dept__name", "role__name"]
    # Export
    export_field_label = {
        "username": "User account",
        "name": "Username",
        "email": "User email",
        "mobile": "phone number",
        "gender": "User Gender",
        "is_active": "Account status",
        "last_login": "Last login time",
        "dept_name": "Department name",
        "dept_owner": "Department Head",
    }
    export_serializer_class = ExportUserProfileSerializer
    # Import
    import_serializer_class = UserProfileImportSerializer
    import_field_dict = {
        "username": "Log in to your account",
        "name": "Username",
        "email": "User email",
        "mobile": "phone number",
        "gender": {
            "title": "User Gender",
            "choices": {
                "data": {"unknown": 2, "male": 1, "female": 0},
            }
        },
        "is_active": {
            "title": "Account status",
            "choices": {
                "data": {"Enable": True, "Disabled": False},
            }
        },
        "dept": {"title": "department", "choices": {"queryset": Dept.objects.filter(status=True), "values_name": "name"}},
        "role": {"title": "Role", "choices": {"queryset": Role.objects.filter(status=True), "values_name": "name"}},
    }

    @action(methods=["GET"], detail=False, permission_classes=[IsAuthenticated])
    def user_info(self, request):
        """Get current user information"""
        user = request.user
        result = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "mobile": user.mobile,
            "user_type": user.user_type,
            "gender": user.gender,
            "email": user.email,
            "avatar": user.avatar,
            "dept": user.dept_id,
            "is_superuser": user.is_superuser,
            "role": user.role.values_list('id', flat=True),
            "pwd_change_count":user.pwd_change_count
        }
        if hasattr(connection, 'tenant'):
            result['tenant_id'] = connection.tenant and connection.tenant.id
            result['tenant_name'] = connection.tenant and connection.tenant.name
        dept = getattr(user, 'dept', None)
        if dept:
            result['dept_info'] = {
                'dept_id': dept.id,
                'dept_name': dept.name
            }
        else:
            result['dept_info'] = {
                'dept_id': None,
                'dept_name': "No department yet"
            }
        role = getattr(user, 'role', None)
        if role:
            result['role_info'] = role.values('id', 'name', 'key')
        return DetailResponse(data=result, msg="Get successful")

    @action(methods=["PUT"], detail=False, permission_classes=[IsAuthenticated])
    def update_user_info(self, request):
        """Modify current user information"""
        serializer = UserInfoUpdateSerializer(request.user, data=request.data, request=request)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return DetailResponse(data=None, msg="Modification was successful")

    @action(methods=["PUT"], detail=False, permission_classes=[IsAuthenticated])
    def change_password(self, request, *args, **kwargs):
        """Password modification"""
        data = request.data
        old_pwd = data.get("oldPassword")
        new_pwd = data.get("newPassword")
        new_pwd2 = data.get("newPassword2")
        if old_pwd is None or new_pwd is None or new_pwd2 is None:
            return ErrorResponse(msg="Parameters cannot be empty")
        if new_pwd != new_pwd2:
            return ErrorResponse(msg="Password mismatched twice")
        verify_password = check_password(old_pwd, request.user.password)
        if not verify_password:
            old_pwd_md5 = hashlib.md5(old_pwd.encode(encoding='UTF-8')).hexdigest()
            verify_password = check_password(str(old_pwd_md5), request.user.password)
            # When creating a user、The problem of custom password cannot be modified
            if not verify_password:
                old_pwd_md5 = hashlib.md5(old_pwd_md5.encode(encoding='UTF-8')).hexdigest()
                verify_password = check_password(str(old_pwd_md5), request.user.password)
        if verify_password:
            # request.user.password = make_password(hashlib.md5(new_pwd.encode(encoding='UTF-8')).hexdigest())
            request.user.password = make_password(new_pwd)
            request.user.pwd_change_count += 1
            request.user.save()
            return DetailResponse(data=None, msg="Modification was successful")
        else:
            return ErrorResponse(msg="The old password is incorrect")

    @action(methods=["post"], detail=False, permission_classes=[IsAuthenticated])
    def login_change_password(self, request, *args, **kwargs):
        """Password modification for the first time login"""
        data = request.data
        new_pwd = data.get("password")
        new_pwd2 = data.get("password_regain")
        if new_pwd != new_pwd2:
            return ErrorResponse(msg="Password mismatched twice")
        else:
            request.user.password = make_password(hashlib.md5(new_pwd.encode(encoding='UTF-8')).hexdigest())
            request.user.pwd_change_count += 1
            request.user.save()
            return DetailResponse(data=None, msg="Modification was successful")

    @action(methods=["PUT"], detail=True, permission_classes=[IsAuthenticated])
    def reset_to_default_password(self, request,pk):
        """Restore the default password"""
        if not self.request.user.is_superuser:
            return ErrorResponse(msg="Only allow super administrators to reset their passwords")
        instance = Users.objects.filter(id=pk).first()
        if instance:
            default_password = dispatch.get_system_config_values("base.default_password")
            md5_pwd = hashlib.md5(default_password.encode(encoding='UTF-8')).hexdigest()
            instance.password = make_password(md5_pwd)
            instance.save()
            return DetailResponse(data=None, msg="Password reset successfully")
        else:
            return ErrorResponse(msg="No user was obtained")

    @action(methods=["PUT"], detail=True)
    def reset_password(self, request, pk):
        """
        Password reset
        """
        if not self.request.user.is_superuser:
            return ErrorResponse(msg="Only allow super administrators to reset their passwords")
        instance = Users.objects.filter(id=pk).first()
        data = request.data
        new_pwd = data.get("newPassword")
        new_pwd2 = data.get("newPassword2")
        if instance:
            if new_pwd != new_pwd2:
                return ErrorResponse(msg="Password mismatched twice")
            else:
                instance.password = make_password(new_pwd)
                instance.save()
                return DetailResponse(data=None, msg="Modification was successful")
        else:
            return ErrorResponse(msg="No user was obtained")

    def list(self, request, *args, **kwargs):
        dept_id = request.query_params.get('dept')
        show_all = request.query_params.get('show_all')
        if not dept_id:
            dept_id = ''
        if not show_all:
            show_all = 0
        if int(show_all):
            all_did = [dept_id]
            def inner(did):
                sub = Dept.objects.filter(parent_id=did)
                if not sub.exists():
                    return
                for i in sub:
                    all_did.append(i.pk)
                    inner(i)
            if dept_id != '':
                inner(dept_id)
                searchs = [
                    Q(**{f+'__icontains':i})
                    for f in self.search_fields
                ] if (i:=request.query_params.get('search')) else []
                q_obj = []
                if searchs:
                    q = searchs[0]
                    for i in searchs[1:]:
                        q |= i
                    q_obj.append(Q(q))
                queryset = Users.objects.filter(*q_obj, dept_id__in=all_did)
            else:
                queryset = self.filter_queryset(self.get_queryset())
        else:
            queryset = self.filter_queryset(self.get_queryset())
        # print(queryset.values('id','name','dept__id'))
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, request=request)
            # print(serializer.data)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, request=request)

        return SuccessResponse(data=serializer.data, msg="Get successful")
