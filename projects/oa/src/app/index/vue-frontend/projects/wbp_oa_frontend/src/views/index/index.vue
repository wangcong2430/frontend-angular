<template>
  <vxe-toolbar>
    <template #buttons>
      <vxe-button @click="xTable.toggleAllCheckboxRow()">全选TODO</vxe-button>
      <vxe-button @click="xTable.toggleAllCheckboxRow()">反选TODO</vxe-button>
      <vxe-button @click="test">检查</vxe-button>
    </template>
  </vxe-toolbar>

  <vxe-table ref="xTable" :expand-config="{ expandAll: true }" :show-header="false" row-class-name="bg-sky-300"
    :checkbox-config="{ checkField: 'checked' }" show-overflow height="100%" :border="'full'" round auto-resize
    :scroll-x="{ gt: 20 }" :scroll-y="{ gt: 20 }" :data="data.tableData">
    <vxe-column type="checkbox" width="50px" fixed="left"></vxe-column>
    <vxe-column field="project_name" :formatter="cell_formatter">
    </vxe-column>
    <vxe-column field="category" :formatter="cell_formatter"></vxe-column>
    <vxe-column field="supplier_name" :formatter="cell_formatter"></vxe-column>
    <vxe-column field="thing_detail" :formatter="() => 'TODO'"></vxe-column>
    <vxe-column type="expand" width="0">
      <template #content="{ row }">
        <div class="flex w-full flex-wrap min-h-[80px] items-center justify-center flex-wrap">
          <div class="flex mx-6">
            <div v-for="option in row.score_options" :key="option.id" class="flex flex-col mx-3">
              <span><span class="text-red-600"> * </span>{{ option.score_option.name }}</span>
              <a-cascader @change="(values: string[]) => option.score_option.score = R.last(values)"
                :options="convert_option(option.score_option.describe)" placeholder="请选择评分阶段">
                <template #displayRender="{}">
                  <span>
                    {{ option.score_option.score }}
                  </span>
                </template>
              </a-cascader>
            </div>
          </div>
        </div>
      </template>
    </vxe-column>

  </vxe-table>
</template>
<script lang="ts">
import { defineComponent, onUpdated, reactive, ref } from 'vue'
import * as R from 'ramda'
import XEUtils from 'xe-utils'
import { VXETable, VxeTableInstance } from 'vxe-table'
import { data } from './state'
import { get_perf_score_config, get_demand_person_score_list } from '@/api/perf_score'
export default defineComponent({
  async setup() {
    const xTable = ref<VxeTableInstance>()
    const pager = reactive({
      page_index: 1,
      page_size: 20
    })

    const { columns } = await get_perf_score_config()
    const { list, pager: { page, itemCount: total, pageSize } } = await get_demand_person_score_list(pager)
    const columns_name_map = R.mergeAll(R.map((i: any) => ({ [i.key]: R.propOr('Unknown', 'label', i) }), columns))
    data.tableData = list

    const cell_formatter = ({ cellValue, row, column }: any) => `${R.propOr(column.field, column.field, columns_name_map)}: ${cellValue}`
    const convert_option = (describe: string) => R.map(
      (str: string) => ({
        label: str,
        value: str,
        isLeaf: false,
        children: R.map((s: string) => ({ label: s, value: s, isLeaf: true }), ['100', '95', '90', '85'])
      }),
      R.split('\n', describe)
    )
    const test = () => console.log(data.tableData)

    return {
      test,
      R,
      data,
      xTable,
      columns_name_map,
      cell_formatter,
      convert_option,
    }

  },
})
</script>


