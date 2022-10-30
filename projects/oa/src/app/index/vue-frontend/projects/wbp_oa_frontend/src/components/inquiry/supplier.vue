<template>
  <div class="flex flex-col w-full px-6">
    <div class="flex w-full gap-1 justify-between">
      <a-form-item class="w-1/3"
        v-bind="!supplier.is_online || supplier.is_online === '0' ? { validateStatus: 'error', help: '该供应商不支持线上操作' } : {}">
        <a-checkbox v-model:checked="supplier.checked"
          :disabled="!supplier.is_online || supplier.is_online === '0'">
          <span>
            <span class="text-[#FF3E00]">{{ supplier.supplier_tag }}</span>
            {{ supplier.supplier_name }}
          </span>
        </a-checkbox>
      </a-form-item>
      <a-form-item v-bind="validateInfos[`${prefix}.contract`]" class="w-1/3 grow h-fit">
        <a-select :value="R.propOr(null, 'value', supplier.contract)"
          @change="(_, option) => supplier.contract = option" showSearch optionFilterProp="label" placeholder="选择合同"
          :options="contract_options" />
      </a-form-item>
      <a-form-item v-if="supplier.contract && supplier.contract.tax_type == '2'"
        v-bind="validateInfos[`${prefix}.tax_rate`]" class="w-1/4 h-fit">
        <a-select v-model:value="supplier.tax_rate" showSearch optionFilterProp="label" :searchValue="search_value"
          @search="v => search_value = v" :options="tax_rates_options" placeholder="合同税率，可直接填税率" />
      </a-form-item>
    </div>
    <div class="flex w-full mt-3">
      <a-textarea v-model:value="supplier.remark" :rows="2" placeholder="请输入备注，供应商报价时可见" />
    </div>
  </div>
</template>
<script lang="tsx" setup>
import { ref, reactive, watch, inject, watchEffect, nextTick, computed } from 'vue'
import { formState, rulesState, validate, validateInfos, contractList, tax_rates_default_options, contract_checking_map, confirmLoading, clearValidate } from './state.ts'
import * as R from 'ramda'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { check_order_company, check_contract_epo } from '@/api/backlog/inquiry'

const { supplier, category, prefix } = defineProps(['supplier', 'category', 'prefix'])
const emit = defineEmits(['update:supplier'])

const search_value = ref('')

watch(() => supplier, () => {
  emit('update:supplier', supplier)
}, { deep: true })

const contract_options: any = computed(() => {
  return contractList.value?.filter(
    (item: any) => item.supplier_id == supplier.supplier_id
      && item.category_id === supplier.category_id
      && item.product_code === supplier.product_code
  )
})

const tax_rates_options: any = computed(() => {
  // 合同配置税率
  const contract_tax_rate_options = []
  const contract_tax_rate = R.prop('tax_rate_value', supplier.contract)
  if (contract_tax_rate) {
    contract_tax_rate_options.push({ label: '【合同配置税率】', value: contract_tax_rate, prefix: '【合同配置税率】' })
  }
  const searched_tax_rate_options = []
  if (search_value.value) {
    searched_tax_rate_options.push({ label: '【自定义税率】', value: search_value.value, prefix: '【自定义税率】' })
  }
  const all_tax_rate_options = [
    ...contract_tax_rate_options,
    ...tax_rates_default_options.value,
    ...searched_tax_rate_options,
  ]
  return R.map(
    (same_value_options: any[]) => ({
      label: `${R.join('', R.map(R.prop('prefix'), same_value_options))} ${same_value_options[0].value}`,
      value: same_value_options[0].value
    }),
    R.values(R.groupBy(
      R.prop('value'),
      all_tax_rate_options
    ))
  )
})

watch(() => supplier.contract, (newVal, oldVal) => {
  if (newVal) {
    if (newVal.tax_rate_value) {
      if (oldVal && oldVal.tax_rate_value && supplier.tax_rate === oldVal.tax_rate_value) {
        supplier.tax_rate = newVal.tax_rate_value
      } else if (supplier.tax_rate === null) {
        supplier.tax_rate = newVal.tax_rate_value
      }
    } else {
      supplier.tax_rate = null
    }
  }
})

// HACK give it a default value for v-model detect
supplier.contract = null
supplier.tax_rate = null
supplier.checked = !supplier.is_hide
supplier.remark = ''
if (contract_options.value?.length === 1) {
  supplier.contract = contract_options.value[0]
}
// add rules for every contract
rulesState[`${prefix}.tax_rate`] = [
  {
    validator: async (rule, value) => {
      if (supplier.checked && supplier.contract) {
        if (supplier.contract.tax_type == "2") {
          if (!supplier.tax_rate || supplier.tax_rate.length == 0) {
            throw "请输入合同税率";
          }
          const rates = supplier.tax_rate.split('.');
          if (rates[1] && rates[1].length > 18) {
            throw "税率仅支持到小数后18位";
          }
          //判断是否浮点
          if (parseFloat(supplier.tax_rate) != supplier.tax_rate || supplier.tax_rate < 0) {
            throw "请输入正确合同税率";
          }
        }
      }
    }
  }
]
rulesState[`${prefix}.contract`] = [
  {
    validator: async (rule, value) => {
      if (supplier.checked) {
        if (contract_options.value?.length === 0) {
          throw '没有拉取到主体信息，请联系税务添加主体信息';
        }
        if (!supplier.org_name) {
          throw '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同';
        }
        if (!supplier.contract) {
          throw '勾选供应商后要勾选对应的合同号'
        }
        if (supplier.supplier_id && supplier.contract && supplier.contract.value) {
          contract_checking_map[`${prefix}.contract`] = true
          confirmLoading.value = true
          try {
            const check_1 = await check_order_company({
              supplier_id: supplier.supplier_id,
              product_code: supplier.product_code,
              contract_id: supplier.contract.value || null,
            })
            if (check_1.code !== 0) {
              throw check_1.msg
            }
            const check_2 = await check_contract_epo({ contract_id: supplier.contract.value, thing_id: category.thing_id })
            if (check_2.code !== 0) {
              throw check_2.msg
            }
          } catch (e) {
            throw e
          } finally {
            confirmLoading.value = false
            contract_checking_map[`${prefix}.contract`] = false
          }
        }
      }
    }
  }
]
watch(() => supplier.checked, () => {
  if (supplier.checked === true) {
    validate([`${prefix}.contract`, `${prefix}.tax_rate`])
  } else {
    clearValidate([`${prefix}.contract`, `${prefix}.tax_rate`])
  }
})
</script>