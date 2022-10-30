import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

@Component({
  templateUrl: './acceptance-approve.component.html',
  styles: [`
    :host ::ng-deep .table-content {
      min-height: 200px;
    }

    :host ::ng-deep .ant-spin-nested-loading > div > .ant-spin {
      min-height: 100px;
    }
  `]
})

export class AcceptanceApproveComponent implements OnInit {

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
  expands = {}; // 展开项
  isVisible = false; // 驳回弹出框
  reason = ''; // 驳回原因
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  msgHint = {
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: ''
  };

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance/acceptance-approve-configs').subscribe(result => {
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
    if (pagination) { this.pagination = pagination; }

    this.searchFormData = paramsFilter(this.searchFormData);
    this.http.get('web/acceptance/acceptance-approve-list', { params: {
      ...this.searchFormData,
      page_index: this.pagination.page_index.toString(),
      page_size: this.pagination.page_size.toString(),
    }}).subscribe(result => {
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
  confirmationSubmit(optionType): void {
    let thing_ids;
    thing_ids = [];
    this.list.forEach((order, orderIndex) => {
      if (order.expand != undefined) {
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
    this.http.post('web/acceptance/acceptance-approve-' + optionType, {
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

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modalService.open('order', event.item);
    } else if (event.key === 'operation') {
      window.open(event.item.operation_id);
    }
  }

  delayNotice() {
    let thing_id;
    thing_id = [];
    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        this.expands[items.id] = items.expand;
        items.children.forEach(thing => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 10110,
      thing_id: thing_id
    });
  }
}
