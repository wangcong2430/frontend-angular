<template>
  <div class="w-full flex flex-col items-center gap-y-3">
    <div class="flex w-full bg-approval-sub-header px-6 py-3">
      <div class="w-1/2 flex items-center">
        <span class="mr-6">品类</span>
        <span>{{ category.title }}</span>
      </div>
      <div class="w-1/2 flex items-center">
        <span class="mr-6">搜索供应商</span>
        <a-select mode="multiple" placeholder="输入关键字搜索" maxTagCount='responsive' class="grow h-fit"
          v-model:value="search_supplier" :options="search_options" />
      </div>
    </div>
    <div class="flex flex-col w-full gap-y-3">
      <template v-if="category.supplier.length > 0" v-for="( supplier, i ) in category.supplier">
        <Supplier
          v-show="expand || !supplier.is_hide || supplier.checked || R.includes(supplier.supplier_id, search_supplier)"
          :prefix="`${prefix}.supplier.${i}`" :category="category" v-model:supplier="category.supplier[i]" />
      </template>
      <template v-else>
        <a-empty description="没有可选的供应商" />
      </template>
    </div>
    <a-divider>
      <a-button v-if="R.any(i => i, R.map(R.prop('is_hide'), category.supplier))" type="link" @click="expand = !expand">
        <template v-if="expand">
          收起
          <UpOutlined />
        </template>
        <template v-else>
          展开
          <DownOutlined />
        </template>
      </a-button>
    </a-divider>

  </div>
</template>
<script lang="tsx" setup>
import { ref, reactive, watch, inject, watchEffect, nextTick } from 'vue'
import { formState, rulesState, validate, validateInfos, contractList } from './state.ts'
import * as R from 'ramda'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import Supplier from './supplier.vue'
// import { Form } from 'ant-design-vue';

const { category, prefix } = defineProps(['category', 'prefix'])
const emit = defineEmits(['update:category'])
const expand = ref(false)
const search_options = category.supplier.map(item => {
  return {
    label: item.supplier_name,
    value: item.supplier_id,
    id: item.supplier_id
  };
})

const search_supplier = ref([])

// const formItemContext = Form.useInjectFormItemContext();


watch(() => category, () => {
  emit('update:category', category)
}, { deep: true })


watchEffect(() => {
  console.log(formState)
})
</script>