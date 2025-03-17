<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="4">Variable Title</el-col>
      <el-col :span="4">Variable Name</el-col>
      <el-col :span="10">Variable Value</el-col>
      <el-col :span="2" :offset="1">Frontend Configurable</el-col>
      <el-col :span="3">Actions</el-col>
    </el-row>
    <el-form ref="formRef" :model="formData" label-width="0px" label-position="left" style="margin-top: 20px">
      <el-form-item
          :prop="['array'].indexOf(item.form_item_type_label) > -1 ? '' : item.key"
          :key="index"
          :rules="item.rule || []"
          v-for="(item, index) in formList"
      >
        <el-col :span="4">
          <el-input v-if="item.edit" v-model="item.title" style="display: inline-block; width: 200px" placeholder="Please enter a title"></el-input>
          <span v-else>{{ item.title }}</span>
        </el-col>
        <el-col :span="4" >
          <el-input v-if="item.edit" v-model="item.new_key" style="width: 200px" placeholder="Please enter variable key">
            <template slot="prepend">
              <span style="padding: 0px 5px">{{ editableTabsItem.key }}</span>
            </template>
          </el-input>
          <span v-else>{{ editableTabsItem.key }}.{{ item.key }}</span>
        </el-col>
        <el-col :span="10">
          <!-- Text -->
          <el-input
              :key="index"
              v-if="['text', 'textarea'].indexOf(item.form_item_type_label) > -1"
              :type="item.form_item_type_label"
              v-model="formData[item.key]"
              :placeholder="item.placeholder"
              clearable
          ></el-input>

          <el-input-number :key="index + 1" v-else-if="item.form_item_type_label === 'number'" v-model="formData[item.key]" :min="0"></el-input-number>
          <!-- Datetime, Date, Time -->
          <el-date-picker
              v-else-if="['datetime', 'date', 'time'].indexOf(item.form_item_type_label) > -1"
              v-model="formData[item.key]"
              :key="index + 2"
              :type="item.form_item_type_label"
              :placeholder="item.placeholder"
          >
          </el-date-picker>
          <!-- Select -->
          <el-select
              :key="index + 3"
              v-else-if="item.form_item_type_label === 'select'"
              v-model="formData[item.key]"
              :placeholder="item.placeholder"
              clearable
          >
            <el-option v-for="item in dictionary(item.setting) || []" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
          <!-- Checkbox -->
          <el-checkbox-group
              :key="index + 4"
              v-else-if="item.form_item_type_label === 'checkbox'"
              v-model="formData[item.key]"
              :placeholder="item.placeholder"
          >
            <el-checkbox v-for="item in dictionary(item.setting) || []" :key="item.value" :label="item.value" :value="item.value">
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
          <!-- Radio -->
          <el-radio-group
              :key="index + 5"
              v-else-if="item.form_item_type_label === 'radio'"
              v-model="formData[item.key]"
              :placeholder="item.placeholder"
              clearable
          >
            <el-radio v-for="item in dictionary(item.setting) || []" :key="item.value" :label="item.value" :value="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
          <!-- Switch -->
          <el-switch
              :key="index + 6"
              v-else-if="item.form_item_type_label === 'switch'"
              v-model="formData[item.key]"
              :inactive-value="false"
              active-color="#13ce66"
              inactive-color="#ff4949"
          >
          </el-switch>
          <!-- Image -->
          <div v-else-if="['img', 'imgs'].indexOf(item.form_item_type_label) > -1" :key="index + 7">
            <el-upload
                :action="uploadUrl"
                :headers="uploadHeaders"
                name="file"
                :accept="'image/*'"
                :on-preview="handlePictureCardPreview"
                :on-success="
                                (response:any, file:any, fileList:any) => {
                                    handleUploadSuccess(response, file, fileList, item.key);
                                }
                            "
                :on-error="handleError"
                :on-exceed="handleExceed"
                :before-remove="
                                (file:any, fileList:any) => {
                                    beforeRemove(file, fileList, item.key);
                                }
                            "
                :multiple="item.form_item_type_label !== 'img'"
                :limit="item.form_item_type_label === 'img' ? 1 : 5"
                :ref="'imgUpload_' + item.key"
                :data-keyname="item.key"
                :file-list="item.value ? item.value : []"
                list-type="picture-card"
            >
              <i class="el-icon-plus"></i>
              <div slot="tip" class="el-upload__tip">Please select an image, only jpg/png files can be uploaded</div>
            </el-upload>
            <el-dialog :visible.sync="dialogImgVisible">
              <img width="100%" :src="dialogImageUrl" alt="" />
            </el-dialog>
          </div>
          <!-- File -->
          <div v-else-if="['file'].indexOf(item.form_item_type_label) > -1" :key="index + 8">
            <el-upload
                :action="uploadUrl"
                :headers="uploadHeaders"
                name="file"
                :on-preview="handlePictureCardPreview"
                :on-success="
                                (response:any, file:any, fileList:any) => {
                                    handleUploadSuccess(response, file, fileList, item.key);
                                }
                            "
                :on-error="handleError"
                :on-exceed="handleExceed"
                :before-remove="
                                (file:any, fileList:any) => {
                                    beforeRemove(file, fileList, item.key);
                                }
                            "
                :limit="5"
                :ref="'fileUpload_' + item.key"
                :data-keyname="item.key"
                :file-list="item.value"
                list-type="picture-card"
            >
              <i class="el-icon-plus"></i>
              <div slot="tip" class="el-upload__tip">Please select an image, only jpg/png files can be uploaded</div>
            </el-upload>
            <el-dialog :visible.sync="dialogImgVisible">
              <img width="100%" :src="dialogImageUrl" alt="" />
            </el-dialog>
          </div>
          <!-- Foreign Key / Many-to-Many -->
          <div v-else-if="['foreignkey', 'manytomany'].indexOf(item.form_item_type_label) > -1" :key="index + 9">
            <table-selector
                v-model="formData[item.key]"
                :el-props="{
                                pagination: true,
                                columns: item.setting.searchField,
                            }"
                :dict="{
                                url: '/api/system/system_config/get_table_data/' + item.id + '/',
                                value: item.setting.primarykey,
                                label: item.setting.field,
                            }"
                :pagination="true"
                :multiple="item.form_item_type_label === 'manytomany'"
            ></table-selector>
          </div>
          <!-- Array -->
          <div v-else-if="item.form_item_type_label === 'array'" :key="index + 10">
            <vxe-table
                border
                resizable
                auto-resize
                show-overflow
                keep-source
                :ref="'xTable_' + item.key"
                height="200"
                :edit-rules="validRules"
                :edit-config="{ trigger: 'click', mode: 'row', showStatus: true }"
            >
              <vxe-column field="title" title="Title" :edit-render="{ autofocus: '.vxe-input--inner' }">
                <template #edit="{ row }">
                  <vxe-input v-model="row.title" type="text"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="key" title="Key" :edit-render="{ autofocus: '.vxe-input--inner' }">
                <template #edit="{ row }">
                  <vxe-input v-model="row.key" type="text"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="value" title="Value" :edit-render="{}">
                <template #edit="{ row }">
                  <vxe-input v-model="row.value" type="text"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column title="Actions" width="100" show-overflow>
                <template #default="{ row, index }">
                  <el-popover placement="top" width="160" v-model="childRemoveVisible">
                    <p>Cannot be recovered after deletion, are you sure?</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="childRemoveVisible = false">Cancel</el-button>
                      <el-button type="primary" size="mini" @click="onRemoveChild(row, index, item.key)">Confirm</el-button>
                    </div>
                    <el-button type="text" slot="reference">Delete</el-button>
                  </el-popover>
                </template>
              </vxe-column>
            </vxe-table>
            <div>
              <el-button size="mini" @click="onAppend('xTable_' + item.key)">Append</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="2" :offset="1">
          <el-switch v-model="item.status" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
        </el-col>
        <el-col :span="3">
          <el-button v-if="item.edit" size="mini" type="primary" :icon="Finished" @click="onEditSave(item)">Save</el-button>
          <el-button v-else size="mini" type="primary" :icon="Edit" @click="onEdit(index)"></el-button>
          <el-popconfirm title="Are you sure you want to delete this data?" @confirm="onDelRow(item)">
            <template #reference>
              <el-button size="mini" type="danger" :icon="Delete" ></el-button>
            </template>
          </el-popconfirm>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit(formRef)">Confirm</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import * as api from '../api';
import { dictionary } from '/@/utils/dictionary';
import { getBaseURL } from '/@/utils/baseUrl';
import { ref, reactive, watch, nextTick, inject } from 'vue';
import type { FormInstance, FormRules, TableInstance } from 'element-plus';
import { successMessage, errorMessage } from '/@/utils/message';
import { Session } from '/@/utils/storage';
import { Edit, Finished, Delete } from "@element-plus/icons-vue";
const props = defineProps(['options', 'editableTabsItem']);

let formData: any = reactive({});
let formList: any = ref([]);
let childTableData = ref([]);
let childRemoveVisible = ref(false);
const validRules = reactive<FormRules>({
  title: [
    {
      required: true,
      message: 'Must be filled',
    },
  ],
  key: [
    {
      required: true,
      message: 'Must be filled',
    },
  ],
  value: [
    {
      required: true,
      message: 'Must be filled',
    },
  ],
});
const formRef = ref<FormInstance>();
let uploadUrl = ref(getBaseURL() + 'api/system/file/');
let uploadHeaders = ref({
  Authorization: 'JWT ' + Session.get('token'),
});
let dialogImageUrl = ref('');
let dialogImgVisible = ref(false);
let uploadImgKey = ref(null);

// Fetch initial data
const getInit = () => {
  api.GetList({ parent: props.options.id, limit: 999 }).then((res: any) => {
    let data = res.data;
    formList.value = data;
    const _formData: any = {};
    for (const item of data) {
      const key = item.key;
      if (item.value) {
        _formData[key] = item.value;
      } else {
        if ([5, 12, 14].indexOf(item.form_item_type) !== -1) {
          _formData[key] = [];
        } else {
          _formData[key] = item.value;
        }
      }
      if (item.form_item_type_label === 'array') {
        console.log('test');
        nextTick(() => {
          const tableName = 'xTable_' + key;
          const tabelRef = ref<TableInstance>();
          console.log(tabelRef);
        });
      }
    }
    formData = Object.assign(formData, _formData);
  });
};

// Submit data
const onSubmit = (formEl: FormInstance | undefined) => {
  const keys = Object.keys(formData);
  const values = Object.values(formData);
  for (const index in formList.value) {
    const item = formList.value[index];
    const form_item_type_label = item.form_item_type_label;

    if (form_item_type_label === 'array') {
      const parentId = item.id;
      const tableName = 'xTable_' + item.key;
    }
    keys.map((mapKey, mapIndex) => {
      if (mapKey === item.key) {
        if (item.form_item_type_label !== 'array') {
          item.value = values[mapIndex];
        }
        if (['img', 'imgs'].indexOf(item.form_item_type_label) > -1) {
          for (const arr of item.rule) {
            if (arr.required && item.value === null) {
              errorMessage(item.title + ' cannot be empty');
              return;
            }
          }
        }
      }
    });
  }
  if (!formEl) return;
  formEl.validate((valid: any) => {
    if (valid) {
      api.saveContent(formList.value).then((res: any) => {
        successMessage('Saved successfully');
        refreshView && refreshView();
      });
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

// Append row
const onAppend = (tableName: any) => {
};

// Remove child row
const onRemoveChild = (row: any, index: any, refName: any) => {
  console.log(row, index);
  if (row.id) {
    api.DelObj(row.id).then((res: any) => {
    });
  }
};

// Image preview
const handlePictureCardPreview = (file: any) => {
  dialogImageUrl = file.url;
  dialogImgVisible.value = true;
};

// Check if file is an image
const isImage = (fileName: any) => {
  if (typeof fileName !== 'string') return;
  const name = fileName.toLowerCase();
  return name.endsWith('.png') || name.endsWith('.jpeg') || name.endsWith('.jpg') || name.endsWith('.bmp');
};

// Upload success handler
const handleUploadSuccess = (response: any, file: any, fileList: any, imgKey: any) => {
  const { code, msg } = response;
  if (code === 2000) {
    const { url } = response.data;
    const { name } = file;
    const type = isImage(name);
    if (!type) {
      errorMessage('Only image uploads allowed');
    } else {
      const uploadImgKey = formData[imgKey];
      if (!uploadImgKey || uploadImgKey === '') {
        formData[imgKey] = [];
      }
      const dict = {
        name: name,
        url: getBaseURL() + url,
      };
      formData[imgKey].push(dict);
    }
  } else {
    errorMessage('Upload failed, ' + JSON.stringify(msg));
  }
};

// Upload error handler
const handleError = () => {
  errorMessage('Upload failed');
};

// Upload exceed limit handler
const handleExceed = () => {
  errorMessage('Exceeded file upload limit');
};

// Before remove handler
const beforeRemove = (file: any, fileList: any, key: any) => {
  var index = 0;
  formData[key].map((value: any, inx: any) => {
    if (value.uid === file.uid) index = inx;
  });
  formData[key].splice(index, 1);
};

// Delete row
const onDelRow = (obj: any) => {
  api.DelObj(obj.id).then((res: any) => {
  });
};

// Edit row
const onEdit = (index: any) => {
  formList.value[index].edit = true;
  formList.value[index].new_key = formList.value[index].key;
};

// Save edited row
const refreshView = inject<Function>('refreshView');
const onEditSave = (obj: any) => {
  obj.key = JSON.parse(JSON.stringify(obj.new_key));
  api.UpdateObj(obj).then((res: any) => {
    refreshView && refreshView();
  });
};

watch(
    props.options,
    (nv) => {
      if (nv && nv.id) {
        getInit();
      }
    },
    { immediate: true }
);
</script>

<style scoped>
:deep(.el-upload-list--picture-card){
  text-align: center;
}
</style>