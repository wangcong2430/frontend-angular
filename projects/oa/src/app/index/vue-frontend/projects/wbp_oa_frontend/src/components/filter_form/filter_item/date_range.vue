<template>
    <a-range-picker :value="modelValue" :ranges="ranges" @change="handle_change" :placeholder="['开始日期', '结束日期']"
      :valueFormat="_format" :allowClear="false" :locale="locale" />
</template>
<script lang="ts" setup>
import { computed } from 'vue';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import * as R from 'ramda'
import dayjs from 'dayjs';

const { item, modelValue, mode, format } = defineProps({
  item: Object,
  modelValue: Array,
  mode: {
    type: String,
    default: 'date'
  },
  format: String
})
const emit = defineEmits(['update:modelValue'])

const _format = computed(() => {
  return format || R.prop(mode, {
    time: 'X',
    date: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
    decade: 'YYYY'
  })
})


const handle_change = (v) => {
  emit('update:modelValue', v)
}

const ranges = {
  '今日': [dayjs(), dayjs()],
  '当月': [dayjs().startOf('month'), dayjs().endOf('month')],
}

</script>