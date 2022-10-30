# 与后端的协定

现有的每个列表页的展示是通过两个api来控制的：

1. config接口，例如：/web/story/making-list-config
2. list接口，例如：/web/story/making-list

config接口是获取页面配置的，比如：

1. 列头：columns
2. 子表列头：children_columns
3. 可筛选项：search_form。代表list接口可以筛选的参数

> 注意：
> columns和children_columns需要与后端约定特殊的key，比如：type代表在单元格里面用什么组件展示，比如_image，则前端需要实现_image对应的组件展示该字段，也可能没有type，则后端需要返回key，表示直接访问数据的哪个字段(支持aa.bb.cc格式层级访问)，label代表表头文案

# 使用方法

以下是一个config接口响应的数据结构：

```json
{
    "columns": [
        {
            "key": "category_type_name",
            "label": "title"
        },
        {
            "key": "story_name",
            "type": "bubble_tip_text",
            "label": "需求名称"
        },
        {
            "key": "story_code",
            "label": "需求单号"
        },
        {
            "key": "product_name",
            "label": "所属产品"
        },
        {
            "type": "attribute",
            "width": "250px",
            "key": "attribute_check",
            "label": "标签"
        },
        {
            "key": "project_group_name",
            "label": "所属母项目"
        },
        {
            "key": "project_product_budget_name",
            "label": "立项信息"
        },
        {
            "key": "thing_num",
            "label": "物件数量"
        },
        {
            "key": "create_time",
            "label": "create time"
        },
        {
            "key": "creator_name",
            "label": "制单人"
        }
    ],
    "search_form": [
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
            "key": "agent_pm_name",
            "type": "select-oa-user",
            "templateOptions": {
                "label": "采购经理"
            }
        },
        {
            "key": "committed_delivery_date",
            "type": "date_range",
            "templateOptions": {
                "label": "承诺交付日期"
            }
        }
    ],
    "columnChildren": [
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
    ],
}

```

## 直接使用
通过`transfer_columns`可以把columns 和 children_columns 快速转换成vxe-grid使用的配置式表单的格式
```vue
<template>
    <vxe-grid v-bind="grid_columns" />
</template>
```
```js
import { build_grid_options, transfer_columns } from '@@/utils/grid-generator'
// transfer_columns 接受三个参数，分别是 columns , column_type_slots, custom_column_options
// columns: config接口返回的columns或者children_columns
// column_type_slots: type对应使用什么组件渲染的一个映射对象，值是一个返回vnode的方法
// custom_column_options: 配置式表单的其他可配置项，比如浮动固定、是否可以拖拽调整列宽、对齐方式等，这些字段也可以由后端返回控制。reference：https://vxetable.cn/#/grid/api

// 使用方法可以参考：views/demo/grid-generate/grid-generate.vue
const grid_columns = {
    ...transfer_columns({ columns, column_type_slots, custom_column_options }),
    // 自定义列，某些列可能跟数据展示无关，比如操作列
    {
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
}
// reference：https://vxetable.cn/#/grid/api
const grid_options = build_grid_options({
    'checkbox-config': {
        // 选中后修改源数据的checked字段
        checkField: 'checked',
        // 是否显示表头
        showHeader: false,
        // 设置怎么触发选中该行
        trigger: 'row',
        // 选中后是否高亮行
        highlight: true
    },
    columns: grid_columns,
    data: []
})
```

## 响应式使用

请直接看例子`views/demo/grid-generate/grid-generate-with-hooks.vue`