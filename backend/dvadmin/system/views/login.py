import base64
import hashlib
from datetime import datetime, timedelta
from captcha.views import CaptchaStore, captcha_image
from django.contrib import auth
from django.contrib.auth import login
from django.contrib.auth.hashers import check_password, make_password
from django.db.models import Q
from django.shortcuts import redirect
from django.utils.translation import gettext_lazy as _
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from application import dispatch
from dvadmin.system.models import Users
from dvadmin.utils.json_response import ErrorResponse, DetailResponse
from dvadmin.utils.request_util import save_login_log
from dvadmin.utils.serializers import CustomModelSerializer
from dvadmin.utils.validator import CustomValidationError


class CaptchaView(APIView):
    authentication_classes = []
    permission_classes = []

    @swagger_auto_schema(
        responses={"200": openapi.Response("Get successful")},
        security=[],
        operation_id="captcha-get",
        operation_description="Verification code acquisition",
    )
    def get(self, request):
        data = {}
        if dispatch.get_system_config_values("base.captcha_state"):
            hashkey = CaptchaStore.generate_key()
            id = CaptchaStore.objects.filter(hashkey=hashkey).first().id
            imgage = captcha_image(request, hashkey)
            # Convert the image tobase64
            image_base = base64.b64encode(imgage.content)
            data = {
                "key": id,
                "image_base": "data:image/png;base64," + image_base.decode("utf-8"),
            }
        return DetailResponse(data=data)


class LoginSerializer(TokenObtainPairSerializer):
    """
    Login serializer:
    Rewritedjangorestframework-simplejwtSerializer
    """
    captcha = serializers.CharField(
        max_length=6, required=False, allow_null=True, allow_blank=True
    )

    class Meta:
        model = Users
        fields = "__all__"
        read_only_fields = ["id"]

    default_error_messages = {"no_active_account": _("account/Error password")}

    def validate(self, attrs):
        captcha = self.initial_data.get("captcha", None)
        if dispatch.get_system_config_values("base.captcha_state"):
            if captcha is None:
                raise CustomValidationError("The verification code cannot be empty")
            self.image_code = CaptchaStore.objects.filter(
                id=self.initial_data["captchaKey"]
            ).first()
            five_minute_ago = datetime.now() - timedelta(hours=0, minutes=5, seconds=0)
            if self.image_code and five_minute_ago > self.image_code.expiration:
                self.image_code and self.image_code.delete()
                raise CustomValidationError("Verification code expires")
            else:
                if self.image_code and (
                    self.image_code.response == captcha
                    or self.image_code.challenge == captcha
                ):
                    self.image_code and self.image_code.delete()
                else:
                    self.image_code and self.image_code.delete()
                    raise CustomValidationError("Image verification code error")
        try:
            user = Users.objects.get(
                Q(username=attrs['username']) | Q(email=attrs['username']) | Q(mobile=attrs['username']))
        except Users.DoesNotExist:
            raise CustomValidationError("The account you are logged in does not exist")
        except Users.MultipleObjectsReturned:
            raise CustomValidationError("There are multiple accounts you logged in,Please contact the administrator to check the uniqueness of the login account")
        if not user.is_active:
            raise CustomValidationError("Account has been locked,Contact the administrator to unlock")
        try:
            # The username must be reset tousername,Otherwise, if you use your email address to log in, you will prompt an error in your password.
            attrs['username'] = user.username
            data = super().validate(attrs)
            data["username"] = self.user.username
            data["name"] = self.user.name
            data["userId"] = self.user.id
            data["avatar"] = self.user.avatar
            data['user_type'] = self.user.user_type
            data['pwd_change_count'] = self.user.pwd_change_count
            dept = getattr(self.user, 'dept', None)
            if dept:
                data['dept_info'] = {
                    'dept_id': dept.id,
                    'dept_name': dept.name,
                }
            role = getattr(self.user, 'role', None)
            if role:
                data['role_info'] = role.values('id', 'name', 'key')
            request = self.context.get("request")
            request.user = self.user
            # Log in log
            save_login_log(request=request)
            user.login_error_count = 0
            user.save()
            return {"code": 2000, "msg": "Request succeeded", "data": data}
        except Exception as e:
            user.login_error_count += 1
            if user.login_error_count >= 5:
                user.is_active = False
                user.save()
                raise CustomValidationError("Account has been locked,Contact the administrator to unlock")
            user.save()
            count = 5 - user.login_error_count
            raise CustomValidationError(f"account/Error password;Try again{count}Will be locked after the time~")


class LoginView(TokenObtainPairView):
    """
    Login interface
    """
    serializer_class = LoginSerializer
    permission_classes = []

    # def post(self, request, *args, **kwargs):
    #     # usernameIt is possible that it is not just the username，It may be another unique identifier for the user Phone number Mail
    #     username = request.data.get('username',None)
    #     if username is None:
    #         return ErrorResponse(msg="Error parameters")
    #     password = request.data.get('password',None)
    #     if password is None:
    #         return ErrorResponse(msg="Error parameters")
    #     captcha = request.data.get('captcha',None)
    #     if captcha is None:
    #         return ErrorResponse(msg="Error parameters")
    #     captchaKey = request.data.get('captchaKey',None)
    #     if captchaKey is None:
    #         return ErrorResponse(msg="Error parameters")
    #     if dispatch.get_system_config_values("base.captcha_state"):
    #         if captcha is None:
    #             raise CustomValidationError("The verification code cannot be empty")
    #         self.image_code = CaptchaStore.objects.filter(
    #             id=captchaKey
    #         ).first()
    #         five_minute_ago = datetime.now() - timedelta(hours=0, minutes=5, seconds=0)
    #         if self.image_code and five_minute_ago > self.image_code.expiration:
    #             self.image_code and self.image_code.delete()
    #             raise CustomValidationError("Verification code expires")
    #         else:
    #             if self.image_code and (
    #                     self.image_code.response == captcha
    #                     or self.image_code.challenge == captcha
    #             ):
    #                 self.image_code and self.image_code.delete()
    #             else:
    #                 self.image_code and self.image_code.delete()
    #                 raise CustomValidationError("Image verification code error")
    #     try:
    #         # Manually pass user Issued jwt-token
    #         user = Users.objects.get(username=username)
    #     except:
    #         return DetailResponse(msg='This account is not registered')
    #     # After acquiring the user，Verify password and issuetoken
    #     print(make_password(password),user.password)
    #     if check_password(make_password(password),user.password):
    #         return DetailResponse(msg='Error password')
    #     result = {
    #        "name":user.name,
    #         "userId":user.id,
    #         "avatar":user.avatar,
    #     }
    #     dept = getattr(user, 'dept', None)
    #     if dept:
    #         result['dept_info'] = {
    #             'dept_id': dept.id,
    #             'dept_name': dept.name,
    #             'dept_key': dept.key
    #         }
    #     role = getattr(user, 'role', None)
    #     if role:
    #         result['role_info'] = role.values('id', 'name', 'key')
    #     refresh = LoginSerializer.get_token(user)
    #     result["refresh"] = str(refresh)
    #     result["access"] = str(refresh.access_token)
    #     # Log in log
    #     request.user = user
    #     save_login_log(request=request)
    #     return DetailResponse(data=result,msg="Get successful")


class LoginTokenSerializer(TokenObtainPairSerializer):
    """
    Login serializer:
    """

    class Meta:
        model = Users
        fields = "__all__"
        read_only_fields = ["id"]

    default_error_messages = {"no_active_account": _("account/Incorrect password")}

    def validate(self, attrs):
        if not getattr(settings, "LOGIN_NO_CAPTCHA_AUTH", False):
            return {"code": 4000, "msg": "This interface is not yet enabled!", "data": None}
        data = super().validate(attrs)
        data["name"] = self.user.name
        data["userId"] = self.user.id
        return {"code": 2000, "msg": "Request succeeded", "data": data}


class LoginTokenView(TokenObtainPairView):
    """
    Log in to gettokeninterface
    """

    serializer_class = LoginTokenSerializer
    permission_classes = []


class LogoutView(APIView):
    def post(self, request):
        return DetailResponse(msg="Logout successfully")


class ApiLoginSerializer(CustomModelSerializer):
    """Interface document login-Serializer"""

    username = serializers.CharField()
    password = serializers.CharField()

    class Meta:
        model = Users
        fields = ["username", "password"]


class ApiLogin(APIView):
    """Login interface for interface document"""

    serializer_class = ApiLoginSerializer
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user_obj = auth.authenticate(
            request,
            username=username,
            password=hashlib.md5(password.encode(encoding="UTF-8")).hexdigest(),
        )
        if user_obj:
            login(request, user_obj)
            return redirect("/")
        else:
            return ErrorResponse(msg="account/Error password")
