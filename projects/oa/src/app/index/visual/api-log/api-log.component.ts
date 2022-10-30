import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { MessageService } from '../../../services/message.service';

@Component({
  templateUrl: './api-log.component.html',
})

export class ApiLogComponent implements OnInit {

  constructor(
    private http: HttpClient,
    public message: MessageService
  ) {}

  formData = null;
  formDataTitle = '';
  formDataShow = false;
  formDataLoading = true;

  formConfig = {};

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
    this.http.get('/web/visual/get-api-sources-log-config').subscribe(result => {
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
    this.http.get('/web/visual/get-api-sources-log-list', { params: params }).subscribe(result => {
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
    if(e.key === 'detail') {
      this.detailShow(e.item);
    }
  }

  // 查看详情
  detailShow(item) {
    const params = {
      id: item.id
    }
    this.formDataLoading = true;
    this.http.get('/web/visual/get-api-sources-log-detail', { params })
    .subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.formDataLoading = true;
        this.handleCancel();
        return false;
      }
      this.formData = {
        data: result['data'],
        app_id: item.app_id
      }
      this.formDataTitle = '调用详情';
      this.formDataShow = true;
      this.formDataLoading = false;
    })

  }

  // 弹窗取消
  handleCancel() {
    this.formDataShow = false;
    this.formDataLoading = true;
  }

  // 弹窗提交
  handleOk() {
    const params = {
      time: this.formData['time'],
      use_time: this.formData['use_time'].trim(),
    }
    if(params['use_time'] === '') {
      this.message.error('请填写次数');
      return;
    }
    this.formDataLoading = true;
    this.http.post('/web/visual/add-api-sources', params).subscribe(result => {
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

  deleteLog() {
    this.http.post('/web/task/update-api-sources-request-log-delete', {}).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.handleCancel();
        return false;
      }
      this.message.success('清理成功');
      this.getList();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }
  changeDisabledButton(e) {}
}
