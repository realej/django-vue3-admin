<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding">
      <template #header-top>
        <div id="myEcharts" v-show="isEcharts" v-resize-ob="handleResize" :style="{width: '100%', height: '300px'}"></div>
      </template>
    </fs-crud>
	</fs-page>
</template>

<script lang="ts" setup name="loginLog">
import { ref, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import * as echarts from "echarts";
const isEcharts = ref(true)
const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions,isEcharts,initChart });
const myEcharts = echarts

function initChart() {
  let chart = myEcharts.init(document.getElementById("myEcharts"), "purple-passion");
  // Request hereAPI,For example:
  /***
   *   request({url:'xxxx'}).then(res=>{
   *     // Bundlechart.setOptionWrite here
   *
   *   })
   *
   */
  chart.setOption({
    title: {
      text: "2021Sales volume in each month of the year（unit：Parts）",
      left: "center",
    },
    xAxis: {
      type: "category",
      data: [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
      ]
    },
    tooltip: {
      trigger: "axis"
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        data: [
          606, 542, 985, 687, 501, 787, 339, 706, 383, 684, 669, 737
        ],
        type: "line",
        smooth: true,
        itemStyle: {
          normal: {
            label: {
              show: true,
              position: "top",
              formatter: "{c}"
            }
          }
        }
      }
    ]
  });
  window.onresize = function () {
    chart.resize();
  };
}

function handleResize(size) {
  console.log(size)
}

// Get list data after the page is opened
onMounted(() => {
	crudExpose.doRefresh();
  initChart()
});
</script>
