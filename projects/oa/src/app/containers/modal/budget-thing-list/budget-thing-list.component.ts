import { Component, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../services/modal.service';
import { formatDate } from '@angular/common';
import { MessageService } from '../../../services/message.service';
import { filterOption } from '../../../utils/utils';

import * as moment from 'moment';
moment.locale('zh-CN');

@Component({
  selector: 'app-modal-thing-budget-list',
  templateUrl: './budget-thing-list.component.html',
  styleUrls: ['./budget-thing-list.component.css']
})

export class BudgetThingListComponent implements OnInit {
  @ViewChild(NzCarouselComponent) carousel: NzCarouselComponent;
  @ViewChild('budgetThing') budgetThing: ElementRef;
  selectedValue;
  effect = 'scrollx';
  arrayList = [];
  nzZIndex = 705;
  isVisible = false;
  loading = false;
  content = null;
  current = 0;
  // 配置项
  columns = [];
  childrenColumns = [];
  columns2 = [];
  childrenColumns2 = [];
  queryFields = [];
  disabledButton = true;
  prname = '';
  story_creator = '';
  story_submit_time = '';
  budget_type = 1;
  project_product_budget_id = '';
  date = null; // new Date();
  dateRange = []; // [ new Date(), addDays(new Date(), 3) ];
  // 数据列表
  listLoading = false;
  list = [];
  list2 = [];
  storyCreatorOptions = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '10',
    page_index: '1',
  };
  pagination2 = {
    total_count: null,
    page_size: '10',
    page_index: '1',
  };
  select_type = '1';
  totalPrice = '--';

  filterOption = filterOption
  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    private message: MessageService
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'budget' ) {
        this.prname = '';
        this.story_creator = '';
        this.dateRange = [];
        this.story_submit_time = '';
        this.isVisible = true;
        this.list = [];
        this.budget_type = item['data']['key'];
        this.project_product_budget_id = item['data']['data']['id'];
        this.nzZIndex = item['zIndex'];
        this.budgetThing['container']['overlayElement'].style.zIndex = this.nzZIndex;

        if (typeof(item['data']['data']['project_product_budget_id']) != 'undefined') {
          this.project_product_budget_id = item['data']['data']['project_product_budget_id'];
        }
        this.getConfig();
      }
    });
  }

  onCancel() {
    this.isVisible = false;
    setTimeout(() => {
      if (this.current > 0) {
        this.isVisible = true;
        this.current--;
        this.content = this.arrayList[this.current];
      } else {
        this.isVisible = false;
      }
    }, 0);
  }

  load ($event) {
    this.loading = false;
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/order/order-config?isbudget=1&project_product_budget_id=' + this.project_product_budget_id).subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
      this.storyCreatorOptions = result['storyCreator'] || [];
      this.prname = result['prname'] || '';
      this.getList();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }
  // 获取数据列表
  getList(pagination?: null) {
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    params = {
      'page_index': this.pagination.page_index.toString(),
      'page_size': this.pagination.page_size.toString(),
      'budget_type': this.budget_type,
      'project_product_budget_id': this.project_product_budget_id,
      'select_type': this.select_type,
      'story_creator': this.story_creator == null ? '' : this.story_creator,
      'story_submit_time': this.story_submit_time,
    };
    this.list = [];
    this.list2 = [];
    this.totalPrice = '--';
    this.listLoading              = true;
    if (this.select_type === '4') {
      this.http.get('web/budget-api/not-order-budget-list', { params: params }).subscribe(result => {
        this.loading                = false;
        this.columns                = result['column'] || [];
        this.childrenColumns        = result['columnChildren'] || [];
        this.listLoading            = false;
        this.list                   = result['data'] || [];
        this.totalPrice             = result['total_price'] || '0';
        this.pagination.total_count = result['pager']['itemCount'] || '0';
        this.pagination.page_index  = result['pager']['page'] || '1';
        this.pagination.page_size   = result['pager']['pageSize'] || '10';
      });
    } else {
      this.http.get('web/order/budget-order-list', { params: params }).subscribe(result => {
        this.loading                = false;
        this.columns                = result['column'];
        this.childrenColumns        = result['columnChildren'];
        this.listLoading            = false;
        this.list                   = result['data']['list'];
        this.totalPrice             = result['data']['total_price'] || '0';
        this.pagination.total_count = result['data']['pager']['itemCount'];
        this.pagination.page_index  = result['data']['pager']['page'];
        this.pagination.page_size   = result['data']['pager']['pageSize'];
        if (this.select_type === '1') {
          this.http.get('web/budget-api/not-order-budget-list', { params: params }).subscribe(result1 => {
            this.loading                 = false;
            this.columns2                = result1['column'] || [];
            this.childrenColumns2        = result1['columnChildren'] || [];
            this.listLoading             = false;
            this.list2                   = result1['data'] || [];
            this.pagination2.total_count = result1['pager']['itemCount'] || 0;
            this.pagination2.page_index  = result1['pager']['page'] || 1;
            this.pagination2.page_size   = result1['pager']['pageSize'] || 10;

            const totalPrice              = result1['total_price'] || '0';
            this.totalPrice = parseFloat(this.totalPrice) + parseFloat(totalPrice) + ' CNY';
          });
        }
      });
    }
  }
  search() {
    this.pagination.page_index = '1';
    this.listLoading  = false;
    this.getList();
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modalService.open('order', event.item);
    }
  }
  onChange(result: Date): void {

    if (result && moment(result[0]).second() != 0) {
      result[0] = moment(result[0]).startOf('day').format();
    }

    if (result && moment(result[1]).second() != 59) {
      result[1] = moment(result[1]).endOf('day').format();
    }

    this.story_submit_time = '';
    if (Array.isArray(result)) {
      result.forEach(data => {
        if (this.story_submit_time != '') {
          this.story_submit_time += '~';
        }
        this.story_submit_time += formatDate(data, 'yyyy-MM-dd', 'zh');
      });
    }
  }
  // 全部展开/收起
  openOrCloseAll(bol: boolean) {
    this.list2.forEach(item => {
      item.expand = bol;
    })
    this.list.forEach(item => {
      item.expand = bol;
    })
  }

  rangPickerModelChange (dates, key) {
    if (dates && moment(dates[0]).second() != 0) {
      dates[0] = moment(dates[0]).startOf('day').format();
    }

    if (dates && moment(dates[1]).second() != 59) {
      dates[1] = moment(dates[1]).endOf('day').format();
    }
    // this.searchForm.controls[key].setValue(dates)
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
