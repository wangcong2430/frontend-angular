import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MessageService} from '../../../services/message.service';
import {MenuService} from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './approve-query.component.html',
})

export class ApproveQueryComponent implements OnInit {
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  auth = [];

  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  disabledButton = true;


  // 数据列表
  list = [];
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
  // 驳回原因
  isVisible = false; // 驳回弹出框
  rejectReason = null;

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
    this.getList();
  }


  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance-approval/approval-query-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
      this.auth            = result['auth'];

    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }

    this.searchFormData = paramsFilter(this.searchFormData);

    this.http.get('web/acceptance-approval/approval-list', {
      params: {
        group_by: '1',
        page_index:  this.pagination.page_index.toString(),
        page_size:  this.pagination.page_size.toString(),
        ...this.searchFormData
      }
    }).subscribe(result => {
      this.listLoading            = false;
      if (result['code'] == 0) {
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index  = result['pager']['page'];
        this.pagination.page_size   = result['pager']['pageSize'];
        this.list                   = result['list'];
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.listLoading            = false;
      this.message.error('网络错误，请刷新后重试，多次失败请联系管理员');
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

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code' || event.key === 'thing_name') {
      // this.thingDetailModal.openModal(event.item);
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modalService.open('order', {...event.item, id: event.item.order_id});
    }
  }

  preview () {
    this.modalService.open('photo');
  }

  // 撤回
  approveRecall () {
    // 判断是否选择
    const postData = [];
    let error = '';
    this.list.forEach((item, itemIndex) => {
      if (item.checked || item.indeterminate) {
        postData.push( item );
        item.children.forEach(
          (child, index) => {
            // tslint:disable-next-line:triple-equals
            if (child.flow_step_name != '待终审人审批') {
              error = '只有待终审人审批流程的单据才可以撤回';
            }
          }
        );
      }
    });

    if (error) {
      this.message.error(error);
      return;
    }


    // 判断是否当前状态
    // @ts-ignore
    if (postData && postData.length < 1) {
      this.message.error('没有勾选订单');
      return;
    }
    // 判断是否有撤回原因
    // tslint:disable-next-line:triple-equals
    if (this.rejectReason === null) {
      this.rejectReason = '';
      this.isVisible = true;
      return;
    }

    // tslint:disable-next-line:triple-equals
    if (this.rejectReason == '') {
      this.rejectReason = null;
    }

    const url = '/web/acceptance-approval/approval-recall';

    this.http.post(url, {
        data: postData,
        reason: this.rejectReason
      }).subscribe(res => {
        this.rejectReason = null;
      // tslint:disable-next-line:triple-equals
        if (res['code'] != 0) {
          this.message.error(res['msg']);
          return;
        }
        this.getList();
    }, (err) => {
        this.message.error('网络错误，请稍后再试或联系管理员');
    });

    this.isVisible = false;
  }
}
