import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './in-production.component.html'
})

export class InProductionComponent implements OnInit {

  // loading
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
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
    page_size: 10,
    page_index: 1,
  };
  msgHint = {
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    data: {},
    msg: ''
  };

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private menuService: MenuService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = 1;
      this.getList();
    }
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/order/in-production-configs').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.childrenColumns  = result['childrenColumns'];
      this.queryFields      = result['search_form'];
      this.getList();
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      page_index:  this.pagination.page_index.toString(),
      page_size:  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/order/in-production-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
      this.list                   = result['list'];
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 按钮事件
  selectOrder(flag) {
    let item;
    item = [];
    this.list.forEach(data => {
      if (data.children) {
        data.children.forEach(data2 => {
          if (data2.checked) { item.push(data2.id); }
        });
      }
    });
    if (item.length === 0) {
      this.message.error('未选择需要执行的订单');
      return false;
    }
    this.msgHint.isShow = true;
    this.msgHint.data = {
      step_type: '1',
      is_copy: '0',
      remark: '',
    };
  }

  // 确认提交
  handleOk(): void {
    let item;
    item = [];
    this.list.forEach(data => {
      if (data.children) {
        data.children.forEach(data2 => {
          if (data2.checked) { item.push(data2.id); }
        });
      }
    });
    if (item.length === 0) {
      this.message.error('未选择需要执行的订单');
      return ;
    }
    if (this.msgHint.data['remark'] === '') {
      this.message.error('结束原因不能为空。');
      return ;
    }
    // 通过
    this.message.isAllLoading = true;
    this.msgHint.isSubmitLoading = true;
    this.http.post('web/order/production-finish', {
      thing_ids: item,
      ...this.msgHint.data
    }).subscribe(results => {
      this.message.isAllLoading = false;
      this.msgHint.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.getList();
      this.menuService.getBacklog();
      this.handleCancel();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.msgHint.isSubmitLoading = false;
    });
  }

  handleCancel(): void {
    this.msgHint.isShow = false;
    this.msgHint.isSubmitLoading = false;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modalService.open('order', event.item);
    }
  }
}
