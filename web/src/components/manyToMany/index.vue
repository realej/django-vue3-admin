<template>
  <!--   Your custom controlled components-->
  <div>
    <el-tag class="many-to-many-tag" :type="randomType" v-for="(item,index) in data" :key="index">{{item}}</el-tag>
  </div>
</template>
<script lang="ts" setup>
import {watch, ref} from "vue";

const props = defineProps({
  modelValue: Array,
  bindValue: Array,
  displayLabel: {
    type:String,
    default: ""
  }
})

// templateUse ondata
const data = ref()
watch(() => {
      return props.bindValue
    }, // monitormodelValueChanges，
    (value) => {
      const {displayLabel} = props
      const result = value ? value.map((item: any) => {
        return item[displayLabel]
      }) : null
      data.value = result
    }, // whenmodelValueAfter the value is triggered，Synchronous modificationdata.valueValue of
    {immediate: true} // Trigger once immediately，GivedataAssign initial value
)

const tagType = ['success', 'info', 'warning', 'danger']
const randomType = (): string => {
  return tagType[Math.floor(Math.random() * tagType.length)];
}
</script>
<style scoped>
.many-to-many-tag{
  margin-right: 5px;
}
.many-to-many-tag:last-child {
  margin-right: 0;
}
</style>
