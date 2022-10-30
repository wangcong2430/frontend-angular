import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './soa.component.html',
})

export class SoaComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService
  ) {
  }
  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;

  isOpen = false;
  // loading
  loading = false;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields: [];
  disabledButton = true;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  searchLoading = false;


  ngOnInit() {
    // 获取列表配置
    this.getConfig();

  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/statement/statement-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.searchLoading = true;
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);

    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/statement/statement-list', { params: params }).subscribe(result => {
      this.searchLoading = false;
      this.listLoading            = false;
      this.list                   = result['data']['list'];
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.searchLoading = false;
      this.listLoading            = false;
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      // this.thingDetailModal.openModal(event.item);
      this.modalService.open('thing', event.item);
    } else if (event.key === 'download') {
      let url = '/web/statement/download/' + event.item.id;
      location.href = url;
    }
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }
  // 拉取状态
  pullStatus() {
    let ids;
    ids = [];
    this.list.forEach(data => {
      if (data.checked) {
        ids.push(data.id);
      }
    });
    if (ids.length === 0) {
      this.message.error('未选择需要执行的订单');
      return false;
    }
    this.message.isAllLoading = true;
    this.http.get('web/test-api/pull-statement-pay', { params: {ids: ids} }).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
    });
  }
}
