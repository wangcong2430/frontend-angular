<template>
  <div class="flex flex-col w-full border border rounded-sm border-solid border-[#E7E7E7]">
    <div class="flex w-full h-[3rem] bg-approval-header px-6">
      <a-typography-paragraph :ellipsis="{ rows: 1, tooltip: true }"
        class="!flex justify-start items-center h-full !mb-0 w-1/3" :content="`产品名称：${product.title}`">
        <template #ellipsisTooltip>
          {{ product.title }}
        </template>
      </a-typography-paragraph>
      <a-typography-paragraph :ellipsis="{ rows: 1, tooltip: true }"
        class="!flex justify-center items-center h-full !mb-0 w-1/3" :class="product.org_name ? '' : 'text-red-600'" :content="product.org_name ? `产品我方主体：${product.org_name}` : '没有拉取到主体信息，请联系税务添加主体信息'">
        <template #ellipsisTooltip>
          {{ product.org_name }}
        </template>
      </a-typography-paragraph>
      <a-typography-paragraph :ellipsis="{ rows: 1, tooltip: true }"
        class="!flex justify-center items-center h-full !mb-0 w-1/3" :content="`需求种类：${product.demand_type}`">
        <template #ellipsisTooltip>
          <!-- TODO -->
        </template>
      </a-typography-paragraph>
    </div>
    <template v-for="(_, i) in product.categories_list" :key="i">
      <Category v-model:category="product.categories_list[i]" :prefix="`${prefix}.categories_list.${i}`" />
    </template>


  </div>
</template>
<script setup lang="tsx">
import { ref, watch, reactive } from 'vue'
import * as R from 'ramda'
import { formState, rulesState } from './state.ts'
import Category from './category.vue'
const { product, prefix } = defineProps(['product', 'prefix'])
const emit = defineEmits(['update:product'])

watch(() => product, () => {
  emit('update:product', product)
}, { deep: true })


</script>