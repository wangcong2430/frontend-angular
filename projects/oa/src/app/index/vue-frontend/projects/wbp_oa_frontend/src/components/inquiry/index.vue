<template>
  <a-modal class="scoped-inject-inquiring-modal" :visible="true" title="请选择参与报价供应商" @ok="handle_submit" okText="确定"
    cancelText="取消" width="1200px" :confirmLoading="confirmLoading" :okButtonProps="{ disabled: confirmDisabled }"
    @cancel="onClose" :maskClosable="false">
    <a-form ref="form_ref" :colon="false" labelAlign="right" hideRequiredMark>
      <div class="flex flex-col w-full max-h-[70vh] overflow-auto">
        <div class="flex w-full gap-x-3">
          <a-form-item label="报价截止日期" class="w-1/2" v-bind="validateInfos['end_date']">
            <a-date-picker class="w-full" v-model:value="formState.end_date" valueFormat="YYYY-MM-DD"
              placeholder="请选择日期" />
          </a-form-item>
          <a-form-item label="批量选择供应商" class="w-1/2">
            <a-form-item-rest>
              <a-select class="grow h-fit" mode="tags" placeholder="输入关键字搜索" maxTagCount='responsive'
                @select="v => handle_batch_check(true, v)" @deselect="v => handle_batch_check(false, v)"
                :options="union_suppliers_options" />
            </a-form-item-rest>
          </a-form-item>
        </div>
        <div class="flex justify-start gap-x-3 w-full">
          <a-form-item label="是否要保密">
            <a-switch v-model:checked="formState.is_set_secrecy" checked-children="是" un-checked-children="否" />
          </a-form-item>
          <a-form-item v-if="formState.is_set_secrecy" class="grow" v-bind="validateInfos.secrecy_codes">
            <a-select mode="multiple" v-model:value="formState.secrecy_codes" :options="secrecy_scope_options"
              placeholder="请选择保密范围，选中的内容，供应商CP商务和管理员将不可见"></a-select>
          </a-form-item>
        </div>
        <div class="flex justify-start gap-x-3 w-full">
          <a-tooltip title="供应商报价时，系统将显示项目侧录入的数量/预估工作量及明细，供应商可进行修改。">
            <a-form-item>
              <a-checkbox v-model:checked="formState.is_show_pre_workload">对供应商公开预估数量</a-checkbox>
            </a-form-item>
          </a-tooltip>
          <a-tooltip title="供应商报价时，系统将显示合同备注信息，仅适用于供应商可见合同备注的情况。">
            <a-form-item>
              <a-checkbox v-model:checked="formState.is_show_contract_remark">对供应商显示合同备注</a-checkbox>
            </a-form-item>
          </a-tooltip>
          <a-tooltip title="供应商报价时，系统将显示项目组期望完成日期，供应商可以修改，修改后核价时标示红色，仅适用于指定完成日期的情况。">
            <a-form-item>
              <a-checkbox v-model:checked="formState.is_open_payment_date">对供应商公开期望交付日期</a-checkbox>
            </a-form-item>
          </a-tooltip>
        </div>
        <template v-for="( _, i ) in formState.product_list" :key="i">
          <Product v-model:product="formState.product_list[i]" :prefix="`product_list.${i}`">
          </Product>
        </template>
      </div>
    </a-form>
  </a-modal>
</template>
<script setup lang="tsx">
import * as R from 'ramda'
import { ref, reactive, watch, provide } from 'vue'
import { Form, message, Modal } from 'ant-design-vue';
import Product from './product.vue'
import { formState, rulesState, validate, validateInfos, contractList, tax_rates_default_options, confirmDisabled, confirmLoading } from './state.ts'
import { get_inquiry_dialog, inquiry_submit } from '@/api/backlog/inquiry'

const secrecy_scope_options = [
  {
    label: '交付文件（含供应商制作上传的展示作品、交付作品、过程附件）',
    value: 'upload_attach'
  },
  {
    label: '需求附件（勾选后，所属需求所有物件均对需求附件保密）',
    value: 'story_attach'
  },
  {
    label: '需求名称',
    value: 'story_name'
  },
  {
    label: '项目名称',
    value: 'project_name'
  },
  {
    label: '物件名称',
    value: 'thing_name'
  },
]


const { thing_id, is_test, onClose, is_reinquery = false, onUpdate } = defineProps(['thing_id', 'is_test', 'onClose', 'onUpdate', 'is_reinquery'])

const form_ref = ref()

const union_suppliers_options = ref([])


const get_union_suppliers_options = (product_list) => {
  return R.uniqBy(
    R.prop('value'),
    R.map(i => (
      {
        label: i.supplier_name.replace(/<[^>]+>/g, '').replace(/\(意向\)/, '').replace(/\(直选\)/, ''),
        value: i.supplier_id,
        id: i.supplier_id,
      }
    ), R.chain(R.propOr([], 'supplier'), R.chain(R.propOr([], 'categories_list'), product_list)))
  )
}

const result = await get_inquiry_dialog({ thing_id, is_test })
if (result['code'] === 0) {
  contractList.value = result['contractList'];
  tax_rates_default_options.value = R.map(item => ({ ...item, prefix: R.propOr('', '0', /【.+】/.exec(item.label)) }), result['tax_rates']);
  union_suppliers_options.value = get_union_suppliers_options(result.modelData.product_list);
  Object.assign(formState, result['modelData'])
} else {
  message.error(result['msg']);
  onClose()
}

rulesState['end_date'] = [
  {
    required: true,
    message: '报价截止日期不能为空'
  }
]
rulesState['secrecy_codes'] = [
  {
    validator: async (rule, value) => {
      if (formState.is_set_secrecy && value.length < 1) {
        throw '请输入保密范围'
      }
    }
  },
]


watch(() => formState.is_set_secrecy, () => {
  if (formState.is_set_secrecy === false) {
    formState.secrecy_codes = []
  }
})

const handle_batch_check = (checked: boolean, supplier_id: number) => {
  R.map(
    (supplier: any) => {
      if (supplier.supplier_id === supplier_id && supplier.is_online === '1') {
        supplier.checked = checked
      }
    },
    R.chain(R.propOr([], 'supplier'), R.chain(R.propOr([], 'categories_list'), formState.product_list))
  )
}

const handle_submit = async () => {
  console.log(formState)
  confirmLoading.value = true
  validate().then(async () => {
    // 确保至少选择了一个供应商提交
    const at_lease_checked_confirm = await check_at_lease_one_supplier_checked()
    if (!at_lease_checked_confirm) {
      message.error('数据不完整不能提交')
      return
    }
    const org_name_confirm = await check_supplier_org_name()
    if (!org_name_confirm) {
      return
    }
    const org_same_confirm = await check_supplier_org_same()
    if (!org_same_confirm) {
      return
    }
    // 保密配置弹窗提醒
    const secrecy_confirm = await check_secrecy()
    if (!secrecy_confirm) {
      return
    }

    const inquiry_list: any[] = []
    R.map((product: any) => {
      R.map((category: any) => {
        const thingQuote: any[] = []
        R.map((supplier: any) => {
          if (supplier.checked) {
            thingQuote.push(
              {
                supplier_id: supplier.supplier_id,
                contract_id: supplier.contract.value,
                remark: supplier.remark,
                is_org_same: supplier.contract.is_org_same,
                tax_rate: supplier.tax_rate,
              }
            );
          }
        }, category.supplier)
        if (thingQuote.length > 0) {
          inquiry_list.push({
            thing_id: category.thing_id,
            thing_quote: thingQuote
          })
        }
      }, product.categories_list)
    }, formState.product_list)
    console.log(inquiry_list)
    const result = await inquiry_submit({
      deadline: formState['end_date'],
      inquiry_list,
      is_open_quantity: formState['is_open_quantity'],
      is_open_payment_date: formState['is_open_payment_date'],
      is_show_contract_remark: formState['is_show_contract_remark'],
      is_show_pre_workload: formState['is_show_pre_workload'],
      is_reinquery,
      secrecy_codes: formState.secrecy_codes
    })
    if (result['code'] !== 0) {
      message.error(result['msg'])
      return
    }
    message.success(result['msg'])
    onUpdate()
    onClose()
  }).catch(err => {
    console.log('error', err);
  }).finally(() => {
    confirmLoading.value = false
  })
}
const check_secrecy = async () => {
  const p = new Promise(resolve => {
    const whole_secrecy = formState.secrecy_codes.sort().join(",")
    let diff_num = 0;
    for (let i in formState.secrecys_detail) {
      if (whole_secrecy !== i) {
        diff_num += formState.secrecys_detail[i].length;
      }
    }
    if (diff_num != 0 && Object.keys(formState.secrecys_detail).length != 1) {
      const modal = Modal.confirm({
        title: '保密配置不一致提醒',
        content: `所选择的单据中有${diff_num.toString()}个物件的保密范围与当前保密范围不一致，若继续将会重新统一保密配置`,
        cancelText: '取消',
        okText: '确认',
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      })
    } else {
      resolve(true)
    }
  })
  return p
}

const check_at_lease_one_supplier_checked = async () => {
  return R.any(i => i, R.map(R.prop('checked'), R.chain(R.propOr([], 'supplier'), R.chain(R.propOr([], 'categories_list'), formState.product_list))))
}

const check_supplier_org_name = async () => {
  const p = new Promise(resolve => {
    const all_org_name = R.all(i => i, R.map(R.prop('org_name'), R.chain(R.propOr([], 'supplier'), R.chain(R.propOr([], 'categories_list'), formState.product_list))))
    if (!all_org_name) {
      const modal = Modal.confirm({
        title: '提示',
        content: '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同?',
        cancelText: '取消',
        okText: '确认',
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      })
    } else {
      resolve(true)
    }
  })
  return p
}

const check_supplier_org_same = async () => {
  const p = new Promise(resolve => {
    const all_org_same = R.all(i => i, R.map(R.path(['contract', 'is_org_same']), R.chain(R.propOr([], 'supplier'), R.chain(R.propOr([], 'categories_list'), formState.product_list))))
    if (!all_org_same) {
      const modal = Modal.confirm({
        title: '提示',
        content: '合同我方主体与产品我方主体不一致，是否继续询价?',
        cancelText: '取消',
        okText: '确认',
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      })
    } else {
      resolve(true)
    }
  })
  return p
}

</script>
<style lang="less">
@import './style.less';
</style>