<template>
  <a-select v-model:value="test" mode="tags" />
  <a-button @click="() => show = true">test</a-button>
  <Inquiring v-if="show" :thing_id="thing_id" :is_test="is_test" :onClose="() => show = false" :onUpdate="() => {}" />
  <a-button @click="() => show2 = true">生成订单</a-button>
  <GenerateOrder v-if="show2" :thing_id="thing_id" :is_test="is_test" :category_type="category_type" :onClose="() => show2 = false" :onUpdate="() => {}" />
</template>
<script setup lang="tsx">
import { computed, ref } from 'vue'
import Inquiring from '@/components/inquiry/index.vue'
import GenerateOrder from '@/components/generate-order/index.vue'

const test = ref(["30256", "30245", "30246", "30247", "30248", "30249", "30250", "30251"])
const thing_id = computed(() => test.value)
const is_test = 0
const category_type = ref('1')
// FIXME 从旧后台复制来的
// if (this.list.filter(item => item.indeterminate || item.checked).some(items => items.category_type === '1')) {
//   category_type = '1';
// } else if (this.list.filter(item => item.indeterminate || item.checked).some(items => items.category_type === '2')) {
//   category_type = '2';
// }
const show = ref(false)
const show2 = ref(false)
</script>