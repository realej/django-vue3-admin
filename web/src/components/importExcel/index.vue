<template>
  <div style="display: inline-block">
    <el-button size="default" type="success" @click="handleImport()">
      <slot>Import</slot>
    </el-button>
    <el-dialog :title="props.upload.title" v-model="uploadShow" width="400px" append-to-body>
      <div v-loading="loading">
        <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="props.upload.headers"
            :action="props.upload.url"
            :disabled="isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
        >
          <i class="el-icon-upload"/>
          <div class="el-upload__text">
            Drag the file here，or
            <em>Click to upload</em>
          </div>
          <template #tip>
          <div  class="el-upload__tip" style="color:red">hint：Only imports are allowed“xls”or“xlsx”Format file！</div>
          </template>
        </el-upload>
        <div>
          <el-button type="warning" style="font-size:14px;margin-top: 20px" @click="importTemplate">Download the import template</el-button>
          <el-button type="warning" style="font-size:14px;margin-top: 20px" @click="updateTemplate">Batch update templates</el-button>
        </div>
      </div>
      <template #footer>
      <div  class="dialog-footer">
        <el-button type="primary" :disabled="loading" @click="submitFileForm">Confirm Certainly</el-button>
        <el-button :disabled="loading" @click="uploadShow = false">Pick remove</el-button>
      </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup name="importExcel">
import { request, downloadFile } from '/@/utils/service';
import {inject,ref} from "vue";
import { getBaseURL } from '/@/utils/baseUrl';
import { Session } from '/@/utils/storage';
import {  ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'
const refreshView = inject('refreshView')

let props = defineProps({
  upload: {
    type: Object,
    default () {
      return {
        // Whether to display the pop-up layer
        open: true,
        // Pop-up layer title
        title: '',
        // Whether to disable upload
        isUploading: false,
        // Whether to update existing user data
        updateSupport: 0,
        // Set up the uploaded request header
        headers: { Authorization: 'JWT ' + Session.get('token') },
        // Uploaded address
        url: getBaseURL() + 'api/system/file/'
      }
    }
  },
  api: { // Import interface address
    type: String,
    default () {
      return undefined
    }
  }
})

let loading = ref(false)
const uploadRef = ref()
const uploadShow = ref(false)
const isUploading = ref(false)
/** Import button operation */
const handleImport = function () {
  uploadShow.value = true
}

/** Download template operation */
const importTemplate=function () {
  downloadFile({
    url: props.api + 'import_data/',
    params: {},
    method: 'get'
  })
}
/***
 * Batch update templates
 */
const updateTemplate=function () {
  downloadFile({
    url: props.api + 'update_template/',
    params: {},
    method: 'get'
  })
}
// Processing during file upload
const handleFileUploadProgress=function (event:any, file:any, fileList:any) {
  isUploading.value = true
}
// File upload successfully processed
const handleFileSuccess=function (response:any, file:any, fileList:any) {
  isUploading.value = false
  loading.value = true
  uploadRef.value.clearFiles()
  // Whether to update existing user data
  return request({
    url: props.api + 'import_data/',
    method: 'post',
    data: {
      url: response.data.url
    }
  }).then((response:any) => {
    loading.value = false
    ElMessageBox.alert('Import successfully', 'Importing is complete', {
      confirmButtonText: 'OK',
      callback: (action: Action) => {
        refreshView()
      },
    })
  }).catch(()=>{
    loading.value = false
  })

}
// Submit upload file
const submitFileForm=function () {
  uploadRef.value.submit()
}

</script>

<style scoped>

</style>
