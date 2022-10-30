<template>
  <a-breadcrumb>
    <a-breadcrumb-item>绩效</a-breadcrumb-item>
    <a-breadcrumb-item>绩效评分</a-breadcrumb-item>
  </a-breadcrumb>
  <div class="scoped-purchasing-score-css mt-3 py-3 rounded-[4px] bg-white flex flex-col justify-start">
    <vxe-toolbar class="!px-[22px] !py-[24px]" style="border-bottom: 1px solid rgb(0,0,0,0.1);">
      <template #buttons>
        <span class="text-2xl font-bold">
          {{ data.title }}
        </span>
      </template>
      <template #tools>
        <a-space>
          <a-button :disabled="xTable && !(xTable.isAllCheckboxChecked() || xTable.isAllCheckboxIndeterminate())"
            type="primary" @click="submit_rows"><template #icon>
              <svg-icon name="submit" />
            </template>提交</a-button>

          <a-button v-if="is_show" :disabled="xTable && !(xTable.isAllCheckboxChecked() || xTable.isAllCheckboxIndeterminate())"
            type="primary" danger @click="del_score">
            <template #icon>
              <svg-icon name="end" />
            </template>
            不评分
          </a-button>
          <a-button :disabled="xTable && !(xTable.isAllCheckboxChecked() || xTable.isAllCheckboxIndeterminate())"
            @click="handle_show_transfer_form"><template #icon>
              <svg-icon name="reject" />
            </template>转交</a-button>
          <a-button v-if="is_show"  @click="add_score">
            <template #icon>
              <PlusOutlined />
            </template>
            增加评分
          </a-button>
        </a-space>
      </template>
    </vxe-toolbar>
    <vxe-toolbar class="!px-[22px] !py-[24px] min-h-[70px]">
      <template #buttons>
        <span class="mr-3 font-bold">单据选择</span>
        <vxe-checkbox :model-value="all_checked" :indeterminate="indeterminate" @change="e => set_check_all(e.checked)">
          全选
        </vxe-checkbox>
        <vxe-checkbox @change="e => toggle_all_checkbox()">
          反选
        </vxe-checkbox>
        <span :class="xTable?.getCheckboxRecords().length > 0 ? 'opacity' : 'opacity-0'"
          class="text-sm mx-3 min-w-[150px] text-center">已选中 {{
          xTable?.getCheckboxRecords().length
          }} 个数据</span>
        <a-divider type="vertical" style="border-left: 1px solid rgba(0, 0, 0, 0.4);height:22px;margin-right:40px;" />
        <a-button :disabled="xTable && !(xTable.isAllCheckboxChecked() || xTable.isAllCheckboxIndeterminate())"
          @click="handle_show_batch_score_form">
          批量打分
        </a-button>
      </template>
    </vxe-toolbar>

    <vxe-table ref="xTable" :expand-config="{ expandAll: true }" :show-header="false" row-class-name="tb-row"
      :checkbox-config="{ checkField: 'checked' }" show-overflow="title" :border="'none'" round auto-resize
      :scroll-x="{ gt: 20 }" :scroll-y="{ enabled: false }" :data="data.tableData">
      <vxe-column type="checkbox" width="60px" class-name="pl-[12px]" fixed="left"></vxe-column>
      <vxe-column field="supplier_name" :formatter="cell_formatter" show-overflow="title"></vxe-column>
      <vxe-column field="category" :formatter="cell_formatter" show-overflow="title"></vxe-column>
      <vxe-column field="project_name" :formatter="cell_formatter" show-overflow="title"></vxe-column>
      <vxe-column field="thing_detail">
        <template #default="{ row }">
          被评分的需求：
          <a-button type="link" class="!pl-0" @click="handle_show_detail_row(row)">查看需求详情</a-button>
        </template>
      </vxe-column>
      <vxe-column field="add_remark">
        <template #default="{ row }">
          <a-popover title="" v-if="row.type == '1'">
            <template #content>
              <p>{{ row.add_remark }}</p>
            </template>
            <a-button type="link" class="!pl-0">新增</a-button>
          </a-popover>
        </template>
      </vxe-column>
      <vxe-column>
        <template #default="{ row }">
          <a-tooltip v-if="row.is_transfer" :title="row.transfer_remark">
            <a-button type="link">被转交</a-button>
          </a-tooltip>
        </template>
      </vxe-column>
      <vxe-column type="expand" :visible="false">
        <template #content="{ row }">
          <div class="py-[11px] px-[70px] w-full min-h-[80px] grid grid-cols-[repeat(auto-fit,_minmax(200px,_auto))]">
            <div v-for="option in row.score_options" :key="option.id" class="flex flex-col mr-3">
              <span class="pb-[11px]"><span class="text-red-600"> * </span>{{ option.score_option.name }}</span>
              <a-cascader :class="row.checked && !option.score_option.score ? 'required-error' : ''"
                expand-trigger="hover" :value="[option.id, option.score]"
                @change="(values: string[] = []) => { option.score_option.score = R.last(values) || 0; option.score_option.id = R.head(values) || 0; auto_check(row) }"
                :options="convert_option(option.score_option.describe)" placeholder="请选择评分">
                <template #displayRender="{}">
                  <span>
                    {{ option.score_option.score ? `${option.score_option.score} 分` : '' }}
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
        type="11200" />
    </suspense>
    <suspense>
      <TransferForm v-if="show_transfer_form" :onClose="() => { show_transfer_form = false }" :onUpdate="fetch_data"
        node="11200" :rows="xTable.getCheckboxRecords()" />
    </suspense>
    <suspense>
      <BatchScoreForm v-if="show_batch_score_form" :perf_score_rows="xTable.getCheckboxRecords()"
        :onClose="() => show_batch_score_form = false" :onUpdate="handle_batch_update" />
    </suspense>
    <suspense>
      <DelScore v-if="show_del_score" :rows="xTable.getCheckboxRecords()" :onClose="() => show_del_score = false"
        :onUpdate="fetch_data" />
    </suspense>
    <suspense>
      <AddScore v-if="show_add_score" :rows="xTable.getCheckboxRecords()" :onClose="() => show_add_score = false"
        :onUpdate="fetch_data" />
    </suspense>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch, computed, inject } from 'vue'
import * as R from 'ramda'
import XEUtils from 'xe-utils'
import { VXETable, VxeTableInstance } from 'vxe-table'
import DemandDetail from '@/components/perf_score/demand_detail/index.vue'
import TransferForm from '@/components/perf_score/transfer_form.vue'
import AddScore from '@/components/perf_score/add_score/index.vue'
import DelScore from '@/components/perf_score/del_score/index.vue'
import BatchScoreForm from '@/components/perf_score/batch_score_form/index.vue'
import { data } from './state'
import { get_pm_score_list, post_pm_submit_score } from '@/api/perf/purchasing-score'
import { get_perf_score_config } from '@/api/perf/index'
import { message } from 'ant-design-vue'
import { nextTick } from 'process'
import { PlusOutlined } from '@ant-design/icons-vue'



export default defineComponent({
  components: {
    DemandDetail,
    TransferForm,
    BatchScoreForm,
    DelScore,
    AddScore,
    PlusOutlined
  },
  async setup() {
    const xTable = ref<VxeTableInstance>()
    const popup_in_parent: any = inject('popup_in_parent')
    const pager = reactive({
      page_index: 1,
      page_size: 1000,
      total: 0
    })
    const show_detail_row = ref(null as any)
    const handle_show_detail_row = (row: any) => {
      // window.parent.postMessage({
      //   key: 'demand', value: {
      //     id: row.id,
      //     type: '11200'
      //   }
      // }, '\*')
      // FIXME 暂时使用旧版的弹窗
      if (!popup_in_parent(DemandDetail, { row, type: '11200' })) {
        show_detail_row.value = row
      }
    }

    const show_transfer_form = ref(false)
    const handle_show_transfer_form = () => {
      if (!popup_in_parent(TransferForm, { rows: xTable.value.getCheckboxRecords(), node: '11200', onUpdate: fetch_data })) {
        show_transfer_form.value = true
      }
    }

    const { columns,is_show } = await get_perf_score_config()
    const columns_name_map = R.mergeAll(R.map((i: any) => ({ [i.key]: R.propOr('Unknown', 'label', i) }), columns))
    const fetch_data = async () => {
      const { list, pager: { page, itemCount: total, pageSize }, title } = await get_pm_score_list(pager)
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
        const res = await post_pm_submit_score({ rows: checked_rows })
        message.info(res.msg)
        fetch_data()
      } catch (e) {
        message.error(e.message)
      }
    }

    const show_batch_score_form = ref(false)

    const handle_show_batch_score_form = () => {
      if (!popup_in_parent(BatchScoreForm, { onUpdate: handle_batch_update, perf_score_rows: xTable.value?.getCheckboxRecords() })) {
        show_batch_score_form.value = true
      }
    }

    const handle_batch_update = (batch_data) => {
      R.map((group) => {
        const target_records = R.innerJoin((record, id) => record.id === id, data.tableData, R.propOr([], 'score_id_list', group))
        R.map((group_o) => {
          // 有在批量表单填写过这个评分项，才更新到对应选项上
          if (group_o.id) {
            R.map(record => {
              const o = R.find(R.propEq('acceptance_evaluate_id', group_o.acceptance_evaluate_id), record.score_options)
              o.score_option.score = group_o.score
              o.score_option.id = group_o.id
            }, target_records)
          }
        }, group.children[0].score_options)
        // 有在批量表单填写过评语，才更新到对应记录的评语
        if (group.annotation) {
          R.map(record => {
            record.annotation = group.annotation
          }, target_records)
        }
      }, batch_data)
      console.log(batch_data)
      console.log(data.tableData)
    }

    // 删除评分
    let show_del_score = ref(false)
    const del_score = () => {
      if (!popup_in_parent(DelScore, { rows: xTable.value.getCheckboxRecords(), onUpdate: fetch_data })) {
        show_del_score.value = true
      }
    }
    let show_add_score = ref(false)
    const add_score = () => {
      console.log('----xTable.value.getCheckboxRecords()',xTable.value.getCheckboxRecords());
      
      if (!popup_in_parent(AddScore, { rows: xTable.value.getCheckboxRecords(), onUpdate: fetch_data })) {
        show_add_score.value = true
      }
    }

    return {
      handle_show_detail_row,
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
      show_transfer_form,
      handle_show_transfer_form,
      show_batch_score_form,
      handle_batch_update,
      handle_show_batch_score_form,
      del_score,
      show_del_score,
      show_add_score,
      add_score,
      is_show
    }

  },
})
</script>

<style scoped lang="less">
@import './style.less';
// /deep/ .required-error {
//   .ant-select-selector {
//     border-color: #ff4d4f;
//   }
// }

// /deep/ .tb-row {
//   background: #E8EFFB;
//   box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
// }

// .tb-pager {
//   background: #E8EFFB;
//   box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
// }
</style>