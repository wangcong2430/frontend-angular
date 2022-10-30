import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';


@Component({
  templateUrl: './spm-confirmation.component.html',
})

export class SpmConfirmationComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modalService: ModalService,
    private modal: NzModalService
  ) {}
  // 全局变量
  loading = false;
  listLoading = false;
  disabledButton = true;
  columns = [];
  childrenColumns = [];
  queryFields = [];
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  list = [];
  expands = {}; // 展开项
  isVisible = false; // 驳回弹出框
  reason = ''; // 驳回原因
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  ngOnInit() {
    this.getConfig();
    this.getList();
  }

  getConfig() {
    this.loading = true;
    this.http.get('web/apply-change/spm-config').subscribe(result => {
      this.loading = false;
      this.columns = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
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
      'group_by': '1',
      ...this.searchFormData
    };
    this.http.get('web/apply-change/spm-confirmation-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      if (result['code'] === 0) {
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index  = result['pager']['page'];
        this.pagination.page_size   = result['pager']['pageSize'];
        if (this.expands && result['list']) {
          result['list'] = result['list'].map(item => {
            if (item.children && item.children.length > 10) {
              item['expand'] = true;
            }
            if (this.expands[item.id]) {
              item['expand'] = this.expands[item.id];
            }
            return item;
          });
        }
        this.list                   = result['list'];
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.listLoading            = false;
      this.message.error('网络错误，请刷新后重试，多次失败请联系管理员');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  confirmationSubmit(optionType) {
    let thing_id, new_tax_price;
    thing_id = [];
    new_tax_price = {};
    this.list.forEach((order, orderIndex) => {
      if (order.expand != undefined) {
        this.expands[order.id] = order.expand;
      }
      if (order['children']) {
        order['children'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing.id);
            new_tax_price[thing.id] = thing['new_tax_price_edit'] || 0;
          }
        });
      }
    });
    this.message.isAllLoading = true;
    this.http.post('/web/apply-change/spm-confirmation-submit', {
        thing_id: thing_id,
        new_tax_price: new_tax_price,
        option_type: optionType,
        reason: this.reason
      }
    ).subscribe(result => {
      this.message.isAllLoading = false;
      this.isVisible = false;
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

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      // event.item.id = event.item.order_id;
      this.modalService.open('order', event.item);
    }
  }

  // 离开焦点事件
  blurEvent(event) {
    if (event.key === 'new_tax_price_edit') {
      let new_tax_price, new_tax_price_edit, new_total_price;

      if (!event.item['new_tax_price'] || event.item['new_tax_price'] === '') {
        new_tax_price = 0;
      } else {
        new_tax_price = parseFloat(event.item['new_tax_price']);
      }

      new_tax_price_edit = parseFloat(event.item['new_tax_price_edit']);

      new_total_price = (new_tax_price_edit - new_tax_price + parseFloat(event.parentItem['new_total_price'])).toFixed(2);

      if (typeof(event.item['currency']) !== 'undefined' && event.item['currency']['symbol']) {
        new_total_price = new_total_price + ' ' + event.item['currency']['symbol'];
      }

      event.parentItem['new_total_price'] = new_total_price;
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

  delayNotice() {
    let thing_id;
    thing_id = [];
    this.list.forEach((story) => {
      if (story.expand != undefined) {
        this.expands[story.id] = story.expand;
      }
      if (story['children']) {
        story['children'].forEach((thing) => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 10940,
      thing_id: thing_id
    });
  }
}
