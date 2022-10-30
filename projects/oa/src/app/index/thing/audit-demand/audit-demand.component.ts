import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

@Component({
  templateUrl: './audit-demand.component.html',
})

export class AuditDemandComponent implements OnInit {
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
    page_size: '20',
    page_index: '1'
  };
  isVisible = false; // 驳回弹出框
  reason = ''; // 驳回原因
  expands = {}; // 展开项

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
    this.getList();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/demand/demand-check-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
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
     this.http.get('web/demand/demand-audit-list', {
       params: params
     }).subscribe(result => {
       this.listLoading            = false;
       if (result['code'] == 0 && result['data']) {
        if (this.expands && result['data']['list']) {
          result['data']['list'] = result['data']['list'].map(item => {
            if (this.expands[item.id]) {
              item['expand'] = this.expands[item.id];
            }
            return item;
          });
        }
         this.list                   = result['data']['list'] ? result['data']['list'] : [];
         this.pagination.total_count = result['data']['pager']['itemCount'];
         this.pagination.page_index  = result['data']['pager']['page'];
         this.pagination.page_size   = result['data']['pager']['pageSize'];
       } else {
         this.list = [];
         this.pagination.total_count = 0;
         this.pagination.page_index = '1';
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

  auditSubmit(optionType) {
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
    this.message.isAllLoading = true;
    this.http.post('/web/demand/demand-audit-' + optionType, {
      thing_id: thing_id,
      reason: this.reason,
    }
    ).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.isVisible = false; // 关闭驳回弹窗
      this.reason = ''; // 清空驳回原因
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }
  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modalService.open('order', event.item);
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
      current_workflow: 10200,
      thing_id: thing_id
    });
  }
}
