import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service' ;
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './price-change.component.html',
  styles: [
    `
    :host ::ng-deep .ant-table-placeholder {
      border-bottom: none;
    }
    `
  ]
})

export class PriceChangeComponent implements OnInit {
  // loading
  loading = true;
  listLoading = false;
  isSubmitLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
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
  expands = [];
  isVisible = false; // 驳回弹出框
  reason = ''; // 驳回原因

  constructor  (
    private http: HttpClient,
    private message: MessageService,
    private menuService: MenuService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
  }


  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/price/price-change-configs').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['childrenColumns'];
      this.queryFields     = result['search_form'] ? result['search_form'] : [];
      // 获取列表
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
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/price/price-change-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
      this.list                   = result['list'];
      this.changeDisabledButton(false);
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 通过按钮
  changePass() {
    let item;
    item = [];
    this.list.forEach(data => {
      if (data.children && data.children.length > 0) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            item.push(data2.id);
          }
        });
      }
    });
    if (item.length === 0) {
      this.message.error('未选择需要执行的物件');
      return false;
    }
    this.message.isAllLoading = true;
    this.isSubmitLoading = true;
    this.http.post('web/price/price-change-pass', {thing_ids: item}).subscribe(results => {
      this.message.isAllLoading = false;
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.isSubmitLoading = false;
    });
  }

 // 按钮事件
 confirmationSubmit(optionType): void {
  let thing_ids;
  thing_ids = [];
  this.list.forEach((order, orderIndex) => {
    if(order.expand != undefined) {
      this.expands[order.id] = order.expand;
    }
    if (order['children']) {
      order['children'].forEach((thing, thingIndex) => {
        if (thing.checked) {
          thing_ids.push(thing.id);
        }
      });
    }
  });
  this.message.isAllLoading = true;
  this.http.post('web/order/approval-submit-' + optionType, {
      thing_ids: thing_ids,
      reason: this.reason
    }
  ).subscribe(result => {
    this.isVisible = false;
    this.message.isAllLoading = false;

    if (result['code'] !== 0) {
      this.message.error(result['msg']);
      return false;
    }
    this.message.success(result['msg']);
    this.getList();
    this.menuService.getBacklog();
  }, (err) => {
    this.message.error('网络异常，请稍后再试');
    this.message.isAllLoading = false;
    this.isVisible = false;
  });
}


  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      event.item.id = event.item.order_id;
      this.modalService.open('order', event.item);
    }
  }

  // 失去焦点事件
  blurEvent(event) {
    if (event.key === 'producer_name') {
    }
  }
}
