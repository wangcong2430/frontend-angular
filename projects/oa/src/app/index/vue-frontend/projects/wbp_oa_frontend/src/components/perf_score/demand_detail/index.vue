<template>
  <a-modal :visible="true" :title="title" :onCancel="onClose" width="80%" :getContainer="getContainer">
    <div class="scoped-demand-detail-css">
      <a-collapse v-model:activeKey="activeKey">
        <a-collapse-panel v-for="item in demand_detail" :key="item.story_id">
          <template #header>
            <span v-for="col in ['story_name', 'story_code', 'creator', 'create_time', 'thing_num']" class="mx-3">
              {{ R.propOr(col, col, columns_name_map) }}: {{ R.propOr('Unknown', col, item) }}
            </span>
          </template>
          <vxe-table :ref="r => xTables.push(r)" :border="'default'" round auto-resize max-height="600px"
            :scroll-x="{ gt: 0 }" :scroll-y="{ gt: 10 }" :data="item.children">

            <vxe-column field="thumb" :title="children_columns_name_map.thumb" width="150"></vxe-column>
            <vxe-column title="物件名称/单号" width="200">
              <template #default="{ row }">
                {{ row.thing_name }}<br />
                <a-button class="!px-0" type="link" @click="injecting_parent_modal(row)">{{ R.prop('thing_code', row) }}
                </a-button>
              </template>
            </vxe-column>
            <vxe-column field="category" :title="children_columns_name_map.category" min-width="120"></vxe-column>
            <vxe-column title="承诺/实际交付日期" min-width="150">
              <template #default="{ row }">
                {{ row.complete_date }}/<br />
                {{ row.actual_delivery_time }}
              </template>
            </vxe-column>
            <vxe-column field="pass_degree_str" :title="children_columns_name_map.pass_degree_str" min-width="120">
            </vxe-column>
            <vxe-column field="current_workflow" :title="children_columns_name_map.current_workflow" min-width="120">
            </vxe-column>
            <vxe-column field="current_user_str" :title="children_columns_name_map.current_user_str" min-width="120">
            </vxe-column>
            <vxe-column field="stay_time" :title="children_columns_name_map.stay_time" min-width="120"></vxe-column>

          </vxe-table>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <template #footer>
      <a-button @click="onClose">取消</a-button>
    </template>
  </a-modal>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import * as R from 'ramda'
import { get_demand_detail } from '@/api/perf/demand-score'
export default defineComponent({
  name: 'DemandDetail',
  props: {
    row: {
      type: Object,
      required: true
    },
    onClose: { type: Function, required: true },
    type: String,
    getContainer: Object,
  },
  async setup(props, ctx) {
    const xTables = ref([] as any[])
    const { childrenColum: children_columns, colum: columns, data, title } = await get_demand_detail({ id: props.row.thing_detail, type: props.type })
    const columns_name_map = R.mergeAll(R.map((i: any) => ({ [i.key]: R.propOr('Unknown', 'label', i) }), columns))
    const children_columns_name_map = R.mergeAll(R.map((i: any) => ({ [i.key]: R.propOr('Unknown', 'label', i) }), children_columns))
    const demand_detail = reactive(data)

    const injecting_parent_modal = (row: any) => {
      if (window.parent !== window) {
        console.log('[injecting parent modal] ', row)
        window.parent.postMessage({
          key: 'thing', value: {
            id: row.id
          }
        }, '\*')
      }
    }
    return {
      R,
      xTables,
      title,
      activeKey: ref(null),
      demand_detail,
      children_columns,
      children_columns_name_map,
      columns,
      columns_name_map,
      injecting_parent_modal,
    }
  }
})
</script>
<style scoped lang="less">
@import './style.less';
</style>