<template>
  <a-modal :visible="true" title="不评估" okText="确定" cancelText="取消" :onCancel="handle_cancel" :onOk="submit_form">
    <div class="scoped-del-score-css">
      <a-form-item name="radio-group" label="请选择不参与评估的原因">
        <a-radio-group v-model:value="radioVal" @change="handradio">
          <a-radio v-for="item in radiogroup" :value="item.id">{{ item.value }}
            <a-input v-if="item.value === '其他'" v-model:value="inputVal" :bordered="false" placeholder="" />
          </a-radio>
        </a-radio-group>
      </a-form-item>
    </div>

  </a-modal>
</template>
<script lang="ts">
import { defineComponent, onUpdated, reactive, ref } from "vue";
import * as R from 'ramda'
import { post_edit_perf_score } from '@/api/perf/purchasing-score'
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
    let radioVal = ref()
    let inputVal = ref()

    let radiogroup = ref([
      { id: '0', value: '画师类' },
      { id: '1', value: '基地派驻类' },
      { id: '2', value: '动捕演员类' },
      { id: '3', value: '制定供应商' },
      { id: '4', value: '其他' },
    ])
    const row_ids = R.map(R.prop('id'), props.rows)
    const handle_cancel = () => {
      props.onClose()
    }

    const submit_form = async () => {
      let remarks: any = []
      if (!radioVal.value) {
        return message.error('请选择删除的原因')
      }
      R.map(row => {
        if (row.checked) {
          if (row.id === '4') {
            if (!inputVal.value) {
              return message.error('请填写其他原因')
            }
            remarks.push({ id: row.id, value: inputVal.value })
          } else {
            remarks.push(row)
          }
        }
      }, radiogroup.value)
      if (remarks.length <= 0) {
        return
      }
      const res = await post_edit_perf_score({ perf_score_ids: row_ids, end_remark: remarks })
      if (res.code != 0) {
        return message.error(res.msg)
      } else {
        props.onClose()
        props.onUpdate()
        return message.success(res.msg)
        // ctx.emit('onUpdate')
        // ctx.emit('onClose')
      }
      console.log('------props,rows', remarks);

    }

    const handradio = (e) => {
      let checked = e.target.checked
      R.map(row => {

        if (row.id == e.target.value) {
          row.checked = checked
        } else {
          row.checked = !checked
        }
      }, radiogroup.value)
      console.log('-----e', e.target.checked, radioVal.value);

    }
    return {
      xForm,
      handle_cancel,
      submit_form,
      radioVal,
      inputVal,
      radiogroup,
      handradio
    }
  }
})
</script>

<style lang="less">
@import './style.less';
</style>