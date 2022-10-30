import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../services/message.service';
import { HttpClient } from '@angular/common/http';

import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';

import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';


@Component({
  templateUrl: './related-reviewer-audit.component.html',
})

export class RelatedReviewerAuditComponent implements OnInit {
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
    total_count: 0,
    page_size: '20',
    page_index: '1',
  };
  isVisible = false; // 驳回弹出框
  reason = ''; // 驳回原因
  expands = {}; // 展开项

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modalService: ModalService
  ) {
  }

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
    this.getList(this.pagination);
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    // 配置文件读取需求审核的两个页面数据展示是一样的
    this.http.get('web/demand/demand-audit-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
    });
  }

  // 获取数据列表
  getList(pagination: {total_count: number, page_size: string, page_index: string}) {
    this.list = [];
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
     this.http.get('web/demand/related-reviewer-audit-list', { params: params }).subscribe(result => {
       this.listLoading            = false;
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
    const thing_id = [];
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
    this.http.post('/web/demand/related-reviewer-audit-' + optionType, {
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
      this.getList(this.pagination);
      this.isVisible = false; // 关闭驳回弹窗
      this.reason = ''; // 清空驳回原因
      this.menuService.getBacklog();
    }, () => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    }
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList(this.pagination);
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
      current_workflow: 10105,
      thing_id: thing_id
    });
  }
}
