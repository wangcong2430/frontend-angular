import { ref, reactive, computed } from 'vue'
import * as R from 'ramda'
import { Form } from 'ant-design-vue';
const useForm = Form.useForm


export const tax_rates_default_options = ref([])
export const confirmLoading = ref(false)
export const contract_checking_map = reactive({})
export const confirmDisabled = computed(() => {
  const checking_list = R.values(contract_checking_map)
  return R.any(i => i, checking_list)
})
export const contractList = ref([])
export const formState = reactive<any>({
  is_open_payment_date: false,
  is_show_contract_remark: false,
  is_show_pre_workload: false,
})

export const rulesState = reactive<any>({})

export const { validate, validateInfos, resetFields, validateField, mergeValidateInfo, clearValidate } = useForm(
  formState,
  rulesState,
);