<template>
  <div style="width: 100%;" :class="props.class" :style="props.style">
    <slot name="input" v-bind="{}">
      <div v-if="props.showInput" style="width: 100%;" :class="props.inputClass" :style="props.inputStyle">
        <el-select v-if="props.inputType === 'selector'" v-model="data" suffix-icon="arrow-down" clearable
          :multiple="props.multiple" placeholder="Please select a file" @click="selectVisiable = true && !props.disabled"
          :disabled="props.disabled" @clear="selectedInit" @remove-tag="selectedInit">
          <el-option v-for="item, index in listAllData" :key="index" :value="String(item[props.valueKey])"
            :label="item.name" />
        </el-select>
        <div v-if="props.inputType === 'image'" style="position: relative;" class="form-display"
          @mouseenter="formDisplayEnter" @mouseleave="formDisplayLeave"
          :style="{ width: props.inputSize + 'px', height: props.inputSize + 'px' }">
          <el-image :src="data" fit="scale-down" :style="{ width: props.inputSize + 'px', aspectRatio: '1 / 1' }">
            <template #error>
              <div></div>
            </template>
          </el-image>
          <div v-show="!(!!data)"
            style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <el-icon :size="24">
              <Plus />
            </el-icon>
          </div>
          <div @click="selectVisiable = true && !props.disabled" class="addControllorHover"
            :style="{ cursor: props.disabled ? 'not-allowed' : 'pointer' }"></div>
          <el-icon v-show="!!data && !props.disabled" class="closeHover" :size="16" @click="clear">
            <Close />
          </el-icon>
        </div>
        <div v-if="props.inputType === 'video'" class="form-display" @mouseenter="formDisplayEnter"
          @mouseleave="formDisplayLeave"
          style="position: relative; display: flex; align-items: center;  justify-items: center;"
          :style="{ width: props.inputSize * 2 + 'px', height: props.inputSize + 'px' }">
          <video :src="data" :controls="false" :autoplay="true" :muted="true" :loop="true"
            :style="{ maxWidth: props.inputSize * 2 + 'px', maxHeight: props.inputSize + 'px', margin: '0 auto' }"></video>
          <div v-show="!(!!data)"
            style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <el-icon :size="24">
              <Plus />
            </el-icon>
          </div>
          <div @click="selectVisiable = true && !props.disabled" class="addControllorHover"
            :style="{ cursor: props.disabled ? 'not-allowed' : 'pointer' }"></div>
          <el-icon v-show="!!data && !props.disabled" class="closeHover" :size="16" @click="clear">
            <Close />
          </el-icon>
        </div>
        <div v-if="props.inputType === 'audio'" class="form-display" @mouseenter="formDisplayEnter"
          @mouseleave="formDisplayLeave"
          style="position: relative; display: flex; align-items: center;  justify-items: center;"
          :style="{ width: props.inputSize * 2 + 'px', height: props.inputSize + 'px' }">
          <audio :src="data" :controls="!!data" :autoplay="false" :muted="true" :loop="true"
            style="width: 100%; z-index: 1;"></audio>
          <div v-show="!(!!data)"
            style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <el-icon :size="24">
              <Plus />
            </el-icon>
          </div>
          <div @click="selectVisiable = true && !props.disabled" class="addControllorHover"
            :style="{ cursor: props.disabled ? 'not-allowed' : 'pointer' }"></div>
          <el-icon v-show="!!data && !props.disabled" class="closeHover" :size="16" @click="clear">
            <Close />
          </el-icon>
        </div>
      </div>
    </slot>
    <el-dialog v-model="selectVisiable" :draggable="true" width="50%" :align-center="false" :append-to-body="true"
      @open="if (listData.length === 0) listRequest();" @close="onClose" @closed="onClosed" modal-class="_overlay">
      <template #header>
        <span class="el-dialog__title">File selection</span>
        <el-divider style="margin: 0;" />
      </template>
      <div style="padding: 4px;">
        <div style="width: 100%; display: flex; justify-content: space-between; gap: 12px;">
          <el-tabs style="width: 100%;" v-model="tabsActived" :type="props.tabsType" :stretch="true"
            @tab-change="handleTabChange" v-if="!isSuperTenent">
            <el-tab-pane v-if="props.tabsShow & SHOW.IMAGE" :name="0" label="picture" />
            <el-tab-pane v-if="props.tabsShow & SHOW.VIDEO" :name="1" label="video" />
            <el-tab-pane v-if="props.tabsShow & SHOW.AUDIO" :name="2" label="Audio" />
            <el-tab-pane v-if="props.tabsShow & SHOW.OTHER" :name="3" label="other" />
          </el-tabs>
          <el-tabs style="width: 100%;" v-model="tabsActived" :type="props.tabsType" :stretch="true"
            @tab-change="handleTabChange" v-if="isTenentMode">
            <el-tab-pane v-if="props.tabsShow & SHOW.IMAGE" :name="4" label="System Picture" />
            <el-tab-pane v-if="props.tabsShow & SHOW.VIDEO" :name="5" label="System Video" />
            <el-tab-pane v-if="props.tabsShow & SHOW.AUDIO" :name="6" label="System audio" />
            <el-tab-pane v-if="props.tabsShow & SHOW.OTHER" :name="7" label="Other system" />
          </el-tabs>
        </div>
        <el-row justify="space-between" class="headerBar">
          <el-col :span="12">
            <slot name="actionbar-left">
              <el-input v-model="filterForm.name" :placeholder="`Please enter${TypeLabel[tabsActived % 4]}name`"
                prefix-icon="search" clearable @change="listRequest" />
              <div>
                <el-tag v-if="props.multiple" type="primary" effect="light">
                  Selected in total&nbsp;{{ data?.length || 0 }}&nbsp;A file
                </el-tag>
              </div>
            </slot>
          </el-col>
          <el-col :span="12" style="width: 100%; display: flex; gap: 12px; justify-content: flex-end;">
            <slot name="actionbar-right" v-bind="{}">
              <el-button type="default" circle icon="refresh" @click="listRequest" />
              <template v-if="tabsActived > 3 ? isSuperTenent : true">
                <el-upload ref="uploadRef" :action="getBaseURL() + 'api/system/file/'" :multiple="false" :drag="false"
                  :data="{ upload_method: 1 }" :show-file-list="true" :accept="AcceptList[tabsActived % 4]"
                  :on-success="() => { listRequest(); listRequestAll(); uploadRef.clearFiles(); }"
                  v-if="props.showUploadButton">
                  <el-button type="primary" icon="plus">Upload{{ TypeLabel[tabsActived % 4] }}</el-button>
                </el-upload>
                <el-button type="info" icon="link" @click="netVisiable = true" v-if="props.showNetButton">
                  network{{ TypeLabel[tabsActived % 4] }}
                </el-button>
              </template>
            </slot>
          </el-col>
        </el-row>
        <div v-if="!listData.length">
          <slot name="empty">
            <el-empty description="No content，Please upload" style="width: 100%; height: calc(50vh); margin-top: 24px; padding: 4px;" />
          </slot>
        </div>
        <div ref="listContainerRef" class="listContainer" v-else>
          <div v-for="item, index in listData" :key="index" @click="onItemClick($event)" :data-id="item[props.valueKey]"
            :style="{ width: (props.itemSize || 100) + 'px', cursor: props.selectable ? 'pointer' : 'normal' }">
            <slot name="item" :data="item">
              <FileItem :fileData="item" :api="fileApi" :showClose="tabsActived < 4 || isSuperTenent"
                @onDelFile="listRequest(); listRequestAll();" />
            </slot>
          </div>
        </div>
        <div class="listPaginator">
          <el-pagination background size="small" layout="total, sizes, prev, pager, next" :total="pageForm.total"
            v-model:page-size="pageForm.limit" :page-sizes="[10, 20, 30, 40, 50]" v-model:current-page="pageForm.page"
            :hide-on-single-page="false" @change="handlePageChange" />
        </div>
      </div>
      <!-- Just in the acquisition，Stop closing as much as possibledialog -->
      <el-dialog v-model="netVisiable" :draggable="false" width="50%" :align-center="false" :append-to-body="true"
        :title="'network' + TypeLabel[tabsActived % 4] + 'Upload'" @closed="netUrl = ''" :close-on-click-modal="!netLoading"
        :close-on-press-escape="!netLoading" :show-close="!netLoading" modal-class="_overlay">
        <el-form-item :label="TypeLabel[tabsActived % 4] + 'Link'">
          <el-input v-model="netUrl" placeholder="Please enter the network connection" clearable @input="netChange">
            <template #prepend>
              <el-select v-model="netPrefix" style="width: 110px;">
                <el-option v-for="item, index in ['HTTP://', 'HTTPS://']" :key="index" :label="item" :value="item" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <template #footer>
          <el-button v-if="!netLoading" type="default" @click="netVisiable = false">Cancel</el-button>
          <el-button type="primary" @click="confirmNetUrl" :loading="netLoading">
            {{ netLoading ? 'Network file acquisition...' : 'Sure' }}
          </el-button>
        </template>
      </el-dialog>
      <template #footer v-if="props.showInput">
        <el-button type="default" @click="onClose">Cancel</el-button>
        <el-button type="primary" @click="onSave">Sure</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useUi, UserPageQuery, AddReq, EditReq, DelReq } from '@fast-crud/fast-crud';
import { ref, reactive, defineProps, PropType, watch, onMounted, nextTick } from 'vue';
import { getBaseURL } from '/@/utils/baseUrl';
import { request } from '/@/utils/service';
import { SHOW } from './types';
import FileItem from './fileItem.vue';
import { pluginsAll } from '/@/views/plugins/index';
import { storeToRefs } from "pinia";
import { useUserInfo } from "/@/stores/userInfo";
import { errorNotification, successNotification } from '/@/utils/message';

const userInfos = storeToRefs(useUserInfo()).userInfos;
const isTenentMode = !!(pluginsAll && pluginsAll.length && pluginsAll.indexOf('dvadmin3-tenants-web') >= 0);
const isSuperTenent = (userInfos.value as any).schema_name === 'public';

const TypeLabel = ['picture', 'video', 'Audio', 'document']
const AcceptList = ['image/*', 'video/*', 'audio/*', ''];
const props = defineProps({
  modelValue: {},
  class: { type: Object as PropType<String | Object>, default: '' },
  inputClass: { type: Object as PropType<String | Object>, default: '' },
  style: { type: Object as PropType<Object | string>, default: {} },
  inputStyle: { type: Object as PropType<Object | string>, default: {} },
  disabled: { type: Boolean, default: false },

  tabsType: { type: Object as PropType<'' | 'card' | 'border-card'>, default: '' },
  itemSize: { type: Number, default: 100 },

  // 1000picture 100video 10Audio 1 other controltabsDisplay of
  tabsShow: { type: Number, default: SHOW.ALL },

  // Can I choose multiple options，Default single selection
  // This value istruehourinputTypeMust beselector（No other support yettypeMultiple choices）
  multiple: { type: Boolean, default: false },

  // Is it optional?，This parameter is used to upload and display only without selecting and bindingmodelThe situation
  selectable: { type: Boolean, default: true },

  // This parameter is used to control whether the form is displayeditem。If the value isfalse，The form will not be displayeditem，The bottom button will not be displayed either
  // If the form is not displayeditem，It cannot be triggereddialog，The parent component needs to be exposed by modifying the selectVisiable Status to controldialog
  showInput: { type: Boolean, default: true },

  // Formitemtype，Not forselectorYes, you need to set it upvalueKey，Otherwise, media data may not be available
  inputType: { type: Object as PropType<'selector' | 'image' | 'video' | 'audio'>, default: 'selector' },
  // inputTypeNot forselectorTake effect when
  inputSize: { type: Number, default: 100 },

  // v-modelThe bound value isfileWhich datakey，The default isurl
  valueKey: { type: String, default: 'url' },

  showUploadButton: { type: Boolean, default: true },
  showNetButton: { type: Boolean, default: true },
} as any);

const selectVisiable = ref<boolean>(false);
const tabsActived = ref<number>([3, 2, 1, 0][((props.tabsShow & (props.tabsShow - 1)) === 0) ? Math.log2(props.tabsShow) : 3]);
const fileApiPrefix = '/api/system/file/';
const fileApi = {
  GetList: (query: UserPageQuery) => request({ url: fileApiPrefix, method: 'get', params: query }),
  AddObj: (obj: AddReq) => request({ url: fileApiPrefix, method: 'post', data: obj }),
  DelObj: (id: DelReq) => request({ url: fileApiPrefix + id + '/', method: 'delete', data: { id } }),
  GetAll: () => request({ url: fileApiPrefix + 'get_all/' }),
};
// Filter form
const filterForm = reactive({ name: '' });
// Pagination Form
const pageForm = reactive({ page: 1, limit: 10, total: 0 });
// Displayed data list
const listData = ref<any[]>([]);
const listAllData = ref<any[]>([]);
const listRequest = async () => {
  let res = await fileApi.GetList({
    page: pageForm.page,
    limit: pageForm.limit,
    file_type: isTenentMode ? tabsActived.value % 4 : tabsActived.value,
    system: tabsActived.value > 3,
    upload_method: 1,
    ...filterForm
  });
  listData.value = [];
  await nextTick();
  listData.value = (res.data as any[]).map((item: any) => ({ ...item, url: getBaseURL(item.url) }));
  pageForm.total = res.total;
  pageForm.page = res.page;
  pageForm.limit = res.limit;
  selectedInit();
};
const formDisplayEnter = (e: MouseEvent) => (e.target as HTMLElement).style.setProperty('--fileselector-close-display', 'block');
const formDisplayLeave = (e: MouseEvent) => (e.target as HTMLElement).style.setProperty('--fileselector-close-display', 'none');
const listRequestAll = async () => {
  if (props.inputType !== 'selector') return;
  let res = await fileApi.GetAll();
  listAllData.value = res.data;
};
// tabTriggered when changing
const handleTabChange = (name: string) => { pageForm.page = 1; listRequest(); };
// Triggered when the paging device changes
const handlePageChange = (currentPage: number, pageSize: number) => { pageForm.page = currentPage; pageForm.limit = pageSize; listRequest(); };
// The behavior of choice
const listContainerRef = ref<any>();
const onItemClick = async (e: MouseEvent) => {
  if (!props.selectable) return;
  let target = e.target as HTMLElement;
  let flat = 0;  // -1delete 0constant 1Add to
  while (!target.dataset.id) target = target.parentElement as HTMLElement;
  let fileId = target.dataset.id;
  if (props.multiple) {
    if (target.classList.contains('active')) { target.classList.remove('active'); flat = -1; }
    else { target.classList.add('active'); flat = 1; }
    if (data.value.length) {
      let _l = JSON.parse(JSON.stringify(data.value));
      if (flat === 1) _l.push(fileId);
      else _l.splice(_l.indexOf(fileId), 1);
      data.value = _l;
    } else data.value = [fileId];
    // Dereorder，<descending order，>Ascending order
    data.value = Array.from(new Set(data.value)).sort();
  } else {
    for (let i of listContainerRef.value?.children) (i as HTMLElement).classList.remove('active');
    target.classList.add('active');
    data.value = fileId;
  }
  // onDataChange(data.value);
};
// Each time the list is refreshed, the selection status must be updated.，Because all tabs share list
const selectedInit = async () => {
  if (!props.selectable) return;
  await nextTick(); // Will not refresh if you don't wait once
  for (let i of (listContainerRef.value?.children || [])) {
    i.classList.remove('active');
    let fid = (i as HTMLElement).dataset.id;
    if (props.multiple) { if (data.value?.includes(fid)) i.classList.add('active'); }
    else { if (fid === data.value) i.classList.add('active'); }
  }
};
const uploadRef = ref<any>();
const onSave = () => {
  onDataChange(data.value);
  emit('onSave', data.value);
  selectVisiable.value = false;
};
const onClose = () => {
  data.value = props.modelValue;
  emit('onClose');
  selectVisiable.value = false;
};
const onClosed = () => {
  clearState();
  emit('onClosed');
};
// Clear status
const clearState = () => {
  filterForm.name = '';
  pageForm.page = 1;
  pageForm.limit = 10;
  pageForm.total = 0;
  listData.value = [];
  // allThe data cannot be clear，becauseallIt will only be assigned once when mounted
  // listAllData.value = [];
};
const clear = () => { data.value = null; onDataChange(null); }


// Network file part
const netLoading = ref<boolean>(false);
const netVisiable = ref<boolean>(false);
const netUrl = ref<string>('');
const netPrefix = ref<string>('HTTP://');
const netChange = () => {
  let s = netUrl.value.trim();
  if (s.toUpperCase().startsWith('HTTP://') || s.toUpperCase().startsWith('HTTPS://')) s = s.split('://')[1];
  if (s.startsWith('/')) s = s.substring(1);
  netUrl.value = s;
};
const confirmNetUrl = () => {
  if (!netUrl.value) return;
  netLoading.value = true;
  let controller = new AbortController();
  let timeout = setTimeout(() => {
    controller.abort();
  }, 10 * 1000);
  fetch(netPrefix.value + netUrl.value, { signal: controller.signal }).then(async (res: Response) => {
    clearTimeout(timeout);
    if (!res.ok) errorNotification(`network${TypeLabel[tabsActived.value % 4]}Failed to obtain！`);
    const _ = res.url.split('?')[0].split('/');
    let filename = _[_.length - 1];
    // let filetype = res.headers.get('content-type')?.split('/')[1] || '';
    let blob = await res.blob();
    let file = new File([blob], filename, { type: blob.type });
    let form = new FormData();
    form.append('file', file);
    form.append('upload_method', '1');
    fetch(getBaseURL() + 'api/system/file/', { method: 'post', body: form })
      .then(() => successNotification('The online file upload was successful！'))
      .then(() => { netVisiable.value = false; listRequest(); listRequestAll(); })
      .catch(() => errorNotification('Network file upload failed！'))
      .then(() => netLoading.value = false);
  }).catch((err: any) => {
    console.log(err);
    clearTimeout(timeout);
    errorNotification(`network${TypeLabel[tabsActived.value % 4]}Failed to obtain！`);
    netLoading.value = false;
  });
};




// fs-crudpart
const data = ref<any>(null);
const emit = defineEmits(['update:modelValue', 'onSave', 'onClose', 'onClosed']);
watch(
  () => props.modelValue,
  (val) => data.value = props.multiple ? JSON.parse(JSON.stringify(val)) : val,
  { immediate: true }
);
const { ui } = useUi();
const formValidator = ui.formItem.injectFormItemContext();
const onDataChange = (value: any) => {
  emit('update:modelValue', value);
  formValidator.onChange();
  formValidator.onBlur();
};

defineExpose({ data, onDataChange, selectVisiable, clearState, clear });

onMounted(() => {
  if (props.multiple && props.inputType !== 'selector')
    throw new Error('FileSelectorComponent propertiesmultiplefortruehourinputTypeMust beselector');
  listRequestAll();
  console.log('fileselector tenentmdoe', isTenentMode);
  console.log('fileselector supertenent', isSuperTenent);
});
</script>

<style scoped>
.form-display {
  --fileselector-close-display: none;
  overflow: hidden;
}

._overlay {
  width: unset !important;
}

.headerBar>* {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

:deep(.el-input-group__prepend) {
  padding: 0 20px;
}

.listContainer {
  display: grid;
  justify-items: center;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: min-content;
  grid-gap: 36px;
  margin-top: 24px;
  padding: 8px;
  height: calc(50vh);
  overflow-y: auto;
  scrollbar-width: thin;
}

.listContainer>* {
  aspect-ratio: 1 / 1;
  box-shadow: 0 0 4px rgba(0, 0, 0, .2);
  border-radius: 8px;
  overflow: hidden;
}

.active {
  box-shadow: 0 0 8px var(--el-color-primary);
}

.listPaginator {
  display: flex;
  justify-content: flex-end;
  justify-items: center;
  padding-top: 24px;
}

.addControllorHover {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.addControllorHover:hover {
  border-color: #c0c4cc;
}

.closeHover {
  display: var(--fileselector-close-display);
  position: absolute;
  right: 2px;
  top: 2px;
  cursor: pointer;
}
</style>