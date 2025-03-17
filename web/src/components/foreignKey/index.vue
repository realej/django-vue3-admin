<template>
  <!--   Your custom controlled components-->
  <div>
    <el-tag :type="randomType">{{ data }}</el-tag>
  </div>
</template>
<script lang="ts" setup>
import {watch, ref} from "vue";

const props = defineProps({
  modelValue: String || Object,
  displayLabel: {
    type:String,
    default: ""
  }
})

// templateUse ondata
const data = ref()
watch(() => {
      return props.modelValue
    }, // monitormodelValueChanges，
    (value) => {
      if (typeof value === "string") {
        data.value = value
      } else if (typeof value === "object") {
        const {displayLabel} = props
        data.value = value ? value[displayLabel] : null
      } else {
        data.value = null
      }

    }, // whenmodelValueAfter the value is triggered，Synchronous modificationdata.valueValue of
    {immediate: true} // Trigger once immediately，GivedataAssign initial value
)

const tagType = ['success', 'info', 'warning', 'danger']
const randomType = (): string => {
  return tagType[Math.floor(Math.random() * tagType.length)];
}
</script>
