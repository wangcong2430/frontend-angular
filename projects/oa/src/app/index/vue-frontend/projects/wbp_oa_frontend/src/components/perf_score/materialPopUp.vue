<template>
  <a-modal
    :bodyStyle="{ padding: 0 }"
    width="1186px"
    class="object-details"
    v-model:visible="visible"
    :footer="null"
  >
    <template #title>
      <h2 class="object-details_title">物件详情</h2>
      <span class="object-details_status">变更中</span>
      <div class="object-details_dividingLine"></div>
      <div class="object-details_handle">
        <span>当前处理人：</span
        >aallenguo(郭联军);v_bjingmeng(孟景);v_yanyliao(廖艳艳)
      </div>
    </template>
    <div class="object-details_content">
      <div class="object-details_content_left">
        <a-row>
          <a-col>
            <div class="item">
              <span class="item-label">物件名称</span>
              <span class="item-value">{{ info?.thing.thing_name }}</span>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="[155, 16]">
          <a-col>
            <div class="item">
              <span class="item-label">物件单号</span>
              <span class="item-value">{{ info?.thing.thing_code }}</span>
              <span
                class="base-label"
                v-if="info?.thing['demand_type'] === '基地'"
              >
                基地
              </span>
            </div>
          </a-col>
          <a-col>
            <div class="item">
              <span class="item-label">品类</span>
              <span class="item-value">todo</span>
            </div>
          </a-col>
          <a-col>
            <div class="item">
              <span class="item-label">制作等级</span>
              <span class="item-value">todo</span>
            </div>
          </a-col>
        </a-row>
        <a-row>
          <a-col>
            <div class="item">
              <span class="item-label">制作明细</span>
              <span class="item-value">todo</span>
            </div>
          </a-col>
        </a-row>
        <a-row>
          <a-col>
            <div class="item">
              <span class="item-label">物件备注</span>
              <span class="item-value" :class="expand ? '' : 'hidden-text'"
                >todo示例说明最高两百字数示例说明最高两百字数示例说明最高两百字数示例说明最高两百字数示例说明例说明例说明最高两百字说明…</span
              >
              <span class="link" @click="changeExpand">{{
                expand ? '收起' : '展开'
              }}</span>
            </div>
          </a-col>
        </a-row>

        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="1" tab="物件信息">
            <a-collapse v-model:activeKey="collapseActiveKey">
              <a-collapse-panel
                style="background: #E8EFFB"
                key="1"
                header="相关人员"
              >
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">制单人</span>
                      <span class="item-value"
                        >{{ info?.base['create_name'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">需求经办人</span>
                      <span class="item-value">{{
                        info?.base['brand_product_manager_name']
                      }}</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">品牌经理</span>
                      <span class="item-value"
                        >{{ info?.base['brand_manager_name'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">品牌组长</span>
                      <span class="item-value">todo</span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">品牌经理负责人</span>
                      <span class="item-value">todo</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">相关审核人</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">采购经办人</span>
                      <span class="item-value">{{
                        info?.base['brand_product_manager_name']
                      }}</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item-1">
                      <span class="item-label">验收申批人</span>
                      <span class="item-value"
                        >{{ info?.base['acceptance_audit_people'] }}
                      </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item-1">
                      <span class="item-label">采购经理</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                </a-row>
              </a-collapse-panel>
              <a-collapse-panel
                style="background: #E8EFFB"
                key="2"
                header="需求信息"
              >
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">需求名称</span>
                      <span class="item-value"
                        >{{ info?.base['story_name'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">需求单号</span>
                      <span class="item-value">{{
                        info?.base['story_code']
                      }}</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">项目名称</span>
                      <span class="item-value"
                        >{{ info?.base['project_name'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">成本中心</span>
                      <span class="item-value">todo</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">立项信息</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">使用预算</span>
                      <span class="item-value">todo</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">数据来源</span>
                      <span class="item-value">{{
                        info?.base['story_sources']
                      }}</span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">需求种类</span>
                      <span class="item-value">{{
                        info?.base['demand_type']
                      }}</span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">画师名称</span>
                      <span class="item-value">todo</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">预估工作量</span>
                      <span class="item-value">{{
                        info?.thing['pre_workload']
                      }}</span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">预计花费</span>
                      <span class="item-value">{{
                        info?.thing['expected_expenditure']
                      }}</span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">是否测试单</span>
                      <span class="item-value">todo</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item-1">
                      <span class="item-label">需求说明</span>
                      <span class="item-value"
                        >{{ info?.thing['story_remark'] }}
                      </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item-1">
                      <span class="item-label">需求附件</span>
                      <span class="item-value">
                        <a
                          v-for="val of info?.base['story_attachment_id']"
                          :href="'/web/file/' + val['id']"
                          target="_blank"
                        >
                          {{ val['file_name'] }}
                        </a>
                      </span>
                    </div>
                  </a-col>
                </a-row>
              </a-collapse-panel>
              <a-collapse-panel
                style="background: #E8EFFB"
                key="3"
                header="订单需求"
              >
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">订单名称</span>
                      <span class="item-value"
                        >{{ info?.order['order_name'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">接收订单天数</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">订单号</span>
                      <span class="item-value"
                        >{{ info?.order['order_code'] }}
                      </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">非全线上流程</span>
                      <span class="item-value"
                        >{{ info?.thing['is_reduce_process_text'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">线上确认价格</span>
                      <span class="item-value"
                        >{{ info?.thing['online_commit_price'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">交付作品及订单变更 </span>
                      <span class="item-value"
                        >{{ info?.thing['online_make_order'] }}
                      </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">线上接收订单</span>
                      <span class="item-value"
                        >{{ info?.thing['online_accept_order'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">推送邮件给供应商</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item-1">
                      <span class="item-label">议价过程附件</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">订单数量</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">订单金额</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">成交单价 </span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">代理费比例</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">是否有预付款</span>
                      <span class="item-value"
                        >{{ info?.thing['prepayments_status'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">预付款金额 </span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">我方主体</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">议价过程附件</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item-1">
                      <span class="item-label">保密范围</span>
                      <span class="item-value"
                        >{{ info?.thing['secrecy_names'] }}
                      </span>
                    </div>
                  </a-col>
                </a-row>
                <a-divider />
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">供应商名称</span>
                      <span class="item-value"
                        >{{ info?.thing['supplier_name'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">意向供应商</span>
                      <span class="item-value"
                        >{{ info?.thing['pre_supplier_name'] }}
                      </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">合同编号</span>
                      <span class="item-value"
                        >{{ info?.thing['contract_number'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">期望交付日期</span>
                      <span class="item-value"
                        >{{ info?.thing['expected_complete_date'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">承诺交付日期</span>
                      <span class="item-value"
                        >{{ info?.thing['committed_delivery_date'] }}
                      </span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">实际开工日期</span>
                      <span class="item-value"
                        >{{ info?.thing['actual_start_time'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">实际完成日期</span>
                      <span class="item-value"
                        >{{ info?.thing['actual_delivery_time'] }}
                      </span>
                    </div>
                  </a-col>
                </a-row>
              </a-collapse-panel>
              <a-collapse-panel
                style="background: #E8EFFB"
                key="4"
                header="验收信息"
              >
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">通过程度</span>
                      <span class="item-value"
                        >{{ info?.thing['pass_degree_str'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">结算比例</span>
                      <span class="item-value">{{
                        info?.thing['settlement_ratio']
                      }}</span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">验收说明</span>
                      <span class="item-value">todo</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">推EPO</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                </a-row>
              </a-collapse-panel>
              <a-collapse-panel
                style="background: #E8EFFB"
                key="5"
                header="财经信息"
              >
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">财经信息</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">EPO订单号</span>
                      <span class="item-value">{{
                        info?.statement['epo_order_code']
                      }}</span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">验收说明</span>
                      <span class="item-value">todo</span>
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="[panel_item_width, 16]">
                  <a-col>
                    <div class="item">
                      <span class="item-label">付款单号</span>
                      <span class="item-value"
                        >{{ info?.statement['epo_pay_apply_num'] }}
                      </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">付款日期</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                  <a-col>
                    <div class="item">
                      <span class="item-label">付款金额</span>
                      <span class="item-value">todo </span>
                    </div>
                  </a-col>
                </a-row>
              </a-collapse-panel>
            </a-collapse>

            <div class="object-details_table">
              <div class="object-details_table_title">
                评估结果（共{{ info?.thing.set_total_score }}分）：<span
                  class="link"
                  >{{ info?.thing.thing_score }}</span
                >
              </div>
              <dynamicTable
                :pagination="false"
                :dataSource="info?.thing.thing_score_all"
                :columns="info?.scoreConfig"
              >
                <template #test="{ row }">{{ row }}</template>
              </dynamicTable>
            </div>

            <div class="object-details_table">
              <div class="object-details_table_title">
                标签信息：<span class="link" @click="editLabel">编辑</span>
                <span class="link" @click="historyRecord">历史记录</span>
              </div>
              <a-table
                :pagination="{
                  total: 20,
                  showTotal: total => `共 ${total} 项数据`,
                }"
                :dataSource="labelDataSource"
                :columns="labelColumns"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === ''">
                    <span class="link" @click="historyRecord(record.id)">
                      历史记录
                    </span>
                  </template>
                </template>
              </a-table>
            </div>

            <div class="object-details_table">
              <div class="object-details_table_title">
                采购经理备注：<span class="link" @click="addNotes"
                  >添加备注</span
                >
                <span class="annotation">（仅采购经理和订单审批人可见）</span>
              </div>
              <dynamicTable
                :pagination="false"
                :dataSource="remarkListData"
                :columns="remarkListConfig"
              >
                <template #operate="{ row, col }">
                  <template v-for="item in col.optionBtns" :key="item.key">
                    <a-popconfirm
                      v-if="item.key === 'del'"
                      ok-text="确定"
                      cancel-text="取消"
                      title="确定要删除？"
                      @confirm="changeRemark(item['key'], row)"
                    >
                      <span class="link">{{ item.label }}</span>
                    </a-popconfirm>
                    <template v-else>
                      <a
                        :href="row['upload_file_url']"
                        target="_blank"
                        v-if="row['upload_file_url']"
                        class="link"
                        >{{ item.label }}</a
                      >
                    </template>
                  </template>
                </template>
              </dynamicTable>
            </div>
          </a-tab-pane>
          <a-tab-pane key="2" tab="操作记录" force-render>
            <div class="object-details_table">
              <div class="object-details_table_title">处理记录：</div>
              <dynamicTable
                :pagination="false"
                :dataSource="processingRecordData"
                :columns="
                  processingRecordConfig.map(item => {
                    item.ellipsis = true;
                    return item;
                  })
                "
                size="small"
              >
                <template #test="{ row }">{{ row }}</template>
              </dynamicTable>
            </div>

            <div class="object-details_table">
              <div class="object-details_table_title">报价记录：</div>
              <dynamicTable
                :pagination="false"
                :dataSource="quotationRecordData"
                :columns="quotationRecordConfig"
                size="small"
              >
                <template #test="{ row }">{{ row }}</template>
              </dynamicTable>
            </div>

            <div class="object-details_table">
              <div class="object-details_table_title">延时提醒记录：</div>
              <dynamicTable
                :pagination="false"
                :dataSource="remarksReminderData"
                :columns="remarksReminderConfig"
                size="small"
              >
                <template #test="{ row }">{{ row }}</template>
              </dynamicTable>
            </div>
          </a-tab-pane>
          <a-tab-pane key="3" tab="作品文件">
            <div class="object-details_table">
              <div class="object-details_table_title">展示作品：</div>
              <dynamicTable
                :pagination="false"
                :dataSource="info?.attachment['1000']"
                :columns="
                  info?.attachmentColumns?.map(item => {
                    item.slot = item.key === 'operate' ? item.key : '';
                    return item;
                  })
                "
              >
                <template #operate="{ row }">
                  <div>
                    <span
                      class="link"
                      @click="
                        previewPopVisiable = true;
                        previewInformation = row;
                      "
                      >预览</span
                    >
                    <span
                      class="link"
                      @click="download(row['file_path'], row['file_name'])"
                      >下载</span
                    >
                    <nz-popconfirm
                      v-if="info['isUpload'] === '1'"
                      title="确定要删除？"
                      @confirm="delThingFile(row)"
                    >
                      <span class="link" style="color: red">删除</span>
                    </nz-popconfirm>
                  </div>
                </template>
              </dynamicTable>
            </div>

            <div class="object-details_table">
              <div class="object-details_table_title">交付作品：</div>
              <dynamicTable
                :pagination="false"
                :dataSource="info?.attachment['1005']"
                :columns="
                  info?.attachmentColumns2?.map(item => {
                    item.slot = item.key === 'operate' ? item.key : '';
                    return item;
                  })
                "
              >
                <template #operate="{ row }">
                  <div>
                    <span
                      class="link"
                      @click="
                        previewPopVisiable = true;
                        previewInformation = row;
                      "
                      >预览</span
                    >
                    <span
                      class="link"
                      @click="download(row['file_path'], row['file_name'])"
                      >下载</span
                    >

                    <nz-popconfirm
                      v-if="info['isUpload'] === '1'"
                      title="确定要删除？"
                      @confirm="delThingFile(row)"
                    >
                      <span class="link" style="color: red">删除</span>
                    </nz-popconfirm>
                  </div>
                </template>
              </dynamicTable>
            </div>

            <div class="object-details_table">
              <div class="object-details_table_title">过程稿件：</div>
              <dynamicTable
                :pagination="false"
                :dataSource="info?.attachment['1010']"
                :columns="
                  info?.attachmentColumns2?.map(item => {
                    item.slot = item.key === 'operate' ? item.key : '';
                    return item;
                  })
                "
              >
                <template #operate="{ row }">
                  <div>
                    <span
                      class="link"
                      @click="
                        previewPopVisiable = true;
                        previewInformation = row;
                      "
                      >预览</span
                    >
                    <span
                      class="link"
                      @click="download(row['file_path'], row['file_name'])"
                      >下载</span
                    >
                    <nz-popconfirm
                      v-if="info['isUpload'] === '1'"
                      title="确定要删除？"
                      @confirm="delThingFile(row)"
                    >
                      <span class="link" style="color: red">删除</span>
                    </nz-popconfirm>
                  </div>
                </template>
              </dynamicTable>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
      <div class="object-details_content_right" v-if="info?.attachment">
        <div class="imgContainer">
          <div class="imgContainer_title">展示作品</div>
          <img
            v-for="item in info?.attachment['1000']"
            :key="item.id"
            class="imgContainer_img"
            :src="item.fullPath"
          />
        </div>
        <div class="imgContainer">
          <div class="imgContainer_title">交付作品</div>
          <img
            class="imgContainer_img"
            v-for="item in info?.attachment['1005']"
            :key="item.id"
            :src="item.fullPath"
          />
        </div>
        <div class="imgContainer">
          <div class="imgContainer_title">参考图</div>
          <img
            class="imgContainer_img"
            v-for="item in info?.attachment['1010']"
            :key="item.id"
            :src="item.fullPath"
          />
        </div>
      </div>
    </div>
  </a-modal>

  <a-modal
    okText="保存"
    cancelText="取消"
    width="750px"
    title="编辑标签"
    v-model:visible="editLabelVisible"
    @ok="saveLabelData"
  >
    <div
      v-if="labelEditDateSource.data.length"
      style="padding: 10px; background: #E8EFFB !important"
    >
      {{ labelEditDateSource.data[0].category }}
    </div>
    <a-table
      v-if="labelEditDateSource.data.length"
      :dataSource="labelEditDateSource.data"
      :columns="labelEditDateSource.columns"
      :pagination="false"
    >
      <template #headerCell="{ column }">
        <div class="table_header_center">{{ column.label }}</div>
      </template>
      <template #bodyCell="{ column, record }">
        <a-form>
          <template v-for="item in record.attribute_check">
            <template
              v-if="item.options.every(item => typeof item === 'string')"
            >
              <a-form-item name="username" :key="item">
                <template #label>
                  <span>{{ item.title }}</span>

                  <a-tooltip v-if="item.form_remark">
                    <template #title>{{ item.form_remark }}</template>
                    <div class="help">?</div>
                  </a-tooltip>
                </template>
                <div class="form_item">
                  <a-select
                    v-model:value="item.object_value"
                    mode="multiple"
                    :options="
                      item.options.map(item => ({ label: item, value: item }))
                    "
                  />
                  <span>{{ item.form_unit || '' }}</span>
                </div>
              </a-form-item>
            </template>
            <template v-else>
              <a-form-item name="username" :key="item.label">
                <template #label>
                  <span>{{ item.title }}</span>

                  <a-tooltip v-if="item.form_remark">
                    <template #title>{{ item.form_remark }}</template>
                    <div class="help">?</div>
                  </a-tooltip>
                </template>
                <div class="form_item">
                  <div
                    style="display: flex; align-items: center"
                    v-for="(ele, idx) in item.options"
                    :key="ele.label"
                  >
                    <a-input v-model:value="item.object_value[idx]"></a-input>
                    <span v-if="idx < item.options.length - 1"
                      >&nbsp;x&nbsp;</span
                    >
                  </div>
                  <span>&nbsp;{{ item.form_unit || '' }}</span>
                </div>
              </a-form-item>
            </template>
          </template>
        </a-form>
      </template>
    </a-table>

    <a
      target="__blank"
      style="display: block; margin-top: 20px"
      href="https://wbp-1258344700.cos.ap-guangzhou.myqcloud.com/public/static/%E4%BE%9B%E5%BA%94%E5%95%86%E4%BA%A4%E4%BB%98%E6%A0%87%E7%AD%BE%E8%AF%B4%E6%98%8E%EF%BC%88FOR%E9%9C%80%E6%B1%82%E6%96%B9%EF%BC%89.pdf"
      >点我下载 《IEG美术需求.交付标签说明》</a
    >
  </a-modal>

  <a-modal
    okText="保存"
    cancelText="取消"
    width="1200px"
    title="物件变更记录"
    v-model:visible="objectChangeRecordVisible"
    :footer="null"
  >
    <dynamicTable
      :dataSource="historyRecordData"
      :columns="historyRecordConfig"
    ></dynamicTable>
  </a-modal>

  <a-modal
    okText="确定"
    cancelText="取消"
    title="添加备注"
    v-model:visible="remarksVisible"
    @ok="submitRemark"
  >
    <span>备注信息:</span>
    <a-textarea v-model:value="remarkModalData.remark"></a-textarea>
    <!-- <a-upload
      :file-list="remarkModalData.fileList"
      action="/web/cos/upload?type=1055"
      :before-upload="beforeUpload"
      :customRequest="customReqs"
    >
      <a-button style="margin-top: 10px">
        <upload-outlined></upload-outlined>
        附件上传
      </a-button>
    </a-upload> -->
    <Upload :fileList="remarkModalData.fileList" type="1055"></Upload>
  </a-modal>

  <a-modal :footer="null" title="预览" v-model:visible="previewPopVisiable">
    <div class="mediaItem">
      <MediaItem
        :info="previewInformation"
        :attachment_id="previewInformation.id"
      />
    </div>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import dynamicTable from './dynamicTable.vue';
import { getMaterialDetails, getLabelEditInfo } from '@/api/perf/demand-score';
import {
  delRemark,
  getHistoryRecord,
  getTheChangesList,
  getTheDelayChangesList,
  getTheQuotesList,
  getTheRemarksList,
  saveLabelEditInfo,
  submitRemarks,
} from '../../api/perf/demand-score';
import { message } from 'ant-design-vue';
import http from '../../axios/http';
import MediaItem from '../MediaItem/index.vue';
import Upload from '../upload.vue'
export default defineComponent({
  components: {
    dynamicTable,
    UploadOutlined,
    MediaItem,
    Upload
  },
  props: {
    id: {
      type: String,
      default: '',
      required: true,
    },
  },
  setup(props: any) {
    let visible: any = ref(true);
    let text: any = ref('');
    let previewInformation: any = ref(null);
    let expand: any = ref(false);
    let panel_item_width: any = ref(50);
    let editLabelVisible: any = ref(false);
    let objectChangeRecordVisible: any = ref(false);
    let remarksVisible: any = ref(false);
    let previewPopVisiable: any = ref(false);
    let remarkModalData = ref({
      fileList: [],
      remark: '',
    });
    let info = ref(null);
    let dataSource: any = ref([
      {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
        tags: ['nice', 'developer'],
      },
      {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
        tags: ['loser'],
      },
    ]);
    let labelEditDateSource: any = ref();
    let columns: any = ref([
      { slot: 'test', dataIndex: 'name' },
      { dataIndex: 'age' },
    ]);

    let historyRecordConfig: any = ref([]);

    let historyRecordData: any = ref([]);

    let remarkListConfig: any = ref([]);

    let remarkListData: any = ref([]);

    let remarksReminderConfig: any = ref([]);
    let remarksReminderData: any = ref([]);
    let quotationRecordConfig: any = ref([]);
    let quotationRecordData: any = ref([]);
    let processingRecordConfig: any = ref([]);
    let processingRecordData: any = ref([]);

    let labelColumns: any = ref([
      {
        title: '标签分类',
        dataIndex: 'label_category_name',
      },
      {
        title: '标签名称',
        dataIndex: 'title',
      },
      {
        title: '标签内容',
        dataIndex: 'value',
      },
      {
        title: '操作',
        dataIndex: '',
      },
    ]);

    let labelDataSource: any = ref([]);

    onMounted(async () => {
      // const res = await getMaterialDetails(props.id);
      const res = await getMaterialDetails(27998);
      initRemark();
      const changesList = await getTheChangesList(27998);
      const quotesList = await getTheQuotesList(27998);
      const delayChangesList = await getTheDelayChangesList(27998);
      remarksReminderConfig.value = delayChangesList.columns;
      remarksReminderData.value = delayChangesList.list;
      quotationRecordConfig.value = quotesList.columns;
      quotationRecordData.value = quotesList.list;
      processingRecordConfig.value = changesList.columns;
      processingRecordData.value = changesList.list;

      info.value = res;
      for (const key in info.value.attachment) {
        if (Object.prototype.hasOwnProperty.call(info.value.attachment, key)) {
          const element = info.value.attachment[key];
          element.forEach(async (item: any) => {
            const temp = await http({
              url: item.file_path + '/60/preview',
              method: 'GET',
            });
            item.fullPath = temp.data.file_path;
            item.filename = item.file_name;
            item.url = item.file_path;
            item.type = item.file_name.split('.')[1];
            item.id = item.creator + Date.now();
          });
        }
      }

      labelDataSource.value = res.thing.attribute_check;
    });

    async function initRemark() {
      const remarkList = await getTheRemarksList(28930);
      remarkListConfig.value = remarkList.columns.map(item => {
        if (item.key === 'operate') {
          item.slot = 'operate';
        }
        return item;
      });
      remarkListData.value = remarkList.list;
    }

    function changeExpand() {
      expand.value = !expand.value;
    }
    async function editLabel() {
      labelEditDateSource.value = await getLabelEditInfo({
        type: 1,
        // id: 26573,
        id: props.id,
      });

      if (labelEditDateSource.value.data.length) {
        labelEditDateSource.value.data[0].attribute_check.map(item => {
          item.object_value = item.value.split('|');
          item.object_value = item.object_value.filter(Boolean);
        });
      }
      editLabelVisible.value = true;
    }
    async function saveLabelData() {
      if (labelEditDateSource.value.data.length) {
        labelEditDateSource.value.data[0].attribute_check.map(item => {
          item.value = item.object_value.join('|');
        });
      }

      console.log(labelEditDateSource.value.data, 'labelEditDateSource.data');
      await saveLabelEditInfo(labelEditDateSource.value);
      editLabelVisible.value = false;
    }

    async function historyRecord(id?: any) {
      const res = await getHistoryRecord('27998');
      console.log(res, 'res');
      historyRecordConfig.value = res.columns.map((item: any) => ({
        ...item,
        dataIndex: item.key,
      }));
      historyRecordData.value = res.data;
      console.log(id, 'id');

      if (typeof id === 'string') {
        historyRecordData.value = historyRecordData.value.filter(
          (item: any) => item.ca_id === id
        );
      }
      objectChangeRecordVisible.value = true;
    }

    function addNotes() {
      remarksVisible.value = true;
      remarkModalData.value.remark = '';
      remarkModalData.value.fileList = [];
    }

    async function submitRemark() {
      await submitRemarks({
        remark: remarkModalData.value.remark,
        file_id: remarkModalData.value.fileList.length
          ? remarkModalData.value.fileList[0]['file']['file_id']
          : '',
        id: 28930,
      });
      await initRemark();
      remarksVisible.value = false;
    }

    async function changeRemark(key: any, item: any) {
      if (key === 'del') {
        const res = await delRemark({
          id: item.id,
        });
        if (res['code'] === 0) {
          await initRemark();
          message.success(res['msg']);
        } else {
          message.error(res['msg']);
        }
      }
    }

    

    return {
      visible,
      text,
      expand,
      changeExpand,
      activeKey: ref('1'),
      collapseActiveKey: ref('1'),
      panel_item_width,
      dataSource,
      columns,
      editLabelVisible,
      editLabel,
      labelEditDateSource,
      saveLabelData,
      objectChangeRecordVisible,
      historyRecord,
      historyRecordData,
      historyRecordConfig,
      labelColumns,
      labelDataSource,
      addNotes,
      remarksVisible,
      remarkModalData,
      info,
      submitRemark,
      remarkListData,
      remarkListConfig,
      changeRemark,
      remarksReminderConfig,
      remarksReminderData,
      quotationRecordConfig,
      quotationRecordData,
      processingRecordConfig,
      processingRecordData,
      previewPopVisiable,
      previewInformation,
    };
  },
});
</script>

<style lang="less" scoped>
.object-details_title {
  font-size: 16px;
  font-weight: bold;
  display: inline-block;
}
.object-details_status {
  width: 48px;
  height: 18px;
  background: #ffece4;
  border-radius: 6px 0 6px 0;
  border-radius: 6px 0px 6px 0px;
  font-weight: 600;
  font-size: 12px;
  color: #ed7b2f;
  text-align: center;
  line-height: 18px;
  display: inline-block;
  margin-left: 8px;
}
.object-details_dividingLine {
  width: 1px;
  height: 20px;
  background: #e7e7e7;
  display: inline-block;
  margin: 0 16px -5px 12px;
}
.object-details_handle {
  display: inline-block;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  font-size: 14px;
  > span {
    color: rgba(0, 0, 0, 0.4);
  }
}
.object-details_content {
  width: 100%;
  display: flex;
  &_left {
    flex: 1;
    padding: 25px;
  }
  &_right {
    width: 215px;
    border-left: #f5f8fc 1px solid;
    background: #f5f8fc;
    border-radius: 0 0 4px 0;
    padding: 24px;
    .imgContainer {
      width: 168px;
      height: 200px;
      margin-bottom: 24px;
      &_title {
        font-size: 16px;
        color: rgba(0, 0, 0, 0.9);
      }
      &_img {
        width: 167px;
        height: 168px;
        margin-top: 8px;
      }
    }
  }
  .item {
    display: inline-flex;
    align-items: flex-start;
    margin: 6px 0;
    &-label {
      font-weight: 400;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.4);
      margin-right: 16px;
    }

    &-value {
      font-weight: 400;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.9);
      flex: 1;
    }
  }
  .link {
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    color: #0052d9;
    margin-left: 13px;
  }
  .annotation {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
  }
  .hidden-text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }
  .object-details_table {
    &_title {
      margin-top: 25px;
      margin-bottom: 12px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.9);
      font-weight: bolder;
    }
  }
}
.ant-collapse-content-box {
  .item {
    display: inline-flex;
    align-items: flex-start;
    margin: 6px 0;
    width: 250px;
    box-sizing: border-box;
    &-label {
      font-weight: 400;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.4);
      margin-right: 16px;
      min-width: 99px;
    }
    &-value {
      font-weight: 400;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.9);
      flex: 1;
      width: 159px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
  .item-1 {
    display: inline-flex;
    align-items: flex-start;
    margin: 6px 0;
    min-width: 250px;
    box-sizing: border-box;
    &-label {
      font-weight: 400;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.4);
      margin-right: 16px;
      min-width: 64px;
    }
    &-value {
      font-weight: 400;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.9);
      flex: 1;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
      overflow: hidden;
    }
  }
}
.table_header_center {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form_item {
  display: flex;
  align-items: center;
}
.help {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: solid 1px black;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
}
.base-label {
  width: 40px;
  height: 24px;
  background: #d4f4ff;
  border-radius: 6px 0 6px 0;
  border-radius: 6px 0px 6px 0px;
  font-size: 12px;
  color: #16a2d4;
  text-align: center;
  line-height: 24px;
  margin-left: 8px;
}
</style>
