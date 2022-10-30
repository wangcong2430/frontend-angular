<template>
  <div class="scoped-demand-order-in-production-css h-full w-full flex flex-col">
    <a-breadcrumb>
      <a-breadcrumb-item>跟进</a-breadcrumb-item>
      <a-breadcrumb-item>制作中</a-breadcrumb-item>
    </a-breadcrumb>
    <div class="mt-3 p-3 rounded-[4px] bg-white ">
      <FilterForm :search_form="search_form" v-model:filters="filters" />
    </div>
    <div class="mt-3 py-3 rounded-[4px] bg-white flex flex-col justify-start h-full overflow-hidden">
      <vxe-toolbar class="!px-[12px] !py-[24px] min-h-[70px]">
        <template #buttons>
          <span class="mr-3 font-bold">单据选择</span>
          <vxe-checkbox :model-value="all_checked" :indeterminate="indeterminate"
            @change="e => set_check_all(e.checked)">
            全选
          </vxe-checkbox>
          <vxe-checkbox @change="e => toggle_all_checkbox()">
            反选
          </vxe-checkbox>
          <!-- <span :class="xTable?.getCheckboxRecords().length > 0 ? 'opacity' : 'opacity-0'"
          class="text-sm mx-3 min-w-[150px] text-center">已选中 {{
              xTable?.getCheckboxRecords().length
          }} 个数据</span> -->
          <a-divider type="vertical"
            style="border-left: 1px solid #E7E7E7;height:22px;margin-left:30px;margin-right:30px;" />
          <span class="mr-3 font-bold">单据展示</span>
          <a-button-group>
            <a-button @click="set_all_expanded">全部展开</a-button>
            <a-button @click="set_all_collapse">全部收起</a-button>
          </a-button-group>
        </template>
        <template #tools>
          <ColumnDragger v-model:columns="children_columns" />
        </template>
      </vxe-toolbar>
      <div class="w-full grow overflow-hidden">
        <vxe-grid ref="xTable" v-bind="grid_options"></vxe-grid>
      </div>
      <div class="w-full pt-3 px-[12px]">
        <t-pagination v-model:current="pager.page_index" :total="pager.total" v-model:pageSize="pager.page_size"
          show-jumper />
      </div>
    </div>

    <suspense>
      <DemandModify v-if="demand_modify_form_state.show" :row="demand_modify_form_state.row"
        :s_row="demand_modify_form_state.s_row"
        :onClose="() => { Object.assign(demand_modify_form_state, { show: false, row: null, s_row: null }) }"
        :onUpdate="reload" />
    </suspense>
    <suspense>
      <Acceptance v-if="acceptance_form_state.show" :row="acceptance_form_state.row"
        :s_row="acceptance_form_state.s_row"
        :onClose="() => { Object.assign(acceptance_form_state, { show: false, row: null, s_row: null }) }"
        :onUpdate="reload" />
    </suspense>
  </div>
</template>

<script lang="tsx" setup>
import * as R from 'ramda'
import { defineComponent, reactive, onMounted, ref, nextTick, watch, onUpdated, computed, h, onUnmounted } from 'vue'
import { get_in_production_order_list, get_in_production_config } from '@/api/demand-order/in-production.ts'
import { VxeTableInstance, VxeTableEvents, VxeColumnPropTypes, VxeGridProps, VxePagerEvents } from 'vxe-table'
import { UpOutlined, DownOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import DemandModify from '@/components/demand-order/demand-modify.vue'
import Acceptance from '@/components/demand-order/acceptance.vue'
import { build_grid_options, transfer_columns, build_columns, use_build_grid_options, use_build_columns, use_build_search } from '@@/utils/grid-generator'
import OaSteps from '@/components/oa_steps/index.vue'
import FilterForm from '@/components/filter_form/index.vue'
import ThumbShower from '@/components/thumb_shower/index.vue'
import ColumnDragger from '@/components/draggableFilter_v2/index.vue'
import Chat from '@@/components/communicationPopUpWindow/components/chat.vue'

const { columns, columnChildren, search_form } = await get_in_production_config()

const Cell = ({ row }) => {
  const handle_click = () => {
    row_expanded[row.id] = !row_expanded[row.id]
  }
  const counter = {
    total: R.pathOr('', ['thing_num', 'total'], row),
    reject_to_demand: R.pathOr('', ['thing_num', 'reject_to_demand'], row),
    inquiry: R.pathOr('', ['thing_num', 'inquiry'], row),
    making: R.pathOr('', ['thing_num', 'making'], row),
    in_acceptance: R.pathOr('', ['thing_num', 'in_acceptance'], row),
    accepted: R.pathOr('', ['thing_num', 'accepted'], row)
  }
  if (!row) {
    return null
  }
  return (
    <div class="flex items-center cursor-pointer min-h-[44px]" onClick={handle_click}>
      <a-space>
        <div class="fee-tag">{R.propOr('', 'category_type_name', row)}</div>
        <div class="flex flex-wrap items-between gap-x-4">
          <span>需求名称：{R.propOr('', 'story_name', row)}</span>
          <span>需求单号：{R.propOr('', 'story_code', row)}</span>
          <span>所属产品：{R.propOr('', 'product_name', row)}</span>
          {R.propOr('', 'project_group_name', row) && <span>所属母项目：{R.propOr('', 'project_group_name', row)}</span>}
          {R.propOr('', 'project_product_budget_name', row) && <span>立项信息：{R.propOr('', 'project_product_budget_name', row)}</span>}
          <span>
            数量：
            <a-popover v-slots={{
              content: () => (
                <div class="flex flex-col items-start">
                  <div class="flex justify-between w-full">
                    <span>需求物件总数：</span><span>{counter.total}</span>
                  </div>
                  {counter.reject_to_demand ? <div class="flex justify-between w-full">
                    <span>驳回至需求：</span><span>{counter.reject_to_demand}</span>
                  </div> : null}
                  {counter.inquiry ? <div class="flex justify-between w-full">
                    <span>议价中：</span><span>{counter.inquiry}</span>
                  </div> : null}
                  {counter.making ? <div class="flex justify-between w-full">
                    <span>制作中：</span><span>{counter.making}</span>
                  </div> : null}
                  {counter.in_acceptance ? <div class="flex justify-between w-full">
                    <span>验收中：</span><span>{counter.in_acceptance}</span>
                  </div> : null}
                  {counter.accepted ? <div class="flex justify-between w-full">
                    <span>已验收：</span><span>{counter.accepted}</span>
                  </div> : null}
                </div>
              )
            }}>
              <a>{R.pathOr('', ['thing_num', 'total'], row)}</a>
            </a-popover></span>
          <span>创建时间：{R.propOr('', 'create_time', row)}</span>
          <span>制单人：{R.propOr('', 'creator_name', row)}</span>
        </div>
      </a-space>
    </div>
  )
}


const custom_column_options = {
  thumb: {
    className: '!py-[5px]',
    minWidth: '130px',
  },
  thing_final_work_thumb: {
    className: '!py-[5px]',
    minWidth: '130px',
  },
  pass_degree_str: {
    minWidth: '500px',
  },
  category_text: {
    minWidth: '200px',
  },
  _thing: {
    minWidth: '250px',
  },
  expected_or_committed_complete_date: {
    minWidth: '150px'
  },
  pre_workload: {
    minWidth: '100px'
  },
  remark: {
    showOverflow: 'tooltip',
  },
}

const column_type_slots = {
  _thing: ({ row }) => {
    const tags = [row.category, ...R.map(R.prop('value'), row.attribute_check)]
    const handle_show_thing_detail = () => {
      if (window.parent !== window) {
        console.log('[injecting parent modal] ', row)
        window.parent.postMessage({
          key: 'thing', value: {
            id: row.id
          }
        }, '\*')
      }
    }
    return (
      <div class="flex items-center flex-start">
        <div class="flex flex-col">
          <span>{row.thing_name}</span>
          <div>
            <a class="mr-1" onClick={(e) => { handle_show_thing_detail(); e.stopPropagation() }}>
              {row.thing_code}
            </a>
            <a-popover v-slots={{
              content: () => {
                return (
                  <div class="flex flex-col w-[400px] gap-1">
                    <div class="flex">
                      <span class="font-bold break-all">{row.thing_name}</span>
                      <span class="pl-3 opacity-[0.6]">{row.thing_code}</span>
                    </div>
                    <div class="flex flex-wrap gap-y-3 mt-3">
                      {tags.map(tag => <a-tag class="my-1">#{tag}</a-tag>)}
                    </div>
                  </div>
                )
              }
            }}>
              <InfoCircleOutlined />
            </a-popover>
          </div>
          <div class="flex flex-wrap">
            {row.change_rejected === 1 && <a-tag color='error'>变更驳回</a-tag>}
            {row.is_price_apply === '1' && <a-tag color='warning'>变更中</a-tag>}
            {row.change_pass === 1 && <a-tag color='warning'>已变更</a-tag>}
            {row.is_secret === 1 && <a-tag color='warning'>保密</a-tag>}
            {row.is_test === '1' && <a-tag color="processing">测试单</a-tag>}
            {row.demand_type === '画师' && <a-tag color="processing">画师</a-tag>}
            {row.demand_type === '基地' && <a-tag color="processing">基地</a-tag>}
          </div>
        </div>
        { /*<a-divider type="vertical" class="!h-[36px]" style="border-left: 1px solid rgba(231, 231, 231, 1)" />*/}
        <div class="ml-[51px]">
          <Chat thing={row} />
        </div>
      </div>
    )
  },
  _image_final: ({ row }) => h(ThumbShower, { key: row.thing_final_work_thumb, slug: row.thing_final_work, class: "h-[100px]" }),
  _image: ({ row }) => h(ThumbShower, { key: row.thumb, slug: row.img, class: "h-[100px]" }),
  _workload: ({ row }) => {
    return (
      <span>
        {parseFloat(row.pre_workload)}{row.workload_unit}
      </span>
    )
  },
  _pass_degree: ({ row }) => {
    // HACK
    if (row.pass_degree == '0') {
      row.pass_degree = null
    }
    const disabled_1 = row.pass_degree === null || row.pass_degree === '1'
    const disabled_2 = row.pass_degree === null || (row.pass_degree === '1' && row.is_test !== '1')
    return (
      <div class="flex w-full justify-between items-center " onClick={(e) => e.stopPropagation()}>
        { /* <a-select v-model:value={row.pass_degree} placeholder="通过程度" style={{ width: '230px' }} options={[
          { label: '通过', value: '1' },
          { label: '部分通过', value: '2' },
          { label: '不通过', value: '3' },
        ]}></a-select> */}
        <a-radio-group v-model:value={row.pass_degree}>
          <a-radio class="flex" value="1">通过</a-radio>
          <a-radio class="flex" value="2">部分通过</a-radio>
          <a-radio class="flex" value="3">不通过</a-radio>
        </a-radio-group>
        <a-input-number v-model:value={row.settlement_ratio} disabled={disabled_1} placeholder="结算比例" addon-after="%" controls={false} min={0} max={100} style={{ width: '130px' }} />
        <a-input v-model:value={row.acceptance_reason} disabled={disabled_2} placeholder="验收说明" style={{ width: '230px' }} />
      </div>
    )
  },
}


const children_columns = ref(transfer_columns({ columns: columnChildren, custom_column_options }))
const { columns: s_grid_columns } = use_build_columns(
  {
    columns: children_columns,
    column_type_slots,
    pretend_columns: [
      {
        field: 'checkbox',
        type: 'checkbox',
        width: '70px',
        align: 'left',
        title: '序号',
        fixed: 'left',
        slots: {
          checkbox: ({ row, rowIndex, checked, indeterminate, disabled }) => (
            <div class="flex items-center">
              <vxe-checkbox
                modelValue={checked}
                indeterminate={indeterminate}
                disabled={disabled}
                onChange={({ $event }) => {
                  $event.preventDefault()
                  row.checked = !row.checked
                }}
              ></vxe-checkbox>
              <span>{rowIndex + 1}</span>
            </div>
          )
        }
      }
    ],
    // suffix_columns: [
    //   {
    //     field: 'operation',
    //     width: '150px',
    //     fixed: 'right',
    //     title: '操作',
    //     slots: {
    //       default: ({ row: s_row }) => (
    //         <div class="flex justify-between" onClick={(e) => e.stopPropagation()}>
    //           {/* TODO */}
    //           {false && (
    //             <a-button class="!px-1 !min-w-[60px]" size="small" onClick={() => {
    //               acceptance_form_state.row = row
    //               acceptance_form_state.s_row = s_row
    //               acceptance_form_state.show = true
    //             }} type="link">确认验收</a-button>
    //           )}
    //           {/* TODO */}
    //           {false && (
    //             <a-button class="!px-1 !min-w-[60px]" size="small" onClick={() => {
    //               demand_modify_form_state.row = row
    //               demand_modify_form_state.s_row = s_row
    //               demand_modify_form_state.show = true
    //             }} type="link">需求变更</a-button>
    //           )}
    //           {/* TODO */}
    //           {false && (
    //             <a-button class="!px-1 !min-w-[60px]" size="small" onClick={() => { console.log(s_row) }} type="link">撤销变更</a-button>
    //           )}
    //         </div>
    //       )
    //     }
    //   }
    // ]
  },
)

const ExpandedGrid = defineComponent({
  props: ['row', 'column'],
  setup({ row, column }) {
    const s_xTable = ref()
    const fetcher = () => ({ data: row.children, total: row.children.length, page_index: 1, page_size: 20 })
    const { grid_options: s_grid_options } = use_build_grid_options({
      table_ref: s_xTable,
      custom_options: {
        params: { parent_row: row },
        'checkbox-config': {
          checkField: 'checked', showHeader: false, trigger: 'row', highlight: true,
          checkMethod: ({ row }) => row.is_price_apply !== '1'
        },
        'max-height': '500px',
        'keep-source': true,
        // 'scroll-y': { mode: 'wheel' },
        'header-row-class-name': "bg-white text-[rgba(0,0,0,0.4)]",
      },
      grid_columns: s_grid_columns,
      fetcher,
    })
    return () => (
      <div class="w-full h-full">
        <div class="w-full">
          {row_expanded[row.id] && <vxe-grid ref={s_xTable} {...s_grid_options}></vxe-grid>}
        </div>
        <div class="h-[16px]"></div>
      </div>
    )
  }
})

const demand_modify_form_state = reactive({
  show: false,
  row: null,
  s_row: null
})
const acceptance_form_state = reactive({
  show: false,
  row: null,
  s_row: null,
})

const xTable = ref()

const { filters } = use_build_search({ search_form })

const fetcher = async ({ pager, filters }) => {
  const _filters = R.filter(
    value => !!value,
    R.map(value => {
      if (R.is(Array, value)) {
        return value.toString()
      }
      return value
    }, filters)
  )
  const { data: { list, pager: { page, itemCount, pageSize } } } = await get_in_production_order_list({ ...pager, filters: _filters })
  return { data: list, page_index: Number(page), page_size: Number(pageSize), total: Number(itemCount) }
}
const on_fetched = () => {
  nextTick(() => {
    xTable.value?.setAllRowExpand(true)
  })
}

const { columns: grid_columns } = use_build_columns({
  pretend_columns: [
    {
      width: '40px',
      align: 'left',
      slots: {
        // default: ({ row }) => <CheckCell key={row.id} row={row} />
        // default: ({ row }) => h(CheckCell, { key: `${row.id}${pager.page_index}${pager.page_size}`, row })
        default: ({ row }) => {
          const s_rows = R.reject(s_row => s_row.is_price_apply === '1', row.children)
          return <vxe-checkbox
            modelValue={s_rows.length > 0 && R.all(R.prop('checked'), s_rows)}
            indeterminate={R.any(R.prop('checked'), s_rows)}
            disabled={s_rows.length <= 0}
            onChange={({ checked }) => {
              R.map(s_row => { s_row.checked = checked }, s_rows)
            }}
          ></vxe-checkbox>
        }
      },
    },
    {
      slots: {
        default: ({ row, column }) => <Cell row={row}></Cell>
      }
    },
    {
      width: '50px',
      align: 'right',
      slots: {
        default: ({ row }) => {
          const handleClick = () => {
            row_expanded[row.id] = !row_expanded[row.id]
          }
          return row_expanded[row.id] ? <UpOutlined onClick={handleClick} /> : <DownOutlined onClick={handleClick} />
        }
      },
    },
    {
      type: 'expand',
      visible: false,
      slots: {
        content: ({ row, column }) => h(ExpandedGrid, { row, column })
        // content: ({ row, column }) => <ExpandedGrid row={row} column={column} />
      }
    },
  ],
  column_type_slots,
})

const { grid_options, pager, reload } = use_build_grid_options({
  table_ref: xTable,
  custom_options: {
    'show-header': false,
    'expand-config': { expandAll: true },
    'row-class-name': "tb-row",
  },
  grid_columns,
  grid_filters: filters,
  fetcher,
  on_fetched,
})


const row_expanded = reactive({})

const all_checked = computed(() => {
  const s_rows = R.flatten(R.map(R.prop('children'), xTable.value?.getTableData().tableData || []))
  return s_rows.length > 0 && R.all(R.prop('checked'), R.reject(s_row => s_row.is_price_apply === '1', s_rows))
})
const indeterminate = computed(() => {
  const s_rows = R.flatten(R.map(R.prop('children'), xTable.value?.getTableData().tableData || []))
  return R.any(R.prop('checked'), R.reject(s_row => s_row.is_price_apply === '1', s_rows))
})

const set_check_all = (checked) => {
  R.map(row => {
    R.map(s_row => {
      if (s_row.is_price_apply !== '1') {
        s_row.checked = checked
      }
    }, row.children)
  }, xTable.value?.getTableData().tableData)
}
const toggle_all_checkbox = () => {
  R.map(row => {
    R.map(s_row => {
      if (s_row.is_price_apply !== '1') {
        s_row.checked = !s_row.checked
      }
    }, row.children)
  }, xTable.value?.getTableData().tableData)
}
const set_all_collapse = () => {
  R.map(row => {
    row_expanded[row.id] = false
  }, xTable.value?.getTableData().tableData)
}
const set_all_expanded = () => {
  R.map(row => {
    row_expanded[row.id] = true
  }, xTable.value?.getTableData().tableData)
}

// const test = () => {
//   console.log(xTable.value?.getTableData().tableData)
// }

</script>
<style lang="less">
@import './style.less';
</style>