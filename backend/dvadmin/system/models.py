import hashlib
import os
from time import time
from pathlib import PurePosixPath

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from application import dispatch
from dvadmin.utils.models import CoreModel, table_prefix, get_custom_app_models


class Role(CoreModel):
    name = models.CharField(max_length=64, verbose_name="Role name", help_text="Role name")
    key = models.CharField(max_length=64, unique=True, verbose_name="Permission Characters", help_text="Permission Characters")
    sort = models.IntegerField(default=1, verbose_name="Role Order", help_text="Role Order")
    status = models.BooleanField(default=True, verbose_name="Role status", help_text="Role status")

    class Meta:
        db_table = table_prefix + "system_role"
        verbose_name = "Role List"
        verbose_name_plural = verbose_name
        ordering = ("sort",)


class CustomUserManager(UserManager):

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        user = super(CustomUserManager, self).create_superuser(username, email, password, **extra_fields)
        user.set_password(password)
        try:
            user.role.add(Role.objects.get(name="administrator"))
            user.save(using=self._db)
            return user
        except ObjectDoesNotExist:
            user.delete()
            raise ValidationError("Role`administrator`Does not exist, Creation failed, Please execute python first manage.py init")


class Users(CoreModel, AbstractUser):
    username = models.CharField(max_length=150, unique=True, db_index=True, verbose_name="User account",
                                help_text="User account")
    email = models.EmailField(max_length=255, verbose_name="Mail", null=True, blank=True, help_text="Mail")
    mobile = models.CharField(max_length=255, verbose_name="Telephone", null=True, blank=True, help_text="Telephone")
    avatar = models.CharField(max_length=255, verbose_name="avatar", null=True, blank=True, help_text="avatar")
    name = models.CharField(max_length=40, verbose_name="Name", help_text="Name")
    GENDER_CHOICES = (
        (0, "unknown"),
        (1, "male"),
        (2, "female"),
    )
    gender = models.IntegerField(
        choices=GENDER_CHOICES, default=0, verbose_name="gender", null=True, blank=True, help_text="gender"
    )
    USER_TYPE = (
        (0, "Backend user"),
        (1, "Front Desk User"),
    )
    user_type = models.IntegerField(
        choices=USER_TYPE, default=0, verbose_name="User Type", null=True, blank=True, help_text="User Type"
    )
    post = models.ManyToManyField(to="Post", blank=True, verbose_name="Related positions", db_constraint=False,
                                  help_text="Related positions")
    role = models.ManyToManyField(to="Role", blank=True, verbose_name="Related roles", db_constraint=False,
                                  help_text="Related roles")
    dept = models.ForeignKey(
        to="Dept",
        verbose_name="Department",
        on_delete=models.PROTECT,
        db_constraint=False,
        null=True,
        blank=True,
        help_text="Related Departments",
    )
    login_error_count = models.IntegerField(default=0, verbose_name="Number of login errors", help_text="Number of login errors")
    pwd_change_count = models.IntegerField(default=0,blank=True, verbose_name="Password modification times", help_text="Password modification times")
    objects = CustomUserManager()

    def set_password(self, raw_password):
        super().set_password(hashlib.md5(raw_password.encode(encoding="UTF-8")).hexdigest())

    class Meta:
        db_table = table_prefix + "system_users"
        verbose_name = "User table"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)


class Post(CoreModel):
    name = models.CharField(null=False, max_length=64, verbose_name="Job Name", help_text="Job Name")
    code = models.CharField(max_length=32, verbose_name="Job code", help_text="Job code")
    sort = models.IntegerField(default=1, verbose_name="Job order", help_text="Job order")
    STATUS_CHOICES = (
        (0, "Leaving"),
        (1, "On-the-job"),
    )
    status = models.IntegerField(choices=STATUS_CHOICES, default=1, verbose_name="Job status", help_text="Job status")

    class Meta:
        db_table = table_prefix + "system_post"
        verbose_name = "Job list"
        verbose_name_plural = verbose_name
        ordering = ("sort",)


class Dept(CoreModel):
    name = models.CharField(max_length=64, verbose_name="Department name", help_text="Department name")
    key = models.CharField(max_length=64, unique=True, null=True, blank=True, verbose_name="Association characters", help_text="Association characters")
    sort = models.IntegerField(default=1, verbose_name="Show sort", help_text="Show sort")
    owner = models.CharField(max_length=32, verbose_name="Person in charge", null=True, blank=True, help_text="Person in charge")
    phone = models.CharField(max_length=32, verbose_name="Contact number", null=True, blank=True, help_text="Contact number")
    email = models.EmailField(max_length=32, verbose_name="Mail", null=True, blank=True, help_text="Mail")
    status = models.BooleanField(default=True, verbose_name="Department status", null=True, blank=True, help_text="Department status")
    parent = models.ForeignKey(
        to="Dept",
        on_delete=models.CASCADE,
        default=None,
        verbose_name="Superior department",
        db_constraint=False,
        null=True,
        blank=True,
        help_text="Superior department",
    )

    @classmethod
    def recursion_all_dept(cls, dept_id: int, dept_all_list=None, dept_list=None):
        """
        Recursively obtain all subordinate departments of the department
        :param dept_id: The id that needs to be obtained
        :param dept_all_list: All Lists
        :param dept_list: Recursive list
        :return:
        """
        if not dept_all_list:
            dept_all_list = Dept.objects.values("id", "parent")
        if dept_list is None:
            dept_list = [dept_id]
        for ele in dept_all_list:
            if ele.get("parent") == dept_id:
                dept_list.append(ele.get("id"))
                cls.recursion_all_dept(ele.get("id"), dept_all_list, dept_list)
        return list(set(dept_list))

    class Meta:
        db_table = table_prefix + "system_dept"
        verbose_name = "Department list"
        verbose_name_plural = verbose_name
        ordering = ("sort",)


class Menu(CoreModel):
    parent = models.ForeignKey(
        to="Menu",
        on_delete=models.CASCADE,
        verbose_name="Advanced menu",
        null=True,
        blank=True,
        db_constraint=False,
        help_text="Advanced menu",
    )
    icon = models.CharField(max_length=64, verbose_name="Menu icon", null=True, blank=True, help_text="Menu icon")
    name = models.CharField(max_length=64, verbose_name="Menu name", help_text="Menu name")
    sort = models.IntegerField(default=1, verbose_name="Show sort", null=True, blank=True, help_text="Show sort")
    ISLINK_CHOICES = (
        (0, "no"),
        (1, "yes"),
    )
    is_link = models.BooleanField(default=False, verbose_name="Is it an external link", help_text="Is it an external link")
    link_url = models.CharField(max_length=255, verbose_name="Link address", null=True, blank=True, help_text="Link address")
    is_catalog = models.BooleanField(default=False, verbose_name="Whether to directory", help_text="Whether to directory")
    web_path = models.CharField(max_length=128, verbose_name="Routing address", null=True, blank=True, help_text="Routing address")
    component = models.CharField(max_length=128, verbose_name="Component address", null=True, blank=True, help_text="Component address")
    component_name = models.CharField(max_length=50, verbose_name="Component name", null=True, blank=True,
                                      help_text="Component name")
    status = models.BooleanField(default=True, blank=True, verbose_name="Menu Status", help_text="Menu Status")
    cache = models.BooleanField(default=False, blank=True, verbose_name="Whether the page is cached", help_text="Whether the page is cached")
    visible = models.BooleanField(default=True, blank=True, verbose_name="Is it displayed in the sidebar",
                                  help_text="Is it displayed in the sidebar")
    is_iframe = models.BooleanField(default=False, blank=True, verbose_name="Outside the frame display", help_text="Outside the frame display")
    is_affix = models.BooleanField(default=False, blank=True, verbose_name="Is it fixed or not", help_text="Is it fixed or not")

    @classmethod
    def get_all_parent(cls, id: int, all_list=None, nodes=None):
        """
        Recursively get all levels of a given ID
        :param id: Parameter ID
        :param all_list: All Lists
        :param nodes: Recursive list
        :return: nodes
        """
        if not all_list:
            all_list = Menu.objects.values("id", "name", "parent")
        if nodes is None:
            nodes = []
        for ele in all_list:
            if ele.get("id") == id:
                parent_id = ele.get("parent")
                if parent_id is not None:
                    cls.get_all_parent(parent_id, all_list, nodes)
                nodes.append(ele)
        return nodes
    class Meta:
        db_table = table_prefix + "system_menu"
        verbose_name = "Menu Table"
        verbose_name_plural = verbose_name
        ordering = ("sort",)

class MenuField(CoreModel):
    model = models.CharField(max_length=64, verbose_name='Table name')
    menu = models.ForeignKey(to='Menu', on_delete=models.CASCADE, verbose_name='menu', db_constraint=False)
    field_name = models.CharField(max_length=64, verbose_name='Model table field name')
    title = models.CharField(max_length=64, verbose_name='Field display name')
    class Meta:
        db_table = table_prefix + "system_menu_field"
        verbose_name = "Menu field table"
        verbose_name_plural = verbose_name
        ordering = ("id",)

class FieldPermission(CoreModel):
    role = models.ForeignKey(to='Role', on_delete=models.CASCADE, verbose_name='Role', db_constraint=False)
    field = models.ForeignKey(to='MenuField', on_delete=models.CASCADE,related_name='menu_field', verbose_name='Fields', db_constraint=False)
    is_query = models.BooleanField(default=1, verbose_name='Is it possible to query')
    is_create = models.BooleanField(default=1, verbose_name='Is it possible to create')
    is_update = models.BooleanField(default=1, verbose_name='Is it updating possible')

    class Meta:
        db_table = table_prefix + "system_field_permission"
        verbose_name = "Field permission table"
        verbose_name_plural = verbose_name
        ordering = ("id",)


class MenuButton(CoreModel):
    menu = models.ForeignKey(
        to="Menu",
        db_constraint=False,
        related_name="menuPermission",
        on_delete=models.CASCADE,
        verbose_name="Related menu",
        help_text="Related menu",
    )
    name = models.CharField(max_length=64, verbose_name="name", help_text="name")
    value = models.CharField(unique=True, max_length=64, verbose_name="Permission value", help_text="Permission value")
    api = models.CharField(max_length=200, verbose_name="Interface address", help_text="Interface address")
    METHOD_CHOICES = (
        (0, "GET"),
        (1, "POST"),
        (2, "PUT"),
        (3, "DELETE"),
    )
    method = models.IntegerField(default=0, verbose_name="Interface request method", null=True, blank=True,
                                 help_text="Interface request method")

    class Meta:
        db_table = table_prefix + "system_menu_button"
        verbose_name = "Menu permission table"
        verbose_name_plural = verbose_name
        ordering = ("-name",)


class RoleMenuPermission(CoreModel):
    role = models.ForeignKey(
        to="Role",
        db_constraint=False,
        related_name="role_menu",
        on_delete=models.CASCADE,
        verbose_name="Related roles",
        help_text="Related roles",
    )
    menu = models.ForeignKey(
        to="Menu",
        db_constraint=False,
        related_name="role_menu",
        on_delete=models.CASCADE,
        verbose_name="Related menu",
        help_text="Related menu",
    )

    class Meta:
        db_table = table_prefix + "role_menu_permission"
        verbose_name = "Role menu permission table"
        verbose_name_plural = verbose_name
        # ordering = ("-create_datetime",)


class RoleMenuButtonPermission(CoreModel):
    role = models.ForeignKey(
        to="Role",
        db_constraint=False,
        related_name="role_menu_button",
        on_delete=models.CASCADE,
        verbose_name="Related roles",
        help_text="Related roles",
    )
    menu_button = models.ForeignKey(
        to="MenuButton",
        db_constraint=False,
        related_name="menu_button_permission",
        on_delete=models.CASCADE,
        verbose_name="Association Menu Button",
        help_text="Association Menu Button",
        null=True,
        blank=True
    )
    DATASCOPE_CHOICES = (
        (0, "Only the data permissions"),
        (1, "This department and the following data permissions"),
        (2, "Data permissions of this department"),
        (3, "All data permissions"),
        (4, "Custom data permissions"),
    )
    data_range = models.IntegerField(default=0, choices=DATASCOPE_CHOICES, verbose_name="Data permission range",
                                     help_text="Data permission range")
    dept = models.ManyToManyField(to="Dept", blank=True, verbose_name="Data permissions-Related Departments", db_constraint=False,
                                  help_text="Data permissions-Related Departments")

    class Meta:
        db_table = table_prefix + "role_menu_button_permission"
        verbose_name = "Role Button Permission Table"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)


class Dictionary(CoreModel):
    TYPE_LIST = (
        (0, "text"),
        (1, "number"),
        (2, "date"),
        (3, "datetime"),
        (4, "time"),
        (5, "files"),
        (6, "boolean"),
        (7, "images"),
    )
    label = models.CharField(max_length=100, blank=True, null=True, verbose_name="Dictionary name", help_text="Dictionary name")
    value = models.CharField(max_length=200, blank=True, null=True, verbose_name="Dictionary number", help_text="Dictionary number/Actual value")
    parent = models.ForeignKey(
        to="self",
        related_name="sublist",
        db_constraint=False,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        verbose_name="Parent",
        help_text="Parent",
    )
    type = models.IntegerField(choices=TYPE_LIST, default=0, verbose_name="Data value type", help_text="Data value type")
    color = models.CharField(max_length=20, blank=True, null=True, verbose_name="color", help_text="color")
    is_value = models.BooleanField(default=False, verbose_name="Whether it is a value value",
                                   help_text="Whether it is a value value,Used to store specific values")
    status = models.BooleanField(default=True, verbose_name="state", help_text="state")
    sort = models.IntegerField(default=1, verbose_name="Show sort", null=True, blank=True, help_text="Show sort")
    remark = models.CharField(max_length=2000, blank=True, null=True, verbose_name="Remark", help_text="Remark")

    class Meta:
        db_table = table_prefix + "system_dictionary"
        verbose_name = "Dictionary table"
        verbose_name_plural = verbose_name
        ordering = ("sort",)

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        super().save(force_insert, force_update, using, update_fields)
        dispatch.refresh_dictionary()  # Refresh the dictionary configuration if there is update

    def delete(self, using=None, keep_parents=False):
        res = super().delete(using, keep_parents)
        dispatch.refresh_dictionary()
        return res


class OperationLog(CoreModel):
    request_modular = models.CharField(max_length=64, verbose_name="Request module", null=True, blank=True,
                                       help_text="Request module")
    request_path = models.CharField(max_length=400, verbose_name="Request address", null=True, blank=True,
                                    help_text="Request address")
    request_body = models.TextField(verbose_name="Request parameters", null=True, blank=True, help_text="Request parameters")
    request_method = models.CharField(max_length=8, verbose_name="Request method", null=True, blank=True,
                                      help_text="Request method")
    request_msg = models.TextField(verbose_name="Operation Instructions", null=True, blank=True, help_text="Operation Instructions")
    request_ip = models.CharField(max_length=32, verbose_name="Request an IP address", null=True, blank=True,
                                  help_text="Request an IP address")
    request_browser = models.CharField(max_length=64, verbose_name="Request a browser", null=True, blank=True,
                                       help_text="Request a browser")
    response_code = models.CharField(max_length=32, verbose_name="Response status code", null=True, blank=True,
                                     help_text="Response status code")
    request_os = models.CharField(max_length=64, verbose_name="operating system", null=True, blank=True, help_text="operating system")
    json_result = models.TextField(verbose_name="Return information", null=True, blank=True, help_text="Return information")
    status = models.BooleanField(default=False, verbose_name="Response status", help_text="Response status")

    class Meta:
        db_table = table_prefix + "system_operation_log"
        verbose_name = "Operation log"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)


def media_file_name(instance, filename):
    h = instance.md5sum
    basename, ext = os.path.splitext(filename)
    return os.path.join("files", h[:1], h[1:2], h + ext.lower())


class FileList(CoreModel):
    name = models.CharField(max_length=200, null=True, blank=True, verbose_name="name", help_text="name")
    url = models.FileField(upload_to=media_file_name, null=True, blank=True,)
    file_url = models.CharField(max_length=255, blank=True, verbose_name="File address", help_text="File address")
    engine = models.CharField(max_length=100, default='local', blank=True, verbose_name="engine", help_text="engine")
    mime_type = models.CharField(max_length=100, blank=True, verbose_name="Mime Type", help_text="Mime Type")
    size = models.CharField(max_length=36, blank=True, verbose_name="File size", help_text="File size")
    md5sum = models.CharField(max_length=36, blank=True, verbose_name="File md5", help_text="File md5")
    UPLOAD_METHOD_CHOIDES = (
        (0, 'Upload by default'),
        (1, 'File selector upload'),
    )
    upload_method = models.SmallIntegerField(default=0, blank=True, null=True, choices=UPLOAD_METHOD_CHOIDES, verbose_name='Upload method', help_text='Upload method')
    FILE_TYPE_CHOIDES = (
        (0, 'picture'),
        (1, 'video'),
        (2, 'Audio'),
        (3, 'other'),
    )
    file_type = models.SmallIntegerField(default=3, choices=FILE_TYPE_CHOIDES, blank=True, null=True, verbose_name='File Type', help_text='File Type')

    def save(self, *args, **kwargs):
        if not self.md5sum:  # file is new
            md5 = hashlib.md5()
            for chunk in self.url.chunks():
                md5.update(chunk)
            self.md5sum = md5.hexdigest()
        if not self.size:
            self.size = self.url.size
        if not self.file_url:
            url = media_file_name(self, self.name)
            self.file_url = f'media/{url}'
        super(FileList, self).save(*args, **kwargs)

    class Meta:
        db_table = table_prefix + "system_file_list"
        verbose_name = "File Management"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)


class Area(CoreModel):
    name = models.CharField(max_length=100, verbose_name="name", help_text="name")
    code = models.CharField(max_length=20, verbose_name="Regional code", help_text="Regional code", unique=True, db_index=True)
    level = models.BigIntegerField(verbose_name="Regional level(1 province 2 cities 3 districts and counties 4 township level)",
                                   help_text="Regional level (1 province, 2 cities, 3 districts, 4 township levels)")
    pinyin = models.CharField(max_length=255, verbose_name="Pinyin", help_text="Pinyin")
    initials = models.CharField(max_length=20, verbose_name="First letter", help_text="First letter")
    enable = models.BooleanField(default=True, verbose_name="Whether to enable", help_text="Whether to enable")
    pcode = models.ForeignKey(
        to="self",
        verbose_name="Parent area code",
        to_field="code",
        on_delete=models.CASCADE,
        db_constraint=False,
        null=True,
        blank=True,
        help_text="Parent area code",
    )

    class Meta:
        db_table = table_prefix + "system_area"
        verbose_name = "Regional Table"
        verbose_name_plural = verbose_name
        ordering = ("code",)

    def __str__(self):
        return f"{self.name}"


class ApiWhiteList(CoreModel):
    url = models.CharField(max_length=200, help_text="URL address", verbose_name="url")
    METHOD_CHOICES = (
        (0, "GET"),
        (1, "POST"),
        (2, "PUT"),
        (3, "DELETE"),
    )
    method = models.IntegerField(default=0, verbose_name="Interface request method", null=True, blank=True,
                                 help_text="Interface request method")
    enable_datasource = models.BooleanField(default=True, verbose_name="Activate data permissions", help_text="Activate data permissions",
                                            blank=True)

    class Meta:
        db_table = table_prefix + "api_white_list"
        verbose_name = "Interface whitelist"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)


class SystemConfig(CoreModel):
    parent = models.ForeignKey(
        to="self",
        verbose_name="Parent",
        on_delete=models.CASCADE,
        db_constraint=False,
        null=True,
        blank=True,
        help_text="Parent",
    )
    title = models.CharField(max_length=50, verbose_name="title", help_text="title")
    key = models.CharField(max_length=100, verbose_name="key", help_text="key", db_index=True)
    value = models.JSONField(max_length=100, verbose_name="value", help_text="value", null=True, blank=True)
    sort = models.IntegerField(default=0, verbose_name="Sort", help_text="Sort", blank=True)
    status = models.BooleanField(default=True, verbose_name="Enabled", help_text="Enabled")
    data_options = models.JSONField(verbose_name="Data options", help_text="Data options", null=True, blank=True)
    FORM_ITEM_TYPE_LIST = (
        (0, "text"),
        (1, "datetime"),
        (2, "date"),
        (3, "textarea"),
        (4, "select"),
        (5, "checkbox"),
        (6, "radio"),
        (7, "img"),
        (8, "file"),
        (9, "switch"),
        (10, "number"),
        (11, "array"),
        (12, "imgs"),
        (13, "foreignkey"),
        (14, "manytomany"),
        (15, "time"),
    )
    form_item_type = models.IntegerField(
        choices=FORM_ITEM_TYPE_LIST, verbose_name="Form Type", help_text="Form Type", default=0, blank=True
    )
    rule = models.JSONField(null=True, blank=True, verbose_name="Verification rules", help_text="Verification rules")
    placeholder = models.CharField(max_length=50, null=True, blank=True, verbose_name="Prompt information", help_text="Prompt information")
    setting = models.JSONField(null=True, blank=True, verbose_name="Configuration", help_text="Configuration")

    class Meta:
        db_table = table_prefix + "system_config"
        verbose_name = "System Configuration Table"
        verbose_name_plural = verbose_name
        ordering = ("sort",)
        unique_together = (("key", "parent_id"),)

    def __str__(self):
        return f"{self.title}"

    def save(self, force_insert=False, force_update=False, using=None, update_fields=None):
        super().save(force_insert, force_update, using, update_fields)
        dispatch.refresh_system_config()  # Refresh the system configuration if there is update

    def delete(self, using=None, keep_parents=False):
        res = super().delete(using, keep_parents)
        dispatch.refresh_system_config()
        return res


class LoginLog(CoreModel):
    LOGIN_TYPE_CHOICES = ((1, "Normal login"), (2, "Scan the QR code to log in on WeChat"),)
    username = models.CharField(max_length=32, verbose_name="Login username", null=True, blank=True, help_text="Login username")
    ip = models.CharField(max_length=32, verbose_name="Log in to ip", null=True, blank=True, help_text="Log in to ip")
    agent = models.TextField(verbose_name="agent information", null=True, blank=True, help_text="agent information")
    browser = models.CharField(max_length=200, verbose_name="Browser name", null=True, blank=True, help_text="Browser name")
    os = models.CharField(max_length=200, verbose_name="operating system", null=True, blank=True, help_text="operating system")
    continent = models.CharField(max_length=50, verbose_name="state", null=True, blank=True, help_text="state")
    country = models.CharField(max_length=50, verbose_name="nation", null=True, blank=True, help_text="nation")
    province = models.CharField(max_length=50, verbose_name="province", null=True, blank=True, help_text="province")
    city = models.CharField(max_length=50, verbose_name="City", null=True, blank=True, help_text="City")
    district = models.CharField(max_length=50, verbose_name="County", null=True, blank=True, help_text="County")
    isp = models.CharField(max_length=50, verbose_name="Operator", null=True, blank=True, help_text="Operator")
    area_code = models.CharField(max_length=50, verbose_name="Area Code", null=True, blank=True, help_text="Area Code")
    country_english = models.CharField(max_length=50, verbose_name="Full English name", null=True, blank=True,
                                       help_text="Full English name")
    country_code = models.CharField(max_length=50, verbose_name="Abbreviation", null=True, blank=True, help_text="Abbreviation")
    longitude = models.CharField(max_length=50, verbose_name="longitude", null=True, blank=True, help_text="longitude")
    latitude = models.CharField(max_length=50, verbose_name="latitude", null=True, blank=True, help_text="latitude")
    login_type = models.IntegerField(default=1, choices=LOGIN_TYPE_CHOICES, verbose_name="Login Type",
                                     help_text="Login Type")

    class Meta:
        db_table = table_prefix + "system_login_log"
        verbose_name = "Login log"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)


class MessageCenter(CoreModel):
    title = models.CharField(max_length=100, verbose_name="title", help_text="title")
    content = models.TextField(verbose_name="content", help_text="content")
    target_type = models.IntegerField(default=0, verbose_name="Target Type", help_text="Target Type")
    target_user = models.ManyToManyField(to=Users, related_name='user', through='MessageCenterTargetUser',
                                         through_fields=('messagecenter', 'users'), blank=True, verbose_name="Target user",
                                         help_text="Target user")
    target_dept = models.ManyToManyField(to=Dept, blank=True, db_constraint=False,
                                         verbose_name="Target Department", help_text="Target Department")
    target_role = models.ManyToManyField(to=Role, blank=True, db_constraint=False,
                                         verbose_name="Target role", help_text="Target role")

    class Meta:
        db_table = table_prefix + "message_center"
        verbose_name = "Message Center"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)


class MessageCenterTargetUser(CoreModel):
    users = models.ForeignKey(Users, related_name="target_user", on_delete=models.CASCADE, db_constraint=False,
                              verbose_name="Associated User Table", help_text="Associated User Table")
    messagecenter = models.ForeignKey(MessageCenter, on_delete=models.CASCADE, db_constraint=False,
                                      verbose_name="Associated Message Center Table", help_text="Associated Message Center Table")
    is_read = models.BooleanField(default=False, blank=True, null=True, verbose_name="Have you read it", help_text="Have you read it")

    class Meta:
        db_table = table_prefix + "message_center_target_user"
        verbose_name = "Message Center Target User Table"
        verbose_name_plural = verbose_name


def media_file_name_downloadcenter(instance:'DownloadCenter', filename):
    h = instance.md5sum
    basename, ext = os.path.splitext(filename)
    return PurePosixPath("files", "dlct", h[:1], h[1:2], basename + '-' + str(time()).replace('.', '') + ext.lower())


class DownloadCenter(CoreModel):
    TASK_STATUS_CHOICES = [
        (0, 'Task created'),
        (1, 'The task is in progress'),
        (2, 'Task completion'),
        (3, 'Mission failed'),
    ]
    task_name = models.CharField(max_length=255, verbose_name="Task Name", help_text="Task Name")
    task_status = models.SmallIntegerField(default=0, choices=TASK_STATUS_CHOICES, verbose_name='Is it possible to download', help_text='Is it possible to download')
    file_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="file name", help_text="file name")
    url = models.FileField(upload_to=media_file_name_downloadcenter, null=True, blank=True)
    size = models.BigIntegerField(default=0, verbose_name="File size", help_text="File size")
    md5sum = models.CharField(max_length=36, null=True, blank=True, verbose_name="File md5", help_text="File md5")

    def save(self, *args, **kwargs):
        if self.url:
            if not self.md5sum:  # file is new
                md5 = hashlib.md5()
                for chunk in self.url.chunks():
                    md5.update(chunk)
                self.md5sum = md5.hexdigest()
            if not self.size:
                self.size = self.url.size
        super(DownloadCenter, self).save(*args, **kwargs)

    class Meta:
        db_table = table_prefix + "download_center"
        verbose_name = "Download Center"
        verbose_name_plural = verbose_name
        ordering = ("-create_datetime",)
