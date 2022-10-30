<!-- 该例子展示了一个拥有列展示控制的简单表格的生成 -->
<!-- 生成多级表格的二级表格、普通表格时推荐使用这个方式 -->

<template>
  <div class="mt-3 p-3 rounded-[4px] bg-white ">
    <FilterForm :search_form="search_form" v-model:filters="filters" />
  </div>
  <div class="flex">
    <a-button @click="reload">reload</a-button>
    <ColumnDragger v-model:columns="children_columns" />
  </div>
  <div class="h-[500px] w-full">
    <vxe-grid ref="xTable" v-bind="grid_options"></vxe-grid>
  </div>
  <t-pagination v-model:current="pager.page_index" :total="pager.total" v-model:pageSize="pager.page_size"
    show-jumper />
</template>

<script lang="tsx" setup>
import * as R from 'ramda'
import ColumnDragger from '@/components/draggableFilter_v2/index.vue'
import FilterForm from '@/components/filter_form/index.vue'
import { defineComponent, reactive, onMounted, ref, nextTick, watch, onUpdated, computed, h } from 'vue'
import { UpOutlined, DownOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import ThumbShower from '@/components/thumb_shower/index.vue'
import { build_grid_options, transfer_columns, build_columns, use_build_grid_options, use_build_columns, use_build_search } from '@@/utils/grid-generator'
import data from './data.json'


// 模拟列表config接口返回数据
const { columns, search_form } = await new Promise(resolve => {
  setTimeout(() => {
    resolve({
      search_form: [
        {
          "key": "thing_code",
          "type": "input",
          "templateOptions": {
            "label": "物件单号"
          }
        },
        {
          "key": "story_code",
          "type": "input",
          "templateOptions": {
            "label": "需求单号"
          }
        },
        {
          "key": "thing_name",
          "type": "input",
          "templateOptions": {
            "label": "物件名称"
          }
        },
        {
          "key": "thing_code",
          "type": "input",
          "templateOptions": {
            "label": "物件单号",
            "placeholder": "例:FPI202106090001"
          }
        },
        {
          "key": "story_name",
          "type": "input",
          "defaultValue": "",
          "templateOptions": {
            "label": "需求名称"
          }
        },
      ],
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

const xTable = ref()

// 列的自定义配置，这里其实可以让后端返回就根本不需要这个东西
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

// 与筛选器组件联动
const { filters } = use_build_search({ search_form })

// 与列筛选组件联动
const children_columns = ref(transfer_columns({ columns, custom_column_options }))

const { columns: grid_columns } = use_build_columns({
  // 这里注意要传入一个ref对象，因为要与列筛选功能联动
  // 如果是固定列，可以这样写：columns: ref([obj1, obj2])
  columns: children_columns,
  // 页面定制化组件的键值对
  column_type_slots,
  // 在表头左侧插入的列
  pretend_columns: [
    {
      type: 'checkbox',
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
    }
  ],
  // 在表头右侧插入的列
  suffix_columns: [
    {
      width: '200px',
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
  ]
})

const fetcher = ({ pager: { page_index, page_size }, filters }) => new Promise(resolve => {
  setTimeout(() => {
    resolve({
      data: R.slice(page_size * (page_index - 1), page_size * page_index, data),
      page_index: page_index,
      page_size: page_size,
      total: data.length
    })
  }, 500)
})

const { grid_options, pager, reload } = use_build_grid_options({
  // table ref
  table_ref: xTable,
  // 表格的自定义配置
  custom_options: {
    'checkbox-config': { checkField: 'checked', showHeader: false, trigger: 'row', highlight: true },
    'header-row-class-name': "bg-white text-[rgba(0,0,0,0.4)]",
  },
  grid_columns,
  grid_filters: filters,
  fetcher,
  // 这里可以执行一些特殊的需求，比如自动打开展开行啥的
  on_fetched: () => {
    console.log('fetched')
  }
})

</script>
