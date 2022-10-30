<template>
  <div class="p-3 bg-gray-100"> 
    <h5 class="text-sm"><span class="text-gray-400">待办 / </span>变更审批</h5>
    <!-- 头部 -->
    <div class="p-3 bg-white rounded">
      <FilterForm :search_form="approvalConfigsColumn.searchForm" v-model:filters="the_filters"></FilterForm>
    </div>
    <!-- 中间 -->
    <div class="mt-4 h-20 bg-white rounded-t-lg p-6 flex justify-between">
      <div>
       <a-button type="primary" @click="handleAdopt" :disabled="thing_checked_list.length <= 0">
          <template #icon>
            <svg-icon name="submit" width="16px" height="16px" />
          </template>
          通过
        </a-button>
        <a-button type="danger" @click="approvalFinishFrom.visible = true" style="margin-left: 0.75rem"  :disabled="thing_checked_list.length <= 0">
          <template #icon>
            <svg-icon name="reject" width="16px" height="16px" />
          </template>
          驳回
        </a-button>
        <a-button @click="delayReminderForm.visible = true" style="margin-left: 0.75rem"  :disabled="thing_checked_list.length <= 0">
          <template #icon>
            <svg-icon name="delay-remind" width="16px" height="16px" />
          </template>
          延时提醒
        </a-button>
        <span class="ml-3">已选中<span style="color: #0052D9">{{order_checked_count}}</span>个订单<span style="color: #0052D9">{{ thing_checked_list.length }}</span>个物件</span>
      </div>
        <!-- 表格列表的数组   拖拽结束事件  -->
      <draggableFilter 
        :newChildrenColumns="newChildrenColumns" 
        @draggableEnd="draggableEnd"
        ></draggableFilter>
    </div>
    <div class="h-20 bg-white mt-1 p-4">
      <vxe-toolbar>
        <template #buttons>
          <div class="flex h-8 leading-8">
            <span>单据选择</span>
            <vxe-checkbox :model-value="is_all_row_checked" :indeterminate="is_all_row_indeterminate" @change="e => set_check_all(e.checked)" :disabled="set_disabled_all" class="vxeCheckbox">
              全选
            </vxe-checkbox>
            <vxe-checkbox @change="e => toggle_all_checkbox()" :disabled="set_disabled_all"  class="vxeCheckbox">
              反选
            </vxe-checkbox>
            <span class="ml-6 mr-6"> | </span>
            <span class="mr-6">单据展示</span>
            <a-button @click="all_is_open(false)" style="margin-left:0.75rem">全部展开</a-button>
            <a-button @click="all_is_open(true)">全部收起</a-button>
          </div>
        </template>
      </vxe-toolbar>
    </div>
    <!-- 表格 -->
    <div class="relative h-[70vh]">
        <vxe-table
          ref="xTable" 
          :checkbox-config="{labelField: 'seq', highlight: true}"
          :expand-config="{ expandAll: true}"
          row-class-name="tb-row"
          show-overflow 
          round auto-resize
          :scroll-x="{ gt: 20 }" :scroll-y="{ gt: 20 }"
          :data="approvalTableData.tableData"
          :cell-style="cellStyle"
          height="auto"
          @cell-click="cellClick"
          :loading="approvalTableData.loading"
          :show-header="false">
          <vxe-column type="checkbox" width="60">
            <template #checkbox="{ row }">
              <vxe-checkbox :modelValue="is_row_checked(row)" :indeterminate="is_row_indeterminate(row)"
                @change="e => set_row_checked(row, e.checked)" :disabled="row.all_disabled"></vxe-checkbox>
            </template>
          </vxe-column>
          <vxe-column width="100">
            <template #default="{ row, rowIndex }">
              <div class="marketing_label">{{ row.category_type_name }}</div>
            </template>
          </vxe-column>

          <vxe-column field="supplier_name" class-name="supplier_name_cell_class">
            <template #default="{ row, rowIndex }">
              <div class="flex flex-wrap justify-start py-4">
                <span class="mx-2">订单号：<a @click="handle_show_detail(row, 'order')">{{ row.order_code }}</a></span>
                <span class="mx-2" v-if="row.order_name">订单名称：{{ row.order_name }}</span>
                <span class="mx-2">项目名称：{{ row.project_name }}</span>
                <span class="mx-2">采购经理：
                  <span v-if="row.children[0]?.brand_product_manager_name_create">{{ row.children[0]?.brand_product_manager_name_create }}</span>
                  <span v-else>NA</span>
                </span>
                <span class="mx-2">供应商名称：{{ row.supplier_name }}</span>
                <span class="mx-2">供应商商务：{{ row.supplier_business }}</span>
                <span class="mx-2">变更物件数量/订单物件总数：{{ row.thing_count }}</span>
                <span class="mx-2">已审批人：  
                  <span v-if="row.children[0]?.changer">{{row.children[0]?.changer}}</span>
                  <span v-else>NA</span>
                </span>
              </div>
            </template>
          </vxe-column>

          <vxe-column field="total_price" width="280">
            <template #default="{ row, rowIndex }">
              <div class="mx-2 font-bold">原订单含税金额：{{ row.total_price }}</div>
              <div class="mx-2 font-bold">新订单含税金额：{{ row.new_total_price }}</div>
            </template>
          </vxe-column>

          <vxe-column width="60">
            <template #default="{row}">
              <DownOutlined v-if="row.expanded" @click="row.expanded = !row.expanded"/>
              <UpOutlined v-else @click="row.expanded = !row.expanded" />
            </template>
          </vxe-column>

          <vxe-column field="order_code" type="expand" :visible="false" width="60">
            <template #content="{ row, rowIndex }">
              <!-- row.expanded默认是没值的，由于二级表格默认展开，所以得取反 -->
              <div v-if="!row.expanded" class="expand-wrapper">
                <vxe-table
                  :scroll-x="{ gt: 0 }"
                  :scroll-y="{ gt: 5 }"
                  :checkbox-config="approvalTableData.tableCheckboxConfig"
                  header-cell-class-name="header-child-class"
                  row-class-name="row-child-class"
                  show-header-overflow="title"
                  :data="row.children">
                  <vxe-column type="checkbox" width="80" title="&nbsp;&nbsp;序号" fixed="left">
                    <template #checkbox="{ row, rowIndex, checked, indeterminate, disabled }">
                      <div class="flex items-center text-right ml-3">
                        <vxe-checkbox :modelValue="checked" :disabled="disabled" :indeterminate="indeterminate" 
                          @change="() => { row.checked = !row.checked }"
                        ></vxe-checkbox>
                        <span>{{ rowIndex + 1 }}</span>
                      </div>
                    </template>
                  </vxe-column>
                  <vxe-column v-for="config in isShowChildrenColumns"
                    :key="config.key"
                    :field="config.key"
                    :min-width="config.width"
                    :title="config.label">

                    <template #default="{ row }">
                    <!-- 显示隐藏列不能在这里判断 -->
                      <div v-if="config.key === 'thing_name'" class="flex justify-between">
                        <div>
                          <div>{{ row.thing_name }}</div>
                          <div>
                            <a class="mr-1" @click="handle_show_detail(row, 'thing')">{{row.thing_code}}</a>
                            <a-popover placement="rightBottom">
                              <template #content>
                                <div class="max-w-sm w-96">
                                  <p class="font-semibold text-sm">{{row.thing_name}}<span class="ml-4 text-gray-400">{{row.thing_code}}</span></p>
                                  <div class="flex flex-wrap">
                                    <div v-for="contractItem in row.attribute_check" :key="item"
                                        class="h-6 p-1 mr-2 mb-2 text-xs" style=" background-color: #ECF2FE">
                                      #{{contractItem.title}}
                                    </div>
                                  </div>
                                </div>
                              </template>
                              <ExclamationCircleOutlined v-if="row.attribute_check.length" />
                            </a-popover>
                          </div>
                          <div class="flex flex-wrap gap-y-[4px]">
                            <a-tag v-if="row.over_due_flag === 1" color="error">已超期</a-tag>
                            <a-tag v-if="row.is_test === '1'" color="processing">测试单</a-tag>
                            <a-tag v-if="row.is_reduce_process === '1'" color="processing">非全在线</a-tag>
                            <a-tag v-if="row.demand_type === '基地'" color="processing">基地</a-tag>
                            <a-tag v-else-if="row.demand_type === '画师'" color="processing">画师</a-tag>
                          </div>
                        </div>
                        <!-- 聊天框icon，该功能未上线暂时隐藏 -->
                        <!-- <div class="flex justify-center items-center w-14 ">
                          <a-divider type="vertical" class="h-[36px]" style="border-left: 2px solid #E7E7E7" />
                          <div class="mx-4"><svg-icon name="chat" width="24" height="24" /> </div>
                        </div> -->
                      </div>
                      
                      <div v-else-if="config.key === 'story_changer'">
                        <div v-if="row.story_changer"> 
                          <div v-for="item in row.story_changer?.split(';')" :key="item">{{item}}</div>
                        </div>
                        <div v-else>NA</div>
                      </div>
                      <div v-else-if="config.key === 'new_workload'">
                        <div>
                          <span v-if="row.workload_num !== row.new_workload_num && row.new_workload_num" class="text-red-600">{{ Number(row.new_workload_num).toLocaleString() }} {{row.new_workload_mum_title}} /  <br /></span>
                          {{ Number(row.workload_num).toLocaleString() }} {{row.workload_mum_title}}
                        </div>
                      </div>
                      <div v-else-if="config.key === 'new_unit_price'">
                        <div>
                          <span v-if="row.unit_price_num !== row.new_unit_price_num  && row.new_unit_price_num" class="text-red-600">{{ Number(row.new_unit_price_num).toLocaleString() }} {{row.new_unit_price_mum_title}} / <br /></span>
                          {{ Number(row.unit_price_num).toLocaleString() }} {{row.unit_price_num_title}}
                        </div>
                      </div>
                      <div v-else-if="config.key === 'new_total_price'">
                        <div v-if="row.new_produce_breakdown.length" @click="handle_detailed(row)">
                          <span v-if="row.total_price_num !== row.new_total_price_num && row.new_total_price_num" class="underline text-red-600">{{  Number(row.new_total_price_num).toLocaleString() }}  {{row.new_total_price_num_title}}  / <br /></span>
                          <span class="underline">{{ Number(row.total_price_num).toLocaleString() }} {{row.total_price_num_title}}</span>
                        </div>
                        <div v-else>
                          <span v-if="row.total_price_num !== row.new_total_price_num && row.new_total_price_num" class="text-red-600">{{  Number(row.new_total_price_num).toLocaleString() }}  {{row.new_total_price_num_title}}  / <br /></span>
                          <span>{{ Number(row.total_price_num).toLocaleString() }} {{row.total_price_num_title}}</span>
                        </div>
                      </div>
                      <div v-else-if="config.key === 'new_tax_price'">
                        <div>
                          <span v-if="row.tax_price_num !== row.new_tax_price_num && row.new_tax_price_num" class="text-red-600">{{ Number(row.new_tax_price_num).toLocaleString() }} {{row.new_tax_price_num_title}}  / <br /></span>
                          {{ Number(row.tax_price_num).toLocaleString() }} {{row.tax_price_num_title}}
                        </div>
                      </div>

                      <div v-else-if="config.key === 'memo'">
                        <span v-if="row.memo" class="mx-2">
                          <a-tooltip>
                            <template #title>{{ row.memo }}</template>
                            <div class="text_ine_clamp w-28">
                              {{ row.memo }}
                            </div>
                          </a-tooltip>
                        </span>
                      </div>
                      <div v-else-if="config.key === 'reason'">{{row.reason}}</div>
                      <div v-else-if="config.key === 'produce_grade_title'">{{row.produce_grade_title}}</div>
                      <div v-else-if="config.key === 'new_committed_delivery_date'">
                      
                        <div 
                          v-if="row.new_committed_delivery_date !== row.committed_delivery_date && row.new_committed_delivery_date" 
                          :class="row.new_committed_delivery_date > row.committed_delivery_date ?'text-red-600':''">
                            新：{{ row.new_committed_delivery_date }}
                        </div>
                        <div>旧：{{ row.committed_delivery_date }}</div>
                      </div>
                      
                      <div v-else-if="config.key === 'expected_complete_date'">{{row.expected_complete_date}}</div>
                      <div v-else-if="config.key === 'retention_time'">{{row.retention_time}}</div>
                    </template>
                  </vxe-column>
                </vxe-table>
              </div>
              <div class="h-4"></div>
            </template>
          </vxe-column>
        </vxe-table>
        <!-- 分页 -->
         <t-pagination
            v-model="pager.page_index"
            :total="pager.total"
            v-model:pageSize="pager.page_size"
            show-jumper
            class="tb-pager"
        />
    </div>
    <!-- 驳回弹窗 -->
    <a-modal
      v-model:visible="approvalFinishFrom.visible"
      title="驳回原因"
      :width="650"
      okText="确认"
      @ok="handleApproval"
      cancelText="取消"
      @cancel="cancelApproval"
      >
      <div class="flex">
        <span class="w-24">驳回原因：</span>
        <a-textarea v-model:value="approvalFinishFrom.reason" placeholder="填写驳回原因" allow-clear />
      </div>
    </a-modal >
    <!-- 延时提醒弹窗 -->
    <DelayReminder 
      v-model:visible="delayReminderForm.visible" 
      :delayReminderForm="delayReminderForm"
      @delayReminderCancel="delayReminderCancel"
      @delayReminderSubmit="delayReminderSubmit"
      @delayUpdateFileId="delayUpdateFileId"
    ></DelayReminder>
    <!-- 价格明细弹窗 -->
    <a-modal
      v-model:visible="detailedForm.visible"
      title="价格详情"
      :width="850"
      >
      <vxe-table :data="detailedForm.dataSource" header-cell-class-name="header-detailed-class" border="inner">
        <vxe-column field="label" title="明细名称" width="100"></vxe-column>
        <vxe-column field="pre_workload_unit_label" title="需求明细" width="160">
          <template #default="{row}">
            <span v-if="row.pre_workload_unit_label">{{row.pre_workload_unit_label}}</span>
            <span v-else> NA </span>
          </template>
        </vxe-column>
        <vxe-column field="workload_unit_name" title="报价明细"  width="160">
          <template #default="{row}">
            <!-- 需求明细和报价明细中数量或单位任意一个不同就为红色 -->
            <span :class="isWorkloadUnitRed(row) ? 'text-red-600' : ''"> {{row.value}} {{row.workload_unit_name}}  </span>
          </template>
        </vxe-column>
        <vxe-column field="count_price" title="明细单价" width="140">
           <template #default="{row}">
            <span> {{Number(row.price).toLocaleString()}} {{detailedForm.currency_symbol}}</span>
          </template>
        </vxe-column>
        <vxe-column field="price" title="明细价格" width="160">
           <template #default="{row}">
            <span> {{Number(row.count_price).toLocaleString()}} {{detailedForm.currency_symbol}}  </span>
          </template>
        </vxe-column>
        <vxe-column field="file_id" title="附件" width="60">
          <template #default="{row}">
            <div v-if="row.file_id"> 
              <!-- <span class="mr-3 cursor-pointer" style="color: #0052D9;"> <a target="_blank" :href="row.files[0]">预览</a> </span>
              <span class="cursor-pointer" style="color: #0052D9;">下载</span> -->
              <div class="cursor-pointer truncate" style="color: #0052D9;" v-for="item in row.files"><a target="_blank"
                  :href="item.url">{{ item.file_name }}</a></div>
            </div>
            <div v-else> NA </div>
          </template>
        </vxe-column>
      </vxe-table>
      <div class="flex justify-start items-center h-12 mt-4 pl-3" style="background:#E8EFFB">
        明细总价：{{thousandthsToNumber(detailedForm.new_total_price_num).toLocaleString()}} 
        {{detailedForm.new_total_price_symbol}}
      </div>
      <template #footer>
        <a-button key="back" @click="cancelDetailedModel">取消</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import * as R from 'ramda'
import moment from 'moment';
import { defineComponent, reactive, ref, nextTick, watch, onUpdated, computed } from 'vue'
import {  get_order_confirmation_list, get_order_change_config, think_set_delay_day, 
          order_approval_pass, upgrade_order_approval_pass, upgrade_order_approval_gm_pass,
          order_approval_reject, upgrade_order_approval_reject, upgrade_order_approval_gm_reject } from '@/api/agency/change-approval.ts'
import { VxeTableInstance, VxeColumnPropTypes, VxeTablePropTypes } from 'vxe-table'
import FilterForm from '@/components/filter_form/index.vue'
import draggableFilter from '@/components/draggableFilter/index.vue'
import DelayReminder from '@/components/delayReminder/index.vue'
import { SettingOutlined, UpOutlined, DownOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
export default defineComponent({
  components: {
    FilterForm,
    SettingOutlined,
    draggableFilter,
    UpOutlined,
    DownOutlined,
    DelayReminder,
  },
  async setup () {
    // 表格数据
    const approvalTableData = reactive({
      expandFixed: null as VxeColumnPropTypes.Fixed,
      tableData: [], // 表格展示的数据
      loading: false,
      tableCheckboxConfig:{
        labelField: 'name',
        showHeader: false,
        checkField: 'checked',
        trigger: 'row', // 触发方式为行
        highlight: true, // 选中行高亮
        checkMethod: ({ row }) => {
          return !(row.disabled); // 为false是禁用
        },
      }as VxeTablePropTypes.CheckboxConfig
    })

    // 表格列表字段
    const approvalConfigsColumn = reactive({
      childrenColumns: [], // 表格展开列的字段
      columns: [], // 表格列的字段
      searchForm: [], // 搜索表单的字段

    })
    // 分页的数据
    const pager = reactive({
      page_index: 1,
      page_size: 20,
      total: 0
    })
    
    // 搜索的方法
    async function handleSearch(filtersForm: Object) {
      const { list, pager: { page, itemCount: total, pageSize } } = await get_order_confirmation_list({...filtersForm, ...pager});
      pager.page_index = Number(page)
      pager.total = Number(total)
      approvalTableData.tableData = list;
      approvalTableData.loading = false;
      nextTick(async () =>{
        await xTable.value?.setAllRowExpand(true)
      })
    }
    
    const newChildrenColumns = ref([]);
    newChildrenColumns.value = [
        {
          "key": "thing_name",
          "label": "物件名称/单号",
          "width": 200,
          "isShow": true,
        },
        {
          "key": "story_changer",
          "label": "需求方变更确认人",
          "width": 140,
          "isShow": true,
        },
        {
          "key": "new_workload",
          "label": "新/旧数量",
          "width": 140,
          "isShow": true,
        },
        {
          "key": "new_unit_price",
          "label": "新/旧单价",
          "width": 140,
          "isShow": true,
        },
        
        {
          "key": "new_total_price",
          "label": "新/旧总价",
          "width": 140,
          "isShow": true,
        },
        {
          "key": "new_tax_price",
          "label": "新/旧税金",
          "width": 140,
          "isShow": true,
        },
        {
          "key": "reason",
          "label": "变更原因",
          "width": 90,
          "isShow": true,
        },
        {
          "key": "memo",
          "label": "变更详情",
          "width": 120,
          "isShow": true,
        },
        {
          "key": "produce_grade_title",
          "label": "制作等级",
          "width": 85,
          "isShow": true,
        },
        {
          "key": "new_committed_delivery_date",
          "label": "新/旧承诺交付日期",
          "width": 150,
          "isShow": true,
        },
        {
          "key": "expected_complete_date",
          "label": "期望交付日期",
          "width": 110,
          "isShow": true,
        },
        {
          "key": "retention_time",
          "label": "停留时长",
          "sort": true,
          "width": 100,
          "isShow": true,
        }
      ]
     
    const xTable = ref<VxeTableInstance>();

    await handleSearch();
    const {childrenColumns, columns, search_form} = await get_order_change_config();
    approvalConfigsColumn.childrenColumns = childrenColumns;
    approvalConfigsColumn.columns = columns;
    approvalConfigsColumn.searchForm = search_form;

    // 页面逻辑标识的枚举
    enum statusCurrentWorkflow  {
        change_order =  '10950', // 变更订单审核页面
        change_gm = '10960', // 变更GM审批页面
        change_upgrade = '10970', // 变更升级审核页面
    };
    // 根据多选框的数据，来获取三个接口的对应标识的数组
    function getArray(arr: Array){
      let thingObject = {
        changer_10950: [],
        changer_10960: [],
        changer_10970: [],
      }
      arr?.forEach(item => {
        if(item.current_workflow === statusCurrentWorkflow.change_order){
          thingObject.changer_10950.push(item.id);
        } else if(item.current_workflow === statusCurrentWorkflow.change_upgrade){
          thingObject.changer_10970.push(item.id);
        }else if(item.current_workflow === statusCurrentWorkflow.change_gm){
          thingObject.changer_10960.push(item.id);
        }
      });
      return thingObject;
    }
    // 驳回的弹窗数据
    const approvalFinishFrom = reactive({
      visible: false, // 是否打开弹窗
      reason: "", // 结束原因
      thing_id: [] // 选择的数据id 
    });
    // 通过确认的方法
    async function handleAdopt(){
      let res = await getArray(thing_checked_list.value);
      let passArr = [
        res.changer_10950.length ? order_approval_pass({thing_id: res.changer_10950, reason: ''}): null,
        res.changer_10960.length ? upgrade_order_approval_gm_pass({thing_id: res.changer_10960, reason: ''}) : null,
        res.changer_10970.length ? upgrade_order_approval_pass({thing_id: res.changer_10970, reason: ''}) : null,
      ];
      
      let [one,two,three] = await Promise.all(passArr);
      // promiseAll返回的是null说明没有请求
      if(one?.code === 0 || two?.code === 0 || three?.code === 0) {
        approvalTableData.loading = true;
        await handleSearch();
        message.success('执行成功');
      } else {
        message.error(one?.msg || two?.msg || three?.msg);
      }
    }
    // 驳回确认的方法
    async function handleApproval(){
      approvalFinishFrom.thing_id = thing_checked_list.value
      let res = await getArray(approvalFinishFrom.thing_id)
      let rejectArr = [
        res.changer_10950.length ? order_approval_reject({thing_id: res.changer_10950, reason: approvalFinishFrom.reason}): null,
        res.changer_10960.length ? upgrade_order_approval_gm_reject({thing_id: res.changer_10960, reason:approvalFinishFrom.reason}) : null,
        res.changer_10970.length ? upgrade_order_approval_reject({thing_id: res.changer_10970, reason:approvalFinishFrom.reason}) : null,
      ];
      let [one,two,three] = await Promise.all(rejectArr);
      // promiseAll返回的是null说明没有请求
      if(one?.code === 0 || two?.code === 0 || three?.code === 0) {
        await cancelApproval()
        approvalFinishFrom.thing_id = []; //驳回确定了需要把id也清除
        approvalTableData.loading = true;
        await handleSearch();
        message.success('驳回成功');
      } else {
        message.error(one?.msg || two?.msg || three?.msg);
      }
    }
    // 驳回取消的方法
    function cancelApproval(){
      // 清空除了id以外的所有数据
      approvalFinishFrom.visible = false;
      approvalFinishFrom.reason = '';
    }
    
    // 延时提醒的弹窗数据 
    let delayReminderParams = {
      visible: false, // 是否打开弹窗
      // current_workflow: 10950, // 单独请求的时候赋值
      delay_date: "", // 提醒日期
      file_id: null, // 附件id
      remark: "", // 延时提醒原因
      // thing_id: []
    }
    const delayReminderForm = reactive(Object.assign({}, delayReminderParams))
    // 延时提醒的取消方法
    function delayReminderCancel(){
      delayReminderParams.fileList = [];
      Object.keys(delayReminderParams).forEach(v=>{
        if(v !== 'thing_id')delayReminderForm[v] = delayReminderParams[v]
      })
    }
    // 延时提醒的确认方法
    async function delayReminderSubmit(){
      let res = await getArray(thing_checked_list.value)
      let delayDayArr = [
        res.changer_10950.length ? think_set_delay_day({current_workflow: 10950, thing_id: res.changer_10950, ...delayReminderForm}) : null,
        res.changer_10960.length ? think_set_delay_day({current_workflow: 10960, thing_id: res.changer_10960, ...delayReminderForm}) : null,
        res.changer_10970.length ? think_set_delay_day({current_workflow: 10970, thing_id: res.changer_10970, ...delayReminderForm}) : null,
      ];
      let [one,two,three] = await Promise.all(delayDayArr);
      // promiseAll返回的是null说明没有请求
      if(one?.code === 0 || two?.code === 0 || three?.code === 0) {
        await delayReminderCancel()
        approvalTableData.loading = true;
        await handleSearch();
        message.success('延迟提醒成功');
      } else {
        message.error(one?.msg || two?.msg || three?.msg);
      }
    }
    function delayUpdateFileId(_file_id) {
      delayReminderForm.file_id = _file_id;
    }

    function handle_show_detail (row, key){
      if (window.parent !== window) {
        window.parent.postMessage({
          key, value: {
            id: row.id
          }
        }, '\*')
      }
    }
    let detailedParams = {
      visible: false,
      dataSource: [],
      currency_symbol: '', // 币种单位
      new_total_price_num: '', // 总价价格
      new_total_price_symbol: '', // 总价货币
    }
    const detailedForm = reactive(Object.assign({},detailedParams));
    function handle_detailed(row){
      detailedForm.visible = true;
      if(row.new_produce_breakdown.length){
        detailedForm.dataSource = row?.new_produce_breakdown;
        detailedForm.currency_symbol = row?.currency_symbol;
        detailedForm.new_total_price_num = row?.new_total_price_num;
        detailedForm.new_total_price_symbol = row?.new_total_price_num_title;
      }
    }
    // 点击明细取消总价的数据
    function cancelDetailedModel(){
      Object.keys(detailedParams).forEach(v => {
        detailedForm[v] = detailedParams[v]
      });
    }
    function thousandthsToNumber(val: string){
      if (typeof val === 'string') {
        return Number(val.replace(/,/g, ''));
      } else {
        return val;
      }
    }
    const set_check_all = (checked: boolean) => {
      R.map(row => {
        R.map(s_row => {
          s_row.checked = checked;
        }, row.children)
        // 过滤掉禁用的数据
      }, approvalTableData.tableData.filter(v=> !v.all_disabled))
    }

    
    // 全选和反选是否禁用
    const set_disabled_all = computed(()=>{
      return approvalTableData.tableData.every(v=> {
        return v.all_disabled;
      })
    })

    const toggle_all_checkbox = () => {
      R.map(row => {
        R.map(s_row => {
          s_row.checked = !s_row.checked;
        }, row.children)
        // 过滤掉禁用的数据
      }, approvalTableData.tableData.filter(v=> !v.all_disabled))
    }

    const is_row_indeterminate = (row) => {
      const s_rows = R.propOr([], 'children', row)
      return R.any(R.prop('checked'), s_rows)
    }
    const is_row_checked = (row) => {
      const s_rows = R.propOr([], 'children', row)
      return s_rows.length > 0 && R.all(R.prop('checked'), s_rows)
    }

    const set_row_checked = (row, checked) => {
      R.map(s_row => {
        s_row.checked = checked
      }, row.children)
    }

    const is_all_row_checked = computed(() => {
      return R.all(is_row_checked, approvalTableData.tableData)
    })
    const is_all_row_indeterminate = computed(() => {
      return R.any(is_row_indeterminate, approvalTableData.tableData)
    })
    // 全部展开或收起
    function all_is_open(flag){
      R.map(row=>{row.expanded = flag},approvalTableData.tableData)
    }

    // 单元格的点击事件，判断是否展开行 （columnIndex 第几列    rowIndex  第几行）
    function cellClick({$columnIndex, $rowIndex}){
      // 第三列或者第四列才触发是否显示展开行
      if($columnIndex === 2 || $columnIndex === 3){
        approvalTableData.tableData.forEach((row, rowIndex) => {
          if(rowIndex === $rowIndex) {
            row.expanded =  !row.expanded;
          }
        })
      }
    }
    const cellStyle  = ({ column }) => {
      if (column.type === 'checkbox' || column.property ==='total_price') {
        return {  textAlign: 'right' }
      }
    }
    // 判断需求明细和报价明细中数量或单位任意一个不同就为红色
    function isWorkloadUnitRed(row){
      let { pre_workload_unit_label, pre_value, value, workload_unit_name } = row
      // pre_workload_unit_label = pre_workload_unit_name / pre_value（pre_workload_unit_name不存在只显示pre_value）
      if(pre_workload_unit_label === pre_value || !pre_workload_unit_label || !value || !workload_unit_name) return true;
      let new_pre_workload = pre_workload_unit_label?.split('/');
      return new_pre_workload[0] !== value || new_pre_workload[1] !== workload_unit_name;
    }

    // 所有订单的个数
    const order_checked_count = computed(() => {
      return R.sum(R.map(row => R.any(R.prop('checked'),row.children) ? 1 : 0
        , approvalTableData.tableData))
    })
    // 所有物件的数组
    const thing_checked_list = computed(()=>{
      let new_thing_checked_list = []
       R.map(row=>{
        R.map(s_row=>{
          s_row.checked ? new_thing_checked_list.push({id:s_row.id, current_workflow:s_row.current_workflow }) : ''
        },row.children)
      }, approvalTableData.tableData)

      return new_thing_checked_list;
    })

    // 动态渲染二级表格列的显示隐藏
    const isShowChildrenColumns = computed(()=> {
      return newChildrenColumns.value.filter(v=> {
        return v.isShow;
      })
    });

    async function draggableEnd (draggableList) {
      newChildrenColumns.value = draggableList;
      await handleSearch();
    }
    
    const filters = reactive(R.fromPairs(R.map(i => [i.key, null], approvalConfigsColumn.searchForm)))
    const the_filters = computed({
      get: () => filters,
      set: value =>  Object.assign(filters, value)
    })
    watch(() => ({ ...filters }), async () => {
      await handleSearch({ ...filters });
    })
    watch([() => pager.page_index, () => pager.page_size], async ()=>{
      approvalTableData.loading = true;
      await handleSearch();
      approvalFinishFrom.thing_id = [];
    });
    
    return {
      // 搜索
      approvalTableData,
      approvalConfigsColumn,
      pager,
      handleSearch,
      xTable,
      filters,
      the_filters,
      handle_show_detail,
      cellStyle,
      isWorkloadUnitRed,
      thousandthsToNumber,
      statusCurrentWorkflow,
      // 驳回
      approvalFinishFrom,
      handleAdopt,
      handleApproval,
      cancelApproval,
      // 延时提醒
      delayReminderForm,
      delayReminderCancel,
      delayReminderSubmit,
      delayUpdateFileId,
      // 明细
      detailedForm,
      handle_detailed,
      cancelDetailedModel,
      // 复选框操作
      set_check_all,
      set_row_checked,
      set_disabled_all,
      toggle_all_checkbox,
      is_row_indeterminate,
      is_row_checked,
      is_all_row_checked,
      is_all_row_indeterminate,
      all_is_open,
      cellClick,
      order_checked_count,
      thing_checked_list,

      // 设置（显示隐藏且拖拽列）
      newChildrenColumns,
      isShowChildrenColumns,
      draggableEnd,
    }
  }
})
</script>

<style scoped lang="less">
.vxeCheckbox{
  margin-left:1.5rem;
  margin-top:0.5rem;
}

/deep/ .tb-row {
  height: 4.25rem;
  background: #E8EFFB;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
/deep/ .header-child-class{
  font-weight: 400;
  font-size: 0.875rem;
  color: rgba(0,0,0,0.40);
  line-height: 1.375rem;
  height: 2.625rem;
  background-color: #fff;
}
/deep/ .header-detailed-class{
  font-weight: 400;
  font-size: 0.875rem;
  color: rgba(0,0,0,0.40);
  line-height: 1.375rem;
  height: 2.625rem;
  background-color: #fafafa;
}
/deep/ .row-child-class{
  font-weight: 400;
  font-size: 0.875;
  color: rgba(0,0,0,0.90);
  line-height: 1.375rem;
  height: 5.5rem;
  background-color: #fff;
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
.marketing_label{
  width: 5.25rem;
  height: 1.5rem;
  background-image: linear-gradient(-4deg, #E5E9ED 5%, #FAFAFB 96%);
  border-radius: 2px;
  border-radius: 4px;
  text-align: center;
}
/deep/ .supplier_name_cell_class{
  .vxe-cell {
    max-height: 7.5rem !important; 
  }
}
.text_ine_clamp{
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>