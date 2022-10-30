import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

@Component({
  templateUrl: './project-leader-approve.component.html',
})

export class ProjectLeaderApproveComponent implements OnInit {
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
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
  rejectVisible = false;
  rejectReason = '';

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.getConfig();
    this.getList();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance-approval/approve-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
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
    this.searchFormData = paramsFilter(this.searchFormData);

    this.http.get('web/acceptance-approval/project-leader-approve-list', {
      params: {
        group_by: '1',
        ...this.searchFormData,
        ...this.pagination
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
    }, () => {
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

  approvalSubmit(optionType, hint = true) {
    const thing_id = this.list.filter(item => item.indeterminate || item.checked).map((items, index) =>
      items['children'].filter(item => item.checked).map(item => item.id)
    ).reduce((acc, val) => acc.concat(val), []);
    if (hint) {
      this.msgHint.msg = '';
      this.msgHint.flag = optionType;
      if (optionType === 'pass') {
        this.msgHint.isShow = true;
        this.msgHint.msg = `您一共选择了 ${thing_id.length} 个物件。
       ----------------------------------------------------------------------------------------- 确认要【通过】吗？`;
      } else {
        this.rejectReason = '';
        this.rejectVisible = true;
        this.msgHint.msg = `您一共选择了 ${thing_id.length} 个物件。
       ----------------------------------------------------------------------------------------- 确认要【驳回】吗？`;
      }
      return;
    } else {
      this.msgHint.isShow = false;
      this.msgHint.msg = '';
    }
    this.message.isAllLoading = true;
    this.msgHint.isSubmitLoading = true;
    this.http.post('/web/acceptance-approval/project-leader-approve', {
      thing_id: thing_id,
      option_type: optionType,
      remark: this.rejectReason
    }).subscribe(result => {
      this.message.isAllLoading = false;
      this.msgHint.isSubmitLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.rejectVisible = false;
      this.getList();
      this.menuService.getBacklog();
    }, () => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.msgHint.isSubmitLoading = false;
      this.rejectVisible = false;
    });
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code' || event.key === 'thing_name') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modalService.open('order', {...event.item, id: event.item.order_id});
    }
  }

  delayNotice() {
    let thing_id;
    thing_id = [];
    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        items.children.forEach(thing => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 11600,
      thing_id: thing_id
    });
  }
}
