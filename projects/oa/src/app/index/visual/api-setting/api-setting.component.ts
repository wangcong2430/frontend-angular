import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { MessageService } from '../../../services/message.service';

@Component({
  templateUrl: './api-setting.component.html',
  styles: [
    `
    .block {
      display: block;
      height: 30px;
      lineHeight: 30px;
    }
    /deep/ .ant-checkbox-wrapper {
      display: block;
    }
    `
  ]
})

export class ApiSettingComponent implements OnInit {

  constructor(
    private http: HttpClient,
    public message: MessageService
  ) {}

  formData = null;
  formDataShow = false;
  formDataTitle = '';

  formConfig = {};
  formDataLoading = true;

  configModalShow = false;
  configModalTitle = '';
  configModal = {};
  configModalLoading = true;

  // loading
  loading = false;
  listLoading = false;
  categorys = [];
  category_select = '';

  // 配置项
  columns = [];
  disabledButton = true;

  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  queryFields = [];

  // 数据列表
  list = [];

  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };

  ngOnInit() {
    // 获取列表配置api
    this.getConfig();

    // 获取数据列表
    this.getList();
  }

  // 获取列表配置api
  getConfig() {
    this.loading = true;
    this.http.get('/web/visual/get-api-sources-setting-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.queryFields      = result['search_form'];
      this.formConfig       = result['form'];
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('/web/visual/get-api-sources-setting-list', { params: params }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.listLoading            = false;
        this.list                   = [];
        this.pagination.total_count = '0';
        return false;
      }
      this.listLoading            = false;
      this.list                   = result['data']['list'];
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
    }, err => {
      this.listLoading = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 搜索
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 列表点击事件
  clickEvent(e) {
    if(e.key === 'setting') {
      this.apiSettingEvent(e.item);
    }
    if(e.key === 'update') {
      this.orderSetting(e.item);
    }
  }

  // 编辑
  apiSettingEvent(item) {
    this.formDataTitle = '频次配置';
    this.formData = {
      time: 60,
      use_time: item.use_time || 0,
      id: item.id
    }
    this.formDataShow = true;
    this.formDataLoading = false;
  }

  // 弹窗取消
  handleCancel() {
    this.formDataShow = false;
    this.formDataLoading = true;
  }

  // 弹窗提交
  handleOk() {
    const params = {
      id: this.formData['id'],
      time: this.formData['time'],
      use_time: this.formData['use_time'],
    }
    if(params['use_time'] <= 0 ) {
      this.message.error('调用频次大于0');
      return;
    }
    this.formDataLoading = true;
    this.http.post('/web/visual/set-api-sources-setting', params).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.handleCancel();
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.handleCancel();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  changeDisabledButton(e) {}

  // 订单金额配置
  orderSetting(item) {
    this.configModalTitle = '订单金额配置';
    this.configModalLoading = true;
    this.configModalShow = true;
    const data = item.setting_json ? JSON.parse(item.setting_json) : {};
    const {
      is_order_tax_amount = 0,
      is_order_amount = 0,
      is_currency = 0,
      is_unit = 0,
      is_total = 0
    } = data;
    this.configModal = {
      is_order_tax_amount: is_order_tax_amount === 1 ? true : false,
      is_order_amount: is_order_amount === 1 ? true : false,
      is_currency: is_currency === 1 ? true : false,
      is_unit: is_unit === 1 ? true : false,
      is_total: is_total === 1 ? true : false,
      id: item['id'],
    }
    this.configModalLoading = false;
  }

  // 配置弹窗取消
  configModalCancel() {
    this.configModalShow = false;
    this.configModalLoading = true;
  }
  // 配置弹窗提交
  configModalSubmit() {
    this.orderSettingSubmit({
      id: this.configModal['id'],
      is_order_tax_amount: this.configModal['is_order_tax_amount'] ? 1 : 0,
      is_order_amount: this.configModal['is_order_amount'] ? 1 : 0,
      is_currency: this.configModal['is_currency'] ? 1 : 0,
      is_unit: this.configModal['is_unit'] ? 1 : 0,
      is_total: this.configModal['is_total'] ? 1 : 0
    })
  }

  orderSettingSubmit(data) {
    this.configModalLoading = true;
    this.http.post('/web/visual/set-api-sources-amount', data).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.configModalCancel();
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.configModalCancel();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }
}
