<template>
  <div class="p-3 bg-gray-100"> 
    <h5 class="text-sm"><span class="text-gray-400">跟进 / </span>制作中</h5>
    <!-- 头部 -->
    <div class="p-3 bg-white rounded">
      <FilterForm :search_form="productionConfigsColumn.searchForm" v-model:filters="the_filters"></FilterForm>
    </div>
    <!-- 中间 -->
    <div class="mt-4 h-20 bg-white rounded-t-lg p-6 flex justify-between">
      <div>
        <a-button type="danger" 
          :disabled="thing_checked_list.length <= 0" 
          @click="productionFinishFrom.visible = true">
           <template #icon>
            <svg-icon name="end" />
           </template>
          结束制作
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
          :data="productionTableData.tableData"
          @cell-click="cellClick"
          height="auto"
          :cell-style="cellStyle"
          :loading="productionTableData.loading"
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
                <span v-if="row.order_name" class="mx-2">订单名称：{{ row.order_name }}</span>
                <span class="mx-2">项目名称：{{ row.project_name }}</span>
                <span class="mx-2">供应商名称：{{ row.supplier_name }}</span>
                <span class="mx-2">物件数量：{{ row.thing_count }}</span>
                <span v-if="row.order_remark1" class="mx-2">订单备注：
                   <a-tooltip>
                    <template #title>{{ row.order_remark1 }}</template>
                    <div class="max-w-md inline-block truncate align-bottom" style="width: 7.5rem">{{ row.order_remark1 }}</div>
                  </a-tooltip>
                </span>
              </div>
            </template>
          </vxe-column>
          <vxe-column field="total_price" width="260">
            <template #default="{ row, rowIndex }">
            <div class="mx-2 font-bold">订单金额：{{ row.tax_amount }}</div>
            </template>
          </vxe-column>
          <vxe-column width="50">
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
                  :scroll-y="{ gt: 5, enabled: false }"
                  :checkbox-config="productionTableData.tableCheckboxConfig"
                  header-cell-class-name="header-child-class"
                  row-class-name="row-child-class"
                  show-header-overflow="title"
                  :data="row.children">
                  <vxe-column type="checkbox" width="100" title="&nbsp;&nbsp;序号" fixed="left">
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
                    class-name="supplier_name_cell_class"
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
                          <div class="flex flex-wrap">
                            <a-tag v-if="row.over_due_flag === 1" color="error" style="margin-bottom: 4px">已超期</a-tag>
                            <a-popover>
                              <template #content>
                                <div class="max-w-sm font-semibold">
                                  <p class="text-red-400">变更原因</p>
                                  <p><span class="text-gray-400">变更详情：</span>{{row.auto_record_data}}</p>
                                  <p>{{row.auto_record_remark}}</p>
                                </div>
                              </template>
                              <a-tag v-if="row.is_price_apply ==='1'" color="warning" style="margin-bottom: 4px">变更中</a-tag>
                            </a-popover>
                            <a-tag v-if="row.is_price_apply ==='2'" color="error" style="margin-bottom: 4px">已变更</a-tag>
                            
                            <a-tag v-if="row.is_rejected === '1'" color="error" style="margin-bottom: 4px">被驳回</a-tag>
                            <a-tag v-else-if="row.is_rejected === '2'" color="error" style="margin-bottom: 4px">放弃报价</a-tag>
                            <a-tag v-else-if="row.is_rejected === '3'" color="warning" style="margin-bottom: 4px">超时未接收</a-tag>
                            <a-tag v-else-if="row.is_rejected === '4'" color="warning" style="margin-bottom: 4px">超时未报价</a-tag>

                            <a-tag v-if="row.is_test === '1'" color="processing" style="margin-bottom: 4px">测试单</a-tag>
                            <a-tag v-if="row.is_reduce_process === '1'" color="processing" style="margin-bottom: 4px">非全在线</a-tag>
                            <a-tag v-if="row.demand_type === '基地'" color="processing" style="margin-bottom: 4px">基地</a-tag>
                            <a-tag v-else-if="row.demand_type === '画师'" color="processing" style="margin-bottom: 4px">画师</a-tag>
                          </div>
                        </div>
                        <!-- TODO:由于聊天框功能推迟上线，所以聊天框icon暂时隐藏不显示-->
                        <div class="flex justify-center items-center w-14 ">
                          <a-divider type="vertical" class="h-[36px]" style="border-left: 2px solid #E7E7E7" />
                          <Chat :thing="row" />
                        </div>
                      </div>
                      <div v-else-if="config.key === 'image'" class="h-[100px]" style="line-height: 6rem">
                        <ThumbShower :slug="row.thing_patternmaking"></ThumbShower>
                      </div> 
                      <div v-else-if="config.key === 'image_final'" class="h-[100px]" style="line-height: 6rem">
                        <ThumbShower :slug="row.thing_final_work"></ThumbShower>
                      </div>
                      <div v-else-if="config.key === 'category'">
                        <span>{{ row.category }}
                          （<span v-if="row.produce_grade_title">{{ row.produce_grade_title }}</span><span v-else>NA</span>）
                        </span>
                      </div>
                      <div v-else-if="config.key === 'pre_workload'">
                        <span>
                          {{ thousandthsToNumber(row.pre_workload) }}
                          <span v-if="row.pre_workload_unit_title !== row.workload_unit_title">{{row.pre_workload_unit_title}}</span>
                          / {{ thousandthsToNumber(row.workload) }} 
                          <span>{{row.workload_unit_title}}</span>
                        </span>
                      </div>
                      <div v-else-if="config.key === 'unit_price'">
                        {{ thousandthsToNumber(row.unit_price) }} {{row.currency_symbol}}
                      </div>
                      <div v-else-if="config.key === 'total_price'">
                        <span class="underline" @click="handle_detailed(row)">{{ thousandthsToNumber(row.total_price.split(' ')[0]) }} {{row.currency_symbol}}</span>
                      </div>
                      <div v-else-if="config.key === 'tax_price'">
                        <span v-if="row.tax_price !== 'NA'">
                          {{ thousandthsToNumber(row.tax_price.split(' ')[0]) }} {{row.currency_symbol}}
                        </span>
                        <span v-else>NA</span>
                      </div>
                      <div v-else-if="config.key === 'expected_complete_date'">
                        <div>{{ row.expected_complete_date }} / </div>
                        <div>{{ row.committed_delivery_date }}</div>
                      </div>
                      <div v-else-if="config.key === 'last_cp_business'">
                        {{row.last_cp_business}}
                      </div>
                      <div v-else-if="config.key === 'residence_time'">
                        {{row.residence_time}}
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
         <t-pagination
            v-model="pager.page_index"
            :total="pager.total"
            v-model:pageSize="pager.page_size"
            show-jumper
            class="tb-pager"
          />
    </div>
    <a-modal
      v-model:visible="productionFinishFrom.visible"
      title="结束原因"
      :width="650"
      okText="确认"
      @ok="hanleProduction"
      cancelText="取消"
      @cancel="cancelProduction"
      >
      <div>
        <p style="color: #FF3E00">
          温馨提示：“结束制作”则该物件单将关闭不再支付任何费用，请确认是否需要结束。<br>
          <span class="ml-16 pl-3">需求方原因终止制作，不需要进行供应商评分。</span>
        </p>
        <p>
          <span>结束制作后物件流转的状态：</span>
          <a-select v-model:value="productionFinishFrom.step_type" style="width: 180px">
              <a-select-option value="1">待采购经理确认</a-select-option>
              <a-select-option value="2">待需求人验收</a-select-option>
          </a-select>
        </p>
        <p>
          <span>是否需要复制物件到询价状态：</span>
          <a-radio-group v-model:value="productionFinishFrom.is_copy">
              <a-radio value="0">否</a-radio>
              <a-radio value="1">是</a-radio>
          </a-radio-group>
        </p>
        <a-textarea v-model:value="productionFinishFrom.remark" placeholder="输入结束原因" allow-clear />
      </div>
    </a-modal>
    
    <a-modal
      v-model:visible="detailedForm.visible"
      title="价格详情"
      :width="850"
      >
      <vxe-table :data="detailedForm.dataSource" header-cell-class-name="header-detailed-class" border="inner">
        <vxe-column field="label" title="明细名称"></vxe-column>
        <vxe-column field="pre_workload_unit_label" title="需求明细">
          <template #default="{row}">
            <span v-if="row.pre_workload_unit_label">{{row.pre_workload_unit_label}}</span>
            <span v-else> NA </span>
          </template>
        </vxe-column>
        <vxe-column field="workload_unit_name" title="报价明细" >
          <template #default="{row}">
            <span> {{row.value}} {{row.workload_unit_name}}  </span>
          </template>
        </vxe-column>
        <vxe-column field="count_price" title="明细单价">
           <template #default="{row}">
            <span> {{row.count_price}} CNY</span>
          </template>
        </vxe-column>
        <vxe-column field="price" title="明细价格">
           <template #default="{row}">
            <span> {{row.price}} CNY  </span>
          </template>
        </vxe-column>
        <vxe-column field="file_id" title="附件">
          <template #default="{row}">
           <div v-if="row.file_id"> 
              <!-- <span class="mr-3 cursor-pointer" style="color: #0052D9;"> <a target="_blank" :href="row.files[0]">预览</a> </span>
              <span class="cursor-pointer" style="color: #0052D9;">下载</span> -->
              <div class="cursor-pointer truncate" style="color: #0052D9;" v-for="item in row.files">
                <a v-if="file_type(item) === '音频' || file_type(item) === '视频' || file_type(item) === '图片' || file_type(item) === 'pdf'"
                  :href="item.url" target="_blank">{{ item.file_name }}</a>
                <a v-if="file_type(item) === '压缩包' || file_type(item) === '其它'" :href="item.url" target="_top">{{
                    item.file_name
                }}</a>
              </div>
            </div>
            <div v-else> NA </div>
          </template>
        </vxe-column>
      </vxe-table>
      <div class="flex justify-start items-center h-12 mt-4 pl-3" style="background:#E8EFFB">明细总价： {{detailprice}} CNY</div>
      <template #footer>
        <a-button key="back" @click="detailedForm.visible = false">取消</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script lang="ts">
import * as R from 'ramda'
import { defineComponent, reactive, ref, nextTick, watch, onUpdated, computed } from 'vue'
import { getCurrentInstance } from "@vue/runtime-core";
import { get_in_production_list, get_in_production_configs, get_production_finish  } from '@/api/purchase-order/in-production.ts'
import { VxeTableInstance, VxeColumnPropTypes, VxeTablePropTypes } from 'vxe-table'
import FilterForm from '@/components/filter_form/index.vue'
import draggableFilter from '@/components/draggableFilter/index.vue'
import ThumbShower from '@/components/thumb_shower/index.vue'
import { SettingOutlined, UpOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import Chat from '@@/components/communicationPopUpWindow/components/chat.vue'
export default defineComponent({
  components: {
    FilterForm,
    SettingOutlined,
    draggableFilter,
    UpOutlined,
    DownOutlined,
    ExclamationCircleOutlined,
    ThumbShower,
    Chat,
  },
  async setup () {
    // 分页的数据
    const pager = reactive({
      page_index: 1,
      page_size: 20,
      total: 0
    })
    
    // 搜索的方法
    async function handleSearch(filtersForm: Object) {
      const { list, pager: { page, itemCount: total, pageSize } } = await get_in_production_list({...filtersForm, ...pager});
      pager.page_index = Number(page)
      pager.total = Number(total)
      productionTableData.tableData = list;
      productionTableData.loading = false;
      nextTick(async () =>{
        await xTable.value?.setAllRowExpand(true)
      })
    }
    const productionConfigsColumn = reactive({
      childrenColumns: [], // 表格展开列的字段
      columns: [], // 表格列的字段
      searchForm: [], // 搜索表单的字段

    })
    
    const currentInstance = getCurrentInstance();
    const newChildrenColumns = ref([]);
    newChildrenColumns.value = [
        {
          "key": "thing_name",
          "label": "物件名称/单号",
          "width": 260,
          "isShow": true,
        },
        {
          "key": "image",
          "label": "展示作品",
          "width": 110,
          "isShow": true,
        },
        {
          "key": "image_final",
          "label": "交付作品",
          "width": 110,
          "isShow": true,
        },
        {
          "key": "category",
          "label": "品类（制作等级）",
          "width": 160,
          "isShow": true,
        },
        {
          "key": "pre_workload",
          "label": "预估数量/数量",
          "width": 120,
          "isShow": true,
        },
        {
          "key": "unit_price",
          "label": "单价",
          "width": 120,
          "isShow": true,
        },
        {
          "key": "total_price",
          "type": "produce_breakdown",
          "option_key": "produce_breakdown",
          "label": "总价",
          "width": 120,
          "isShow": true,
        },
        {
          "key": "tax_price",
          "label": "税金",
          "width": 120,
          "isShow": true,
        },
        {
          "key": "expected_complete_date",
          "label": "期望/承诺交付日期",
          "width": 160,
          "isShow": true,
        },
        {
          "key": "last_cp_business",
          "label": "制作人",
          "width": 120,
          "isShow": true,
        },
        {
          "key": "residence_time",
          "label": "停留时间",
          "sort": true,
          "width": 100,
          "isShow": true,
        }
      ]
     
    const xTable = ref<VxeTableInstance>();
    const productionTableData = reactive({
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
    await handleSearch();
    const {childrenColumns, columns, search_form} = await get_in_production_configs();
    productionConfigsColumn.childrenColumns = childrenColumns;
    productionConfigsColumn.columns = columns;
    productionConfigsColumn.searchForm = search_form;
    // 结束制作的弹窗数据
    let productionFinishParams = {
      visible: false, // 是否打开弹窗
      is_copy: '0', // 是否复制物件到询价状态  0 否   1  是
      step_type: '1', // 结束流转状态  1待采购经理确认  2待需求人验收
      remark: "", // 结束原因
      thing_ids: [] // 选择的数据id 
    }
    const productionFinishFrom = reactive(Object.assign({},productionFinishParams));
    // 结束制作的方法
    async function hanleProduction(){
      const { code,msg } = await get_production_finish(productionFinishFrom);
      if(code === 0){
        await cancelProduction()
        productionFinishFrom.thing_ids = []; //结束制作确定了需要把id也清除
        productionTableData.loading = true;
        await handleSearch();
        message.success('结束制作成功');
      } else {
        message.error(msg);
      }
    }
    function cancelProduction(){
      // 清空除了id以外的所有数据
      Object.keys(productionFinishParams).forEach(v=>{
        if(v !== 'thing_ids'){
          productionFinishFrom[v] = productionFinishParams[v];
        }
      })
    }

    // 打开旧页面的弹窗
    function handle_show_detail (row, key){
      if (window.parent !== window) {
        window.parent.postMessage({
          key, value: {
            id: row.id
          }
        }, '\*')
      }
    }
    const detailedForm = reactive({
      visible: false,
      dataSource: [],
    });
    const detailprice = computed(()=>{
      let total = 0
      detailedForm.dataSource?.forEach((item:any) => {
        total += (Number(item.count_price) * item.value)
      })
        return total
    })
    function handle_detailed(row){
      detailedForm.visible = true;
      detailedForm.dataSource = JSON.parse(row.thing_quote_produce_breakdown)
    }

    const set_check_all = (checked: boolean) => {
      R.map(row => {
        R.map(s_row => { s_row.checked = checked }, row.children)
        // 过滤掉禁用的数据
      }, productionTableData.tableData.filter(v=> !v.all_disabled))
    }
    // 全选和反选是否禁用
    const set_disabled_all = computed(()=>{
      return productionTableData.tableData.every(v=> {
        return v.all_disabled;
      })
    })

    const toggle_all_checkbox = () => {
      R.map(row => {
        R.map(s_row => {
          s_row.checked = !s_row.checked;
        }, row.children)
        // 过滤掉禁用的数据
      }, productionTableData.tableData.filter(v=> !v.all_disabled))
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
      return R.all(is_row_checked, productionTableData.tableData)
    })
    const is_all_row_indeterminate = computed(() => {
      return R.any(is_row_indeterminate, productionTableData.tableData)
    })
    
    // 全部展开或收起
    function all_is_open(flag){
      R.map(row=>{row.expanded = flag},productionTableData.tableData)
    }
    
    // 单元格的点击事件，判断是否展开行 （columnIndex 第几列    rowIndex  第几行）
    function cellClick({$columnIndex, $rowIndex}){
      // 第三列或者第四列才触发是否显示展开行
      if($columnIndex !== 0){
        productionTableData.tableData.forEach((row, rowIndex) => {
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
    // 所有订单的个数
    const order_checked_count = computed(() => {
      return R.sum(R.map(row =>  R.any(R.prop('checked'),row.children) ? 1: 0 , productionTableData.tableData))
    })
    // 所有物件的数组
    const thing_checked_list = computed(()=>{
      let array = []
       R.map(row=>{
        R.map(s_row=>{
          s_row.checked ? array.push(s_row.id) : ''
        },row.children)
      }, productionTableData.tableData)

      return array;
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
    // 千分位数字转纯数字
    function thousandthsToNumber(val: string){
      if (typeof val === 'string') {
        return Number(val.replace(/,/g, ''));
      } else {
        return val;
      }
    }
    const filters = reactive(R.fromPairs(R.map(i => [i.key, null], productionConfigsColumn.searchForm)))
    const the_filters = computed({
      get: () => filters,
      set: value =>  Object.assign(filters, value)
    })

    watch(() => ({ ...filters }), async () => {
      await handleSearch({ ...filters });
    })
    watch([() => pager.page_index, () => pager.page_size], async ()=>{
      productionTableData.loading = true;
      await handleSearch();
      productionFinishFrom.thing_ids = [];
    });
    return {
      productionConfigsColumn,
      pager,
      handleSearch,
      xTable,
      productionTableData,
      productionFinishFrom,
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
      cellStyle,
      thing_checked_list,
      order_checked_count,
      hanleProduction,
      cancelProduction,
      handle_show_detail,
      detailedForm,
      detailprice,
      handle_detailed,
      newChildrenColumns,
      currentInstance,
      isShowChildrenColumns,
      draggableEnd,
      thousandthsToNumber,
      filters,
      the_filters,
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
  height: 7.875rem;
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
</style>