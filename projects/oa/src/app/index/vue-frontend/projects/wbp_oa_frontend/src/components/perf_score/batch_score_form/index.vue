<template>
  <a-modal :visible="true" width="80%" :title="title" okText="确定" cancelText="取消" :onCancel="onClose"
    :onOk="submit_form">
    <div class="scoped-batch-score-form-css">
      <vxe-table ref="xTable" :expand-config="{ expandAll: true }" :show-header="false" row-class-name="tb-row"
        :checkbox-config="{ checkField: 'checked' }" show-overflow :border="'default'" round auto-resize
        :scroll-x="{ gt: 20 }" :scroll-y="{ gt: 20 }" :data="data.tableData">
        <vxe-column>
          <template #default="{ row }">
            <div>
              <span>供应商名称：{{ row.supplier_name }}</span>
              <span class="ml-10">服务品类: {{ row.category }}</span>
            </div>
          </template>
        </vxe-column>
        <vxe-column type="expand" :visible="false">
          <template #content="{ row }">
            <div class="py-[11px] px-[70px] w-full min-h-[80px] grid grid-cols-[repeat(auto-fit,_minmax(200px,_auto))]">
              <div v-for="option, i in row.children[0].score_options" :key="i" class="flex flex-col mx-3">
                <span class="pb-[11px]">{{ option.name }}</span>
                <a-cascader expand-trigger="hover"
                  @change="(values: string[] = []) => { option.score = R.last(values) || 0; option.id = R.head(values) || 0; }"
                  :options="convert_option(option.describe)" placeholder="请选择评分">
                  <template #displayRender="{}">
                    <span>
                      {{ option.score }}
                    </span>
                  </template>
                </a-cascader>
              </div>
              <div class="flex flex-col mx-3">
                <span>评语</span>
                <vxe-textarea v-model="row.annotation" placeholder="非必填，若您有具体评价或改善建议请填此处（后续会发送给供应商）"></vxe-textarea>
              </div>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
  </a-modal>
</template>
<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import XEUtils from 'xe-utils'
import { VXETable, VxeTableInstance } from 'vxe-table'
import * as R from 'ramda'
import { get_batch_pm_score_list, get_batch_perf_score_config } from '@/api/perf/purchasing-score'
import { nextTick } from "process";
export default defineComponent({
  props: {
    perf_score_rows: {
      type: Array,
      default: []
    },
    onClose: Function,
    onUpdate: Function
  },
  async setup(props, ctx) {
    const xTable = ref<VxeTableInstance>()
    const { columns, title } = await get_batch_perf_score_config()
    const columns_name_map = R.mergeAll(R.map((i: any) => ({ [i.key]: R.propOr('Unknown', 'label', i) }), columns))

    const data = reactive({
      tableData: []
    })
    const fetch_data = async () => {
      const { list } = await get_batch_pm_score_list({ perf_score_id: props.perf_score_rows.map(R.prop('id')) })
      data.tableData = list
      nextTick(() => {
        xTable.value?.setAllRowExpand(true)
      })
    }
    await fetch_data()
    const cell_formatter = ({ cellValue, row, column }: any) => `${R.propOr(column.field, column.field, columns_name_map)}: ${cellValue}`

    const convert_option = (describe: any[]) => R.map(
      (options_group: any) => ({
        label: options_group.title,
        value: options_group.id,
        isLeaf: false,
        children: R.map((s: string) => ({ label: s, value: s, isLeaf: true }), options_group.options)
      }),
      describe
    )

    const submit_form = () => {
      props.onUpdate(data.tableData)
      props.onClose()
    }
    return {
      R,
      xTable,
      title,
      data,
      cell_formatter,
      submit_form,
      convert_option,
    }
  }
})
</script>
<style lang="less">
@import './style.less';
</style>