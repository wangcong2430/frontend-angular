import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './story-price-change.component.html',
})
export class StoryPriceChangeComponent implements OnInit {
  loading = true;
  listLoading = false;
  isSubmitLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  disabledButton = true;
  queryFields: [];
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
  msgHint = {
    key: '',
    isShow: false,
    isSubmitLoading: false,
    type: 1,
    msg: ''
  };

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
    this.http.get('web/price/price-change-story-configs').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['childrenColumns'];
      this.queryFields     = result['search_form'];
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
      'page_index': this.pagination.page_index.toString(),
      'page_size': this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/price/price-change-story-list', { params: params }).subscribe(result => {
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

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  msgHintModal(type = 1) {
    this.msgHint.isShow = true;
    this.msgHint.type = type;
    this.msgHint.msg = type === 1 ? '确定要【通过】所选择的物件？' : '确定要【驳回】所选择的物件？';
  }
  msgHintModalOk() {
    if (this.msgHint.type === 1) {
      this.changePass();
    } else if (this.msgHint.type === 2) {
      this.changeReject();
    }
  }
  msgHintModalCancel() {
    this.msgHint.msg = '';
    this.msgHint.isShow = false;
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
      this.msgHint.isShow = false;
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.isSubmitLoading = false;
    });
  }

  // 驳回按钮
  changeReject() {
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
    this.http.post('web/price/price-change-reject', {thing_ids: item}).subscribe(results => {
      this.message.isAllLoading = false;
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.msgHint.isShow = false;
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.isSubmitLoading = false;
    });
  }

  // 失去焦点事件
  blurEvent(event) {
    if (event.key === 'producer_name') {
    }
  }

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
      this.getList();
    }
  }
}
