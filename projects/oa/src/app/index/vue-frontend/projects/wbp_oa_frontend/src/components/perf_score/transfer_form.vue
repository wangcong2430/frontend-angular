<template>
  <a-modal :visible="true" title="转交" okText="确定" cancelText="取消" :onCancel="handle_cancel" :onOk="submit_form">
    <vxe-form ref="xForm" :data="form_state.form_data" :rules="form_state.form_rules" title-align="right" title-width="100">
      <vxe-form-item title="转交人: " field="userId" :item-render="{}">
        <template #default="{ data }">
          <vxe-select v-model="data.userId" :options="user_list" clearable>
          </vxe-select>
        </template>
      </vxe-form-item>
      <vxe-form-item title="备注: " field="remark" :item-render="{}">
        <template #default="{ data }">
          <vxe-textarea v-model="data.remark"></vxe-textarea>
        </template>
      </vxe-form-item>
    </vxe-form>
  </a-modal>
</template>
<script lang="ts">
import { defineComponent, onUpdated, reactive, ref } from "vue";
import * as R from 'ramda'
import { get_transfer_user_list, post_transfer_save } from '@/api/perf/demand-score'
import { message } from "ant-design-vue";

export default defineComponent({
  name: 'TransferForm',
  props: {
    rows: {
      type: Array
    },
    node: String,
    onClose: { type: Function, required: true },
    onUpdate: { type: Function, required: true },
  },
  async setup(props, ctx) {
    const xForm = ref()
    const handle_cancel = () => {
      props.onClose()
    }
    const row_ids = R.map(R.prop('id'), props.rows)
    const { data: user_list } = await get_transfer_user_list({ id: row_ids.toString(), node: props.node })
    const form_state = reactive({
      form_data: {
        id: R.join(',', row_ids), node: props.node, remark: "", userId: ""
      },
      form_rules: {
        userId: [
          { required: true, message: '请选择转交人' },
        ],
      }
    })
    const submit_form = async () => {
      const validate_result = await xForm.value?.validate()
      if (validate_result) return
      const result = await post_transfer_save(form_state.form_data)
      if (result.code !== 0) {
        message.error(result.msg)
      }
      props.onUpdate()
      props.onClose()
      // ctx.emit('onUpdate')
      // ctx.emit('onClose')
    }
    return {
      xForm,
      user_list,
      form_state,
      handle_cancel,
      submit_form,
    }
  }
})
</script>