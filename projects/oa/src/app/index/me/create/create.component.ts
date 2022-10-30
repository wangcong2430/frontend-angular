import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../services/modal.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { MessageService } from '../../../services/message.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './create.component.html',
})

export class CreateComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    private modal: NzModalService,
    private message: MessageService,
  ) {}
  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;
  can = false;
  isOpen = false;
  // loading
  loading = false;
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

  ngOnInit() {
    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.getList();
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/me/create-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
      this.can     = result['can'];
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    this.searchFormData = paramsFilter(this.searchFormData);
    let params;
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/me/create-list', { params: params }).subscribe(result => {
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

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    }
    const thing_id = event.item.children.map( val => val.id);
    if (event.key === 'withdraw') {
      this.modal.create({
        nzTitle: '提示',
        nzContent: '确认撤回已提交的需求吗?',
        nzClosable: false,
        nzOnOk: () => new Promise(resolve => {
          this.http.post('web/me/withdraw', {'thing_id' : thing_id}).subscribe(res => {
            if (res['code'] == 0) {
              this.message.success(res['msg']);
              this.getList();
              resolve();
            } else {
              this.message.error(res['msg']);
            }
          });
        })
      });
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

  // 导出订单
  exportOrder () {
    this.modalService.open('order-export', {});
  }

}
