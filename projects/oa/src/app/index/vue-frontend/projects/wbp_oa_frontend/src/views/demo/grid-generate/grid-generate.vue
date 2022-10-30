<!-- 该例子展示了一个拥有列展示控制的简单表格的生成 -->
<!-- 更推荐使用hooks版本 -->
<template>
  <ColumnDragger v-model:columns="children_columns" />
  <div class="h-[500px] w-full">
    <vxe-grid ref="xTable" v-bind="grid_options"></vxe-grid>
  </div>
</template>

<script lang="tsx" setup>
import * as R from 'ramda'
import ColumnDragger from '@/components/draggableFilter_v2/index.vue'
import { defineComponent, reactive, onMounted, ref, nextTick, watch, onUpdated, computed, h } from 'vue'
import { UpOutlined, DownOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import ThumbShower from '@/components/thumb_shower/index.vue'
import { build_grid_options, transfer_columns, build_columns } from '@@/utils/grid-generator'
import data from './data.json'

const xTable = ref()

const { columns } = await new Promise(resolve => {
  setTimeout(() => {
    resolve({
      columns: [
        {
          "type": "_thing",
          "key": "_thing",
          "label": "物件名称/单号"
        },
        {
          "type": "_image",
          "key": "thumb",
          "label": "展示作品"
        },
        {
          "type": "_image_final",
          "key": "thing_final_work_thumb",
          "label": "交付作品"
        },
        {
          "type": "_workload",
          "key": "pre_workload",
          "label": "数量"
        },
        {
          "type": "_pass_degree",
          "key": "pass_degree_str",
          "label": "通过程度"
        },
        {
          "key": "expected_or_committed_complete_date",
          "label": "期望/承诺交付日期"
        },
        {
          "type": "bubble_tip",
          "key": "remark",
          "label": "物件备注"
        }
      ]
    })
  }, 500)
})

const custom_column_options = {
  thumb: {
    className: '!py-[5px]',
    width: '130px',
  },
  thing_final_work_thumb: {
    className: '!py-[5px]',
    width: '130px',
  },
  pass_degree_str: {
    width: '500px',
  },
  _thing: {
    width: '250px',
  },
  expected_or_committed_complete_date: {
    width: '150px'
  },
  pre_workload: {
    width: '100px'
  },
}

// 返回vnode的方式可以使用jsx语法（_thing），或者使用vue内置的vnode渲染函数（_image）
// jsx和vue组件的定义方式可以参考demo/component-type.vue
const column_type_slots = {
  _thing: ({ row }) => {
    const tags_keys = ['area_style', 'art_style', 'design_engine', 'product_type', 'theme_element']
    const tags = [row.category, ...R.filter(i => i, R.map(tag_key => R.path(['tags_field', tag_key, 'value'], row), tags_keys))]
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
      <div class="flex flex-col">
        <span>{row.thing_name}</span>
        <div>
          <a class="mr-1" onClick={handle_show_thing_detail}>
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
                  <div class="flex flex-wrap">
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
          {row.change_pass === '1' && <a-tag color='warning'>已变更</a-tag>}
          {row.is_secret === '1' && <a-tag color='warning'>保密</a-tag>}
          {row.is_test === '1' && <a-tag color="processing">测试单</a-tag>}
          {row.demand_type === '画师' && <a-tag color="processing">画师</a-tag>}
          {row.demand_type === '基地' && <a-tag color="processing">基地</a-tag>}
        </div>
      </div>
    )
  },
  _image_final: ({ row }) => h(ThumbShower, { key: row.thing_final_work_thumb, thumb: row.thing_final_work_thumb, slug: row.thing_final_work, class: "h-[100px]" }),
  _image: ({ row }) => h(ThumbShower, { key: row.thumb, thumb: row.thumb, slug: row.img, class: "h-[100px]" }),
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
    return (
      <div class="flex w-full justify-between">
        <a-select v-model:value={row.pass_degree} placeholder="通过程度" style={{ width: '100px' }} options={[
          { label: '通过', value: '1' },
          { label: '部分通过', value: '2' },
          { label: '不通过', value: '3' },
        ]}></a-select>
        <a-input-number v-model:value={row.settlement_ratio} disabled={!R.includes(row.pass_degree, ['2', '3'])} placeholder="结算比例" addon-after="%" controls={false} min={0} max={100} style={{ width: '130px' }} />
        <a-input v-model:value={row.acceptance_reason} disabled={!R.includes(row.pass_degree, ['2', '3'])} placeholder="验收说明" style={{ width: '230px' }} />
      </div>
    )
  },
}

const children_columns = ref(transfer_columns({ columns, custom_column_options }))
const grid_columns = ref(build_columns({
  columns: children_columns.value,
  column_type_slots,
}))

const grid_options = build_grid_options({
  'checkbox-config': { checkField: 'checked', showHeader: false, trigger: 'row', highlight: true },
  'header-row-class-name': "bg-white text-[rgba(0,0,0,0.4)]",
  columns: [
    {
      type: 'checkbox',
      field: 'checkbox',
      width: '70px',
      align: 'left',
      title: '序号',
      fixed: 'left',
      slots: {
        checkbox: ({ row, rowIndex, checked, indeterminate }) => (
          <div class="flex items-center">
            <vxe-checkbox
              modelValue={checked}
              indeterminate={indeterminate}
              onChange={() => {
                row.checked = !row.checked
              }}
            ></vxe-checkbox>
            <span>{rowIndex + 1}</span>
          </div>
        )
      }
    },
    ...grid_columns.value,
    {
      field: 'operation',
      width: '150px',
      fixed: 'right',
      title: '操作',
      slots: {
        default: ({ row: s_row }) => (
          <div class="flex justify-between">
            <a-button class="!px-1 !min-w-[60px]" size="small" type="link">确认验收</a-button>
            <a-button class="!px-1 !min-w-[60px]" size="small" type="link">需求变更</a-button>
            <a-button class="!px-1 !min-w-[60px]" size="small" type="link">撤销变更</a-button>
          </div>
        )
      }
    }
  ],
  data
})

watch(() => children_columns, () => {
  grid_columns.value = build_columns({
    columns: children_columns.value,
    column_type_slots,
  })
  grid_options.columns = grid_columns.value
  R.map(column => {
    if (!column.visible) {
      xTable.value?.hideColumn(column.field)
    } else {
      xTable.value?.showColumn(column.field)
    }
  }, grid_options.columns)
  xTable.value?.refreshColumn()
}, { immediate: true, deep: true })

</script>
