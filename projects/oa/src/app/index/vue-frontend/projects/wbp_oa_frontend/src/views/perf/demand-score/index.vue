<template>
  <a-breadcrumb>
    <a-breadcrumb-item>绩效</a-breadcrumb-item>
    <a-breadcrumb-item>绩效评分</a-breadcrumb-item>
  </a-breadcrumb>
  <div class="scoped-demand-score-css mt-3 py-3 rounded-[4px] bg-white flex flex-col justify-start">
    <vxe-toolbar class="!px-[22px] !py-[24px]" style="border-bottom: 1px solid rgb(0,0,0,0.1);">
      <template #buttons>
        <span class="text-2xl font-bold">
          {{ data.title }}
        </span>
      </template>
      <template #tools>
        <a-space>
          <a-button :disabled="xTable && !(xTable.isAllCheckboxChecked() || xTable.isAllCheckboxIndeterminate())" type="primary" @click="submit_rows">
            <template #icon>
              <svg-icon name="submit" />
            </template>
            提交
          </a-button>
          <a-button :disabled="xTable && !(xTable.isAllCheckboxChecked() || xTable.isAllCheckboxIndeterminate())"
            @click="handle_show_transfer_form">
            <template #icon>
              <svg-icon name="reject" />
            </template>
            转交
          </a-button>
        </a-space>
      </template>
    </vxe-toolbar>
    <vxe-toolbar class="!px-[22px] !py-[24px] min-h-[70px]">
      <template #buttons>
        <vxe-checkbox :model-value="all_checked" :indeterminate="indeterminate" @change="e => set_check_all(e.checked)">
          全选
        </vxe-checkbox>
        <vxe-checkbox @change="e => toggle_all_checkbox()">
          反选
        </vxe-checkbox>
        <span v-if="xTable?.getCheckboxRecords().length > 0" class="text-sm ml-3">已选中 {{ xTable?.getCheckboxRecords().length }} 个数据</span>
      </template>
    </vxe-toolbar>

    <vxe-table ref="xTable" :expand-config="{ expandAll: true }" :show-header="false" row-class-name="tb-row"
      :checkbox-config="{ checkField: 'checked' }" show-overflow :border="'none'" round auto-resize
      :scroll-x="{ gt: 20 }" :scroll-y="{ enabled: false }" :data="data.tableData">
      <vxe-column type="checkbox" width="60px" class-name="pl-[12px]" fixed="left"></vxe-column>
      <vxe-column field="supplier_name" :formatter="cell_formatter"></vxe-column>
      <vxe-column field="category" :formatter="cell_formatter"></vxe-column>
      <vxe-column field="project_name" :formatter="cell_formatter"></vxe-column>
      <vxe-column field="thing_detail">
        <template #default="{ row }">
          被评分的需求：
          <a-button type="link" class="!pl-0" @click="handle_show_detail_row(row)">查看需求详情</a-button>
        </template>
      </vxe-column>
      <vxe-column>
        <template #default="{ row }">
          <a-tooltip v-if="row.is_reject" :title="row.remark">
            <a-button type="text" danger>被驳回</a-button>
          </a-tooltip>
          <a-tooltip v-if="row.is_transfer" :title="row.transfer_remark">
            <a-button type="link">被转交</a-button>
          </a-tooltip>
        </template>
      </vxe-column>
      <vxe-column type="expand" :visible="false">
        <template #content="{ row }">
          <div class="px-[70px] w-full min-h-[80px] grid grid-cols-[repeat(auto-fit,_minmax(200px,_auto))]">
            <div v-for="option in row.score_options" :key="option.id" class="flex flex-col mr-3">
              <span><span class="text-red-600"> * </span>{{ option.score_option.name }}</span>
              <a-cascader :class="row.checked && !option.score_option.score ? 'required-error' : ''"
                expand-trigger="hover"
                @change="(values: string[] = []) => { option.score_option.score = R.last(values) || 0; option.score_option.id = R.head(values) || 0; auto_check(row) }"
                :options="convert_option(option.score_option.describe)" placeholder="请选择评分">
                <template #displayRender="{}">
                  <span>
                    {{ option.score_option.score }} 分
                  </span>
                </template>
              </a-cascader>
            </div>
            <div class="flex flex-col mr-3">
              <span>评语</span>
              <vxe-textarea v-model="row.annotation" placeholder="非必填，若您有具体评价或改善建议请填此处（后续会发送给供应商）"></vxe-textarea>
            </div>
          </div>
        </template>
      </vxe-column>
    </vxe-table>

    <!-- <vxe-pager v-model:current-page="pager.page_index" v-model:page-size="pager.page_size" :total="pager.total"
      class="tb-pager">
    </vxe-pager> -->
    <suspense>
      <DemandDetail v-if="show_detail_row" :row="show_detail_row" :onClose="() => { show_detail_row = null }"
        type="11000" />
    </suspense>
    <suspense>
      <TransferForm v-if="show_transfer_form" :onClose="() => { show_transfer_form = false }" :onUpdate="fetch_data"
        node="11000" :rows="xTable.getCheckboxRecords()" />
    </suspense>
  </div>
  <!-- <materialPopUp :id="'17056'" ref="materialPopUp"></materialPopUp> -->
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch, computed, inject } from 'vue'
import * as R from 'ramda'
import XEUtils from 'xe-utils'
import { VXETable, VxeTableInstance } from 'vxe-table'
import DemandDetail from '@/components/perf_score/demand_detail/index.vue'
import TransferForm from '@/components/perf_score/transfer_form.vue'
import { data } from './state'
import { get_demand_person_score_list, post_dm_submit_score } from '@/api/perf/demand-score'
import { get_perf_score_config } from '@/api/perf/index'
import { message } from 'ant-design-vue'
import { nextTick } from 'process'
import materialPopUp from '@/components/perf_score/materialPopUp.vue'


export default defineComponent({
  components: {
    DemandDetail,
    TransferForm,
    materialPopUp
  },
  async setup() {
    const popup_in_parent: any = inject('popup_in_parent')
    const xTable = ref<VxeTableInstance>()
    const pager = reactive({
      page_index: 1,
      page_size: 1000,
      total: 0
    })

    const { columns } = await get_perf_score_config()
    const columns_name_map = R.mergeAll(R.map((i: any) => ({ [i.key]: R.propOr('Unknown', 'label', i) }), columns))
    const fetch_data = async () => {
      const { list, pager: { page, itemCount: total, pageSize }, title } = await get_demand_person_score_list(pager)
      data.tableData = list
      data.title = title
      pager.page_index = Number(page)
      pager.total = Number(total)
      nextTick(() => {
        xTable.value?.setAllRowExpand(true)
      })
    }
    await fetch_data()
    watch([() => pager.page_index, () => pager.page_size], fetch_data)

    const show_detail_row = ref(null)
    const handle_show_detail_row = (row: any) => {
      // window.parent.postMessage({
      //   key: 'demand', value: {
      //     id: row.id,
      //     type: '11000'
      //   }
      // }, '\*')
      if (!popup_in_parent(DemandDetail, { row, type: '11000' })) {
        show_detail_row.value = row
      }
    }

    const show_transfer_form = ref(false)
    const handle_show_transfer_form = () => {
      if (!popup_in_parent(TransferForm, { rows: xTable.value.getCheckboxRecords(), node: '11000', onUpdate: fetch_data })) {
        show_transfer_form.value = true
      }
    }

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

    const auto_check = (row: any) => {
      console.log(row)
      if (R.all(R.identity, R.map(R.path(['score_option', 'score']), row.score_options))) {
        xTable.value?.setCheckboxRow([row], true)
      }
    }

    const set_check_all = (checked: boolean) => {
      xTable.value?.setAllCheckboxRow(checked)
    }

    const indeterminate = computed(() => {
      return xTable.value?.isAllCheckboxIndeterminate()
    })
    const all_checked = computed(() => {
      return xTable.value?.isAllCheckboxChecked()
    })

    const toggle_all_checkbox = () => {
      const checked_rows = xTable.value?.getCheckboxRecords()
      const unchecked_rows = R.reject((row: any) => R.includes(R.prop('id', row), R.map(R.prop('id'), checked_rows)), xTable.value?.data)
      xTable.value?.setCheckboxRow(checked_rows, false)
      xTable.value?.setCheckboxRow(unchecked_rows, true)
    }

    const submit_rows = async () => {
      const checked_rows = xTable.value?.getCheckboxRecords()
      if (R.length(checked_rows) === 0) {
        message.error('请先选择提交数据')
        return
      }
      const scores = R.map(R.pathOr(0, ['score_option', 'score']), R.flatten(R.map(R.propOr([], 'score_options'), checked_rows)))
      if (R.any(R.not, scores)) {
        message.error('有评分未填写')
        return
      }
      try {
        const res = await post_dm_submit_score({ rows: checked_rows })
        message.info(res.msg)
        fetch_data()
      } catch (e) {
        message.error(e.message)
      }
    }

    return {
      R,
      data,
      pager,
      xTable,
      columns_name_map,
      cell_formatter,
      convert_option,
      auto_check,
      set_check_all,
      fetch_data,
      indeterminate,
      all_checked,
      toggle_all_checkbox,
      submit_rows,
      show_detail_row,
      handle_show_detail_row,
      show_transfer_form,
      handle_show_transfer_form,
    }

  },
})
</script>

<style scoped lang="less">
@import './style.less';
</style>