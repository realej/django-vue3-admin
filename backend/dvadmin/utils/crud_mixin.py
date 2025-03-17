# -*- coding: utf-8 -*-
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny

from dvadmin.utils.json_response import DetailResponse


class FastCrudMixin:
    """
    Quick definitionCRUDGeneral method of data operation
    """
    # needCRUDFields of
    crud_fields = None
    # excludeCRUDFields of
    exclude_fields = None
    # CustomizeCRUDofJSON
    custom_crud_json = None
    # Need to be modifiedCRUDKey-value pairs
    crud_update_key_value = None

    # WillDjangoThe field type is processed asJStype
    def __handle_type(self, type):
        if type in ['BigAutoField', 'CharField']:
            return "input"
        if type == 'DateTimeField':
            return "datetime"
        if type == 'DateField':
            return "date"
        if type == 'IntegerField':
            return "number"
        if type == 'BooleanField':
            return "dict-switch"

    # Get field attribute information
    def __get_field_attribute(self):
        result = []
        queryset = self.get_queryset()
        __name = ""
        __verbose_name = ""
        __type = "text"
        # Judgment designationCRUDFields
        if self.crud_fields and type(self.crud_fields == list):
            for item in self.crud_fields:
                try:
                    field = queryset.model._meta.get_field(item)
                    field_type = field.get_internal_type()
                    __name = field.name
                    # Determine whether the type is a foreign key type,Foreign key types need to be obtained in a special wayverbose_name
                    if field_type in ['ForeignKey', 'OneToOneField', 'ManyToManyField']:
                        continue
                        # try:
                        #     verbose_name = Users._meta.get_field(str(field.name)).verbose_name
                        # except:
                        #     pass
                    else:
                        __verbose_name = field.verbose_name
                        __type = self.__handle_type(field_type)
                except:
                    continue
                result.append({"key": __name, "title": __verbose_name, "type": __type})
        else:
            # GetmodelAll fields and properties of
            model_fields = queryset.model._meta.get_fields()
            # Iterate through all field properties
            for field in model_fields:
                field_type = field.get_internal_type()
                __name = field.name
                # What to judge must be excludedCRUDFields
                if self.exclude_fields and type(self.exclude_fields == list):
                    if __name in self.exclude_fields:
                        continue
                # Determine whether the type is a foreign key type,Foreign key types need to be obtained in a special wayverbose_name
                if field_type in ['ForeignKey', 'OneToOneField', 'ManyToManyField']:
                    continue
                    # try:
                    #     verbose_name = Users._meta.get_field(str(field.name)).verbose_name
                    # except:
                    #     pass
                else:
                    __verbose_name = field.verbose_name
                    __type = self.__handle_type(field_type)
                result.append({"key": __name, "title": __verbose_name, "type": __type})
        return result

    #Getkey
    def __find_key(self,dct: dict,
                 target_key: str,
                 level: int = -1,
                 index: int = -1) -> tuple:
        """Find a key within a nested dictionary and return its level and index."""
        for k, v in dct.items():
            level += 1
            index += 1
            if k == target_key:
                return level, index
            elif isinstance(v, list):
                for i, dct_ in enumerate(v):
                    if isinstance(dct_, dict):
                        result = self.__find_key(dct_, target_key)
                        if result is not None:
                            return result
                    else:
                        continue
            elif isinstance(v, str) or isinstance(v, int) or isinstance(v, float):
                continue

    # Modify the dictionarykeyofvalue
    def __update_nested_dict(self,nested_dict: dict,
                           target_key: str,
                           new_value) -> dict:
        """Update a nested dictionary with a new value."""
        split_target_key = target_key.split('.')
        if len(split_target_key) > 1:
            new_dict = nested_dict[split_target_key[0]]
            for item in split_target_key[1:-1]:
                new_dict = new_dict[item]
            self.__update_nested_dict(new_dict, split_target_key[-1], new_value)
        else:
            nested_dict[target_key] = new_value
        return nested_dict

    # deal withcrud,returncolumns
    def __handle_crud(self):
        result = self.__get_field_attribute()
        columns = dict()
        for item in result:
            key = item.get('key')
            title = item.get('title')
            type = item.get('type')
            columns[key] = {
                "title": title,
                "key": key,
                "type": type
            }
        # For customcrudConfigure Merge
        if self.custom_crud_json and isinstance(self.custom_crud_json,dict):
            columns = columns | self.custom_crud_json
        # rightcurdMake modifications to configurations
        if self.crud_update_key_value and isinstance(self.crud_update_key_value,dict):
            for key, value in self.crud_update_key_value.items():
                columns = self.__update_nested_dict(columns,key,value)
        return columns
    @action(methods=['get'], detail=False,permission_classes=[AllowAny])
    def init_crud(self, request):
        self.permission_classes = [AllowAny]
        columns = self.__handle_crud()
        expose = "({expose,dict})=>{"
        ret = "return {"
        res = "}}"
        data = f"""{expose}
        {ret}
        columns:{columns}
        {res}
        """
        return DetailResponse(data=data)
