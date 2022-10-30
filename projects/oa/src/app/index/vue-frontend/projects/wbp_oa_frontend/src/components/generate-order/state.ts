import { ref, reactive, computed } from 'vue'
import * as R from 'ramda'
import { Form } from 'ant-design-vue';
const useForm = Form.useForm


export const confirmLoading = ref(false)
export const confirmDisabled = ref(false)
export const formState = reactive<any>({
    awesomeIsForced: false,
    contract_options: [],
    is_org_same: null,
    is_test: 0,  // 0 正式单, 1 测试单
    org_list: [],
    vendor_site_list: [],
    contract_tax_type: 1,
    tax_list_options: [],
    tax_type_options: [],
    account_bank_list: [],
    category_name_list: [],
    mba_resources: [],
    mba_has_resources: null
})

export const rulesState = reactive<any>({})

export const { validate, validateInfos, resetFields, validateField, mergeValidateInfo, clearValidate } = useForm(
    formState,
    rulesState,
);