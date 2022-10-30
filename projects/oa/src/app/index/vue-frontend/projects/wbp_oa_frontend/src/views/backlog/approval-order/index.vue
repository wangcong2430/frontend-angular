<template>
  <div class="p-3 bg-gray-100">
    <h5 class="text-sm mb-4"><span class="text-gray-400">待办 / </span>订单审批</h5>
    <!-- 头部筛选区域，暂时先这样 -->
    <div class="p-3 bg-white rounded">
      <FilterForm :search_form="approvalConfigsColumn.searchForm" v-model:filters="the_filters"></FilterForm>
    </div>
    <!-- 中间筛选区域 -->
    <div class="h-36 mt-4 bg-white rounded-r rounded-l">
      <div class="h-18 p-5 flex justify-between">
        <a-space size="middle">
          <a-button type="primary" @click="success" :disabled="thing_ids.length <= 0">
            <template #icon>
              <svg-icon name="submit" width="16px" height="16px" />
            </template>
            通过
          </a-button>
          <a-button type="danger" @click="() => { rejectFlag = true }" :disabled="thing_ids.length <= 0">
            <template #icon>
              <svg-icon name="reject" width="16px" height="16px" />
            </template>
            驳回
          </a-button>
          <a-button @click="() => { delayReminderForm.visible = true }" :disabled="thing_ids.length <= 0">
            <template #icon>
              <svg-icon name="delay-remind" width="16px" height="16px" />
            </template>
            延时提醒
          </a-button>
          <span class="ml-3">已选中<span style="color: #0052D9"> {{ order_checked_count }} </span>个订单，<span
              style="color: #0052D9">{{ thing_checked_list.length }}</span>物件</span>
        </a-space>
        <draggableFilter :newChildrenColumns="newChildrenColumns" @draggableEnd="draggableEnd"></draggableFilter>
      </div>

      <div class="divider"></div>
      <div class="flex justify-between p-4">
        <div class="checkout-operation flex   h-8 leading-8">
          <span>单据选择</span>
          <vxe-toolbar style="margin-left: 1.5rem">
            <template #buttons>
              <vxe-checkbox :model-value="is_all_row_checked" :indeterminate="is_all_row_indeterminate"
                @change="e => set_check_all(e.checked)">
                全选
              </vxe-checkbox>
              <vxe-checkbox @change="e => toggle_all_checkbox(e.checked)">
                反选
              </vxe-checkbox>
            </template>
          </vxe-toolbar>
          <span class="ml-6 mr-6"> | </span>
          <span class="mr-6">单据展示</span>
          <a-button @click="all_is_open(false)" style="margin-left:0.75rem">全部展开</a-button>
          <a-button @click="all_is_open(true)">全部收起</a-button>
        </div>
      </div>
    </div>
    <!-- 底部表格区域 -->
    <div>
      <vxe-table ref="xTable" :checkbox-config="{ labelField: 'seq', highlight: true }"
        :expand-config="{ expandAll: true }" row-class-name="tb-row" show-overflow round auto-resize
        :scroll-x="{ gt: 20 }" :scroll-y="{ gt: 20 }" :show-header="false" @cell-click="cellClick" keep-source
        :data="ApprovalTableData.tableData" :cell-style="cellStyle">
        <vxe-column type="checkbox" width="60">
          <template #checkbox="{ row }">
            <vxe-checkbox :modelValue="is_row_checked(row)" :indeterminate="is_row_indeterminate(row)"
              @change="e => set_row_checked(row, e.checked)"></vxe-checkbox>
          </template>
        </vxe-column>
        <vxe-column title="#" width="120">
          <template #default="{ row }">
            <div class="flex  justify-start">
              <span class="marketing_label">{{ row.category_type_name }}</span>
            </div>

          </template>
        </vxe-column>
        <vxe-column field="category_type_name" title="#" class-name="supplier_name_cell_class">
          <template #default="{ row, rowIndex }">
            <div class="flex flex-wrap justify-start text-sm">
              <span class=" mx-2">订单号: <a @click.stop="handle_show_detail(row, 'order')">{{ row.order_code }}</a></span>
              <span class="mx-2">供应商名称：{{ row.supplier_name }}</span>
              <span class="mx-2">合同号：{{ row.children[0].contract_number }}</span>
              <!-- <span class="mx-2">税率：{{ row.children[0].tax_rate }}</span> -->
              <span class=" mx-2">是否预付款: {{ row.children[0].prepayments_status === '1' ? '是' : '否' }}</span>
              <span class="mx-2">采购经理：{{ row.agent_pm_name }}</span>
              <span class="mx-2">项目名称：{{ row.project_name }}</span>
              <span class="mx-2" v-if="row.category_type == '2'">可用产品预算：{{ row.product_available_text }}</span>
              <span class="mx-2" v-if="row.category_type == '2'">可用品牌预算：{{ row.brand_available_text }}</span>
              <span class="mx-2">物件数量：{{ row.thing_count }}</span>
            </div>
          </template>
        </vxe-column>
        <vxe-column width="280">
          <template #default="{ row, rowIndex }">
            <div class="mx-3 font-bold flex justify-end">订单金额：{{ row.tax_amount }}</div>
          </template>
        </vxe-column>
        <vxe-column width="60">
          <template #default="{ row }">
            <DownOutlined v-if="row.expanded" @click="cellClick({ $columnIndex: 3, $rowIndex: 3 })" />
            <UpOutlined v-else @click="cellClick({ $columnIndex: 3, $rowIndex: 3 })" />
          </template>
        </vxe-column>
        <vxe-column type="expand" width="80" :visible="false">
          <template #content="{ row, rowIndex }">
            <div v-if="!row.expanded" class="expand-wrapper">
              <vxe-table ref="xTable2" :scroll-x="{ gt: 0 }" :scroll-y="{ gt: 20 }"
                :checkbox-config="{ showHeader: false, checkField: 'checked', highlight: true }" :data="row.children"
                show-header-overflow="title" row-class-name="row-child-class" @cell-click="checkChangeEvent"
                header-cell-class-name="header-child-class">
                <!-- <vxe-column type="checkbox" width="60">
                </vxe-column> @checkbox-change="selectChangeEvent" trigger: 'row',
                <vxe-column type="seq" width="60" name="seq" title="序号"></vxe-column> -->

                <vxe-column type="checkbox" width="100" title="&nbsp;&nbsp;序号">
                  <template #checkbox="{ row, rowIndex, checked, indeterminate }">
                    <div class="flex items-center text-right ml-3">
                      <vxe-checkbox :modelValue="checked" :indeterminate="indeterminate" :disabled="true"
                        @change="selectChangeEvent(row)"></vxe-checkbox>
                      <!-- () => { row.checked = !row.checked } -->
                      <span>{{ rowIndex + 1 }}</span>
                    </div>
                  </template>
                </vxe-column>

                <vxe-column v-for="config in isShowChildrenColumns" :key="config.key" :field="config.key"
                  :min-width="config.width" :title="config.label">

                  <template #default="{ row }">
                    <!-- 显示隐藏列不能在这里判断 -->
                    <div v-if="config.key === 'thing_name'">
                      <div>{{ row.thing_name }}</div>
                      <div> <a class="mr-1" @click.stop="handle_show_detail(row, 'thing')">{{ row.thing_code }}</a>
                      </div>
                      <div class="flex flex-wrap">
                        <a-tag color="error" v-if="row.over_due_flag === 1">已超期</a-tag>
                        <a-popover title="驳回原因">
                          <template #content>
                            <p>驳回内容：</p>
                            <p class="w-96">文案展示文案展示文案展示文案展示文案展示文案展示文案展示文案展示</p>
                          </template>
                          <!-- 暂时不做驳回，没有字段 -->
                          <!-- <a-tag color="error" v-if="row.is_reduce_process === '1'">被驳回</a-tag> -->
                        </a-popover>
                        <a-tag color="processing" v-if="row.is_test === '1'">测试单</a-tag>
                        <a-tag color="processing" v-if="row.demand_type === '基地'">基地</a-tag>
                        <a-tag color="processing" v-else-if="row.demand_type === '画师'">画师</a-tag>
                        <a-tag color="processing" v-if="row.is_reduce_process === '1'">非全在线</a-tag>
                      </div>
                    </div>
                    <div v-else-if="config.key === 'category'">
                      <div>{{ row.category }}
                        <span v-if="row.produce_grade_title">({{ row.produce_grade_title }})</span>
                        <span v-else>(NA)</span>
                      </div>
                    </div>
                    <div v-else-if="config.key === 'pre_workload'">
                      <span>{{ parseFloat(row.workload) }} {{ row.workload_unit_title }} </span>
                    </div>
                    <div v-else-if="config.key === 'unit_price'">
                      {{ row.unit_price }}
                    </div>
                    <div v-else-if="config.key === 'total_price'">
                      <span v-if="row.produce_breakdown && row.produce_breakdown.length > 0"
                        class="underline cursor-pointer" @click.stop="handPreDeta(row)"> {{ row.total_price }}
                      </span>
                      <span v-else> {{ row.total_price }}
                      </span>
                    </div>
                    <div v-else-if="config.key === 'attribute_check'">
                      <span v-if="row.attribute_check.length > 0">
                        <div v-for="item in row.attribute_check" :key="item.id">
                          {{ item.title }} : {{ item.value + item.form_unit }}
                        </div>
                      </span>
                      <span v-else>NA</span>
                    </div>
                    <div v-else-if="config.key === 'remark'">
                      <span v-if="row.remark">{{ row.remark }}</span>
                      <span v-else>NA</span>
                    </div>
                    <div v-else-if="config.key === 'expected_complete_date'">
                      <div>{{ row.expected_complete_date }} / </div>
                      <div>{{ row.committed_delivery_date }}</div>
                    </div>
                    <div v-else-if="config.key === 'retention_time'">
                      {{ row.retention_time }}
                    </div>
                  </template>
                </vxe-column>
              </vxe-table>
            </div>
            <div class="h-4"></div>
          </template>
        </vxe-column>
      </vxe-table>
      <!-- 分页 -->
      <t-pagination v-model="pager.page_index" :total="pager.total" v-model:pageSize="pager.page_size" show-jumper
        class="tb-pager" />
    </div>
  </div>
  <PriceDetails ref="abc" :produce_breakdown="ApprovalTableData.produce_breakdown" :unit="ApprovalTableData.unit"
    :fixed_price_status="ApprovalTableData.fixed_price_status" :totalFlag="totalFlag"
    :onClose="() => { totalFlag = false }" />
  <OrderReject :thing_ids="thing_ids" :rejectFlag="rejectFlag" :onClose="(flag) => { onCloseOrder(flag) }" />
  <DelayReminder v-model:visible="delayReminderForm.visible" :delayReminderForm="delayReminderForm"
    @delayReminderCancel="delayReminderCancel" @delayReminderSubmit="delayReminderSubmit"
    @delayUpdateFileId="delayUpdateFileId"></DelayReminder>

</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, computed, watch, getCurrentInstance, nextTick } from 'vue'
import { get_order_approval_list, get_approval_order_configs, post_approval_submit_pass, post_approval_setDelay_day } from '@/api/backlog/approval-order'
import { VxeTableInstance, VxeTableEvents, VxeColumnPropTypes, VxeGridProps, VxePagerEvents, VxeToolbarInstance, VxeTablePropTypes } from 'vxe-table'
import { message } from 'ant-design-vue';
import * as R from 'ramda'

import PriceDetails from './component/PriceDetails.vue'
import OrderReject from './component/OrderReject.vue'
// import DelayReminder from './component/DelayReminder.vue'
import DelayReminder from '@/components/delayReminder/index.vue'
import draggableFilter from '@/components/draggableFilter/index.vue'
import FilterForm from '@/components/filter_form/index.vue'

import { SettingOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  components: {
    PriceDetails,
    OrderReject,
    DelayReminder,
    draggableFilter,
    FilterForm,
    UpOutlined,
    DownOutlined

  },
  async setup() {
    // console.log( new Date().getTime(5));
    const approvalSearchForm = reactive({
      project_id: '', // 所属项目
      pr_number: '', // 立项单号
      supplier_id: '', // 供应商名称
      thing_code: '', // 物件单号
      brand_product_manager: '', // 需求经办人
      story_code: '', // 需求单号
      thing_name: '', // 物件名称
      story_name: '', // 需求名称
      category_type: '', // 费用类型
      demand_type: '', // 需求种类
      painter_name: '', // 画师名称
    });
    // 分页的数据
    let pager = reactive({
      page_index: 1,
      page_size: 20,
      total: 0
    })
    // 选中的id集合
    let thing_ids = reactive([])
    let current_workflow = ref(0)

    const approvalConfigsColumn = reactive({
      childrenColumns: [], // 表格展开列的字段
      columns: [], // 表格列的字段
      searchForm: [], // 搜索表单的字段

    })
    // let abc: any = getCurrentInstance()
    const currentInstance = getCurrentInstance();


    // 总价弹窗开关
    let totalFlag = ref<boolean>(false);
    // 驳回弹窗开关
    let rejectFlag = ref<boolean>(false)


    // 显示物件总数
    let objectsTotal = ref<any>(0)

    // 显示勾选的订单数量
    let orderNum = ref<any>(0)

    const ApprovalTableData = reactive({
      tableData: [],
      produce_breakdown: [],
      unit: '',
      fixed_price_status: 0
    })

    const xTable = ref<VxeTableInstance>();
    const xTable2 = ref<VxeTableInstance>();

    const newChildrenColumns = ref([
      {
        "key": "thing_name",
        "label": "物件名称/单号",
        "width": 150,
        "isShow": true,
      },
      {
        "key": "category",
        "label": "品类（制作等级）",
        "width": 120,
        "isShow": true,
      },
      {
        "key": "pre_workload",
        "label": "数量",
        "width": 60,
        "isShow": true,
      },
      {
        "key": "unit_price",
        "label": "单价",
        "width": 80,
        "isShow": true,
      },
      {
        "key": "total_price",
        "type": "produce_breakdown",
        "option_key": "produce_breakdown",
        "label": "总价",
        "width": 80,
        "isShow": true,
      },
      {
        "key": "attribute_check",
        "label": "标签",
        "width": 200,
        "isShow": true,
      },
      {
        "key": "remark",
        "label": "备注",
        "width": 60,
        "isShow": true,
      },
      {
        "key": "expected_complete_date",
        "label": "期望/承诺交付日期",
        "width": 80,
        "isShow": true,
      },
      {
        "key": "retention_time",
        "label": "停留时间",
        "sort": true,
        "width": 50,
        "isShow": true,
      }
    ]);

    async function handleSearch(filtersForm: Object) {

      const { list, pager: { page, itemCount, pageSize } } = await get_order_approval_list({ ...filtersForm, ...pager });
      pager.page_index = Number(page)
      pager.total = Number(itemCount)
      ApprovalTableData.tableData = list
      objectsTotal.value = 0
      orderNum.value = 0

      nextTick(async () => {
        await xTable.value?.setAllRowExpand(true)
      })
    }

    await handleSearch({})
    const { childrenColumns, columns, search_form } = await get_approval_order_configs();
    approvalConfigsColumn.childrenColumns = childrenColumns;
    approvalConfigsColumn.columns = columns;
    approvalConfigsColumn.searchForm = search_form;

    // 全部展开或收起
    function all_is_open(flag) {
      R.map(row => { row.expanded = flag }, ApprovalTableData.tableData)
    }

    // 通过的点击事件
    const success = async () => {
      let res = await post_approval_submit_pass({ thing_ids, reason: '' })
      if (res.code !== 0) {
        message.error(res.msg)
      } else {
        handleSearch({})
        thing_ids.length = 0
        message.success('提交成功');
      }

    }

    // 判断按钮是否选中 
    const is_row_checked = (row) => {
      let s_rows = R.propOr([], 'children', row)
      return s_rows.length > 0 && R.all(R.prop('checked'), s_rows)
    }

    const is_row_indeterminate = (row) => {
      const s_rows = R.propOr([], 'children', row)
      return R.any(R.prop('checked'), s_rows)

    }

    const set_row_checked = (row, checked) => {

      R.map(s_row => {
        s_row.checked = checked
        current_workflow.value = s_row.current_workflow
        // 如果是取消选中，就将选中的数组对应id去掉
        if (!checked) {

          thing_ids.splice(thing_ids.indexOf(s_row.id), 1)
        } else {

          if (!thing_ids.includes(s_row.id)) {
            thing_ids.push(s_row.id)
          }
        }
      }, row.children)
      console.log('-----选中测试', thing_ids);

    }
    // 所有订单的个数
    const order_checked_count = computed(() => {
      return R.sum(R.map(row => R.any(R.prop('checked'), row.children) ? 1 : 0, ApprovalTableData.tableData))
    })

    // 二级菜单的选中事件
    function selectChangeEvent(row) {
      current_workflow.value = row.current_workflow
      row.checked = !row.checked

      if (!row.checked) {
        thing_ids.splice(thing_ids.indexOf(row.id), 1)
      } else {
        thing_ids.push(row.id)
      }
      console.log('------thing_ids', thing_ids);

    }

    function checkChangeEvent({ $columnIndex, row }) {
      if ($columnIndex !== 0) {
        current_workflow.value = row.current_workflow
        row.checked = !row.checked
        if (!row.checked) {
          thing_ids.splice(thing_ids.indexOf(row.id), 1)
        } else {
          thing_ids.push(row.id)
        }
        console.log('------thing_ids', thing_ids);

      }

    }


    // 全选按钮选中状态

    const is_all_row_checked = computed(() => {
      return R.all(is_row_checked, ApprovalTableData.tableData)
    })
    let is_all_row_indeterminate = computed(() => {

      return R.any(is_row_indeterminate, ApprovalTableData.tableData)
    })

    const set_check_all = (checked: boolean) => {
      R.map(row => {
        R.map(s_row => {
          s_row.checked = checked;
          current_workflow.value = s_row.current_workflow
          let is_thins_ds = thing_ids.includes(s_row.id)
          if (R.prop('checked', s_row) && !is_thins_ds) {
            thing_ids.push(s_row.id);
          } else if (!(R.prop('checked', s_row)) && is_thins_ds) {
            thing_ids.splice(thing_ids.indexOf(s_row.id), 1);
          }
        }, row.children)
        // 过滤掉禁用的数据
      }, ApprovalTableData.tableData)
    }

    const toggle_all_checkbox = () => {
      R.map(row => {
        R.map(s_row => {
          s_row.checked = !s_row.checked;
          let is_thins_ds = thing_ids.includes(s_row.id)
          if (R.prop('checked', s_row) && !is_thins_ds) {
            thing_ids.push(s_row.id);
          } else if (!(R.prop('checked', s_row)) && is_thins_ds) {
            thing_ids.splice(thing_ids.indexOf(s_row.id), 1);
          }
        }, row.children)
        // 过滤掉禁用的数据
      }, ApprovalTableData.tableData)
    }

    let handPreDeta = (row) => {
      if (row.produce_breakdown instanceof Array) {
        ApprovalTableData.produce_breakdown = row.produce_breakdown
      } else {
        ApprovalTableData.produce_breakdown = JSON.parse(row.produce_breakdown)
      }
      ApprovalTableData.unit = row.currency_symbol
      ApprovalTableData.fixed_price_status = row.fixed_price_status
      totalFlag.value = true
    }

    // 动态渲染二级表头
    const isShowChildrenColumns = computed(() => {
      return newChildrenColumns.value.filter(v => {
        return v.isShow;
      })
    });

    async function draggableEnd(draggableList) {
      newChildrenColumns.value = draggableList;
      await handleSearch({});
    }

    // 头部筛选

    const filters = reactive(R.fromPairs(R.map(i => [i.key, null], approvalConfigsColumn.searchForm)))

    const the_filters = computed({
      get: () => filters,
      set: value => Object.assign(filters, value)
    })

    watch(() => ({ ...filters }), async () => {

      await handleSearch({ ...filters });
    })


    watch([() => pager.page_index, () => pager.page_size], async () => {
      await handleSearch({ ...filters });
      thing_ids.length = 0;
    });

    function onCloseOrder(flag = 0) {
      if (flag === 1) {
        handleSearch({})
        thing_ids.length = 0;
      }
      rejectFlag.value = false
    }

    let delayReminderParams = {
      visible: false, // 是否打开弹窗
      delay_date: "", // 提醒日期
      file_id: null, // 附件id
      remark: "", // 延时提醒原因,
      fileList: []
    }
    const delayReminderForm = reactive(Object.assign({}, delayReminderParams))
    // 延时提醒的取消方法
    function delayReminderCancel() {
      Object.keys(delayReminderParams).forEach(v => {
        if (v !== 'thing_id') delayReminderForm[v] = delayReminderParams[v]
      })
      delayReminderParams.fileList = []
      console.log('----delayReminderParams', delayReminderParams.fileList);

    }
    // 延时提醒的确认方法
    async function delayReminderSubmit() {
      const { code, msg } = await post_approval_setDelay_day({ ...delayReminderForm, thing_id: thing_ids, current_workflow: Number(current_workflow.value) });
      if (code === 0) {
        await delayReminderCancel()
        await handleSearch({})
        thing_ids.length = 0;
        message.success('延迟提醒成功');
      } else {
        message.error(msg);
      }
    }

    // 单元格的点击事件，判断是否展开行 （columnIndex 第几列    rowIndex  第几行）

    function cellClick({ $columnIndex, $rowIndex }) {

      // 第三列或者第四列才触发是否显示展开行
      if ($columnIndex !== 0) {
        ApprovalTableData.tableData.forEach((row, rowIndex) => {
          if (rowIndex === $rowIndex) {
            row.expanded = !row.expanded;
            console.log('------展开行', row);

          }
        })
      }
    }

    const cellStyle = ({ column }) => {
      if (column.type === 'checkbox') {
        return { textAlign: 'right' }
      }
    }
    function delayUpdateFileId(_file_id) {
      delayReminderForm.file_id = _file_id;
    }

    // 物件详情
    function handle_show_detail(row, key) {
      if (window.parent !== window) {
        window.parent.postMessage({
          key, value: {
            id: row.id
          }
        }, '\*')
      }
    }

    // 所有物件的数组
    const thing_checked_list = computed(() => {
      let array = []
      R.map(row => {
        R.map(s_row => {
          R.any(R.prop('checked'), row.children) ? array.push(s_row.id) : ''
        }, row.children)
      }, ApprovalTableData.tableData)

      return array;
    })

    return {
      delayUpdateFileId,
      handleSearch,
      ApprovalTableData,
      pager,
      xTable,
      xTable2,
      totalFlag,
      success,
      rejectFlag,
      is_row_checked,
      is_row_indeterminate,
      set_row_checked,
      is_all_row_checked,
      is_all_row_indeterminate,
      objectsTotal,
      order_checked_count,
      set_check_all,
      toggle_all_checkbox,
      thing_ids,
      current_workflow,
      handPreDeta,
      isShowChildrenColumns,
      newChildrenColumns,
      draggableEnd,
      approvalConfigsColumn,
      filters,
      the_filters,
      selectChangeEvent,
      onCloseOrder,
      delayReminderForm,
      delayReminderCancel,
      delayReminderSubmit,
      cellClick,
      all_is_open,
      cellStyle,
      checkChangeEvent,
      handle_show_detail,
      thing_checked_list

    }

  }

})
</script>

<style lang="less" scoped>
.vxe-header--row {
  background-color: #fff;
}

.ant-tag {
  border-radius: 4px;
  margin-top: 0.2rem;
}

.col_7 {
  width: 3rem;
  max-width: 6rem;
}

.divider {
  width: 100%;
  border-top: 1px solid #E7E7E7;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/deep/ .tb-row {
  height: 4.25rem;
  background: #E8EFFB;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.rowBtn {
  font-weight: 600;
  text-align: center;
  font-size: 12px;
  border-radius: 0.4rem;
  padding: 0.1rem 0.5rem;
  margin: 0.5rem 0.5rem 0 0;
}

.btnColor1 {
  color: #ED3142;
  background: #FDECEE;
}

.btnColor2 {
  color: #FF3E00;
  background: #FFECE4;
}

.btnColor3 {
  color: #16A2D4;
  background: #D4F4FF;
}

.tb-pager {
  padding: 1rem 1.5rem;
  background: #FFFFFF;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  position: sticky;
  bottom: 0rem;
  height: 4rem;
  left: 0;
  right: 0;
  z-index: 99;
}

.marketing_label {
  width: 5.25rem;
  height: 1.5rem;
  background-image: linear-gradient(-4deg, #E5E9ED 5%, #FAFAFB 96%);
  border-radius: 2px;
  border-radius: 4px;
  text-align: center;
}

/deep/ .header-child-class {
  font-weight: 400;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.40);
  line-height: 1.375rem;
  height: 2.625rem;
  background-color: #fff;
}

/deep/ .row-child-class {
  font-weight: 400;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.90);
  line-height: 1.375rem;
  height: 5.5rem;
  background-color: #fff;
}
/deep/ .supplier_name_cell_class{
  .vxe-cell {
    max-height: 7.5rem !important; 
  }
}
</style>