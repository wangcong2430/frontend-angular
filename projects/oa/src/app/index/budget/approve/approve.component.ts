import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './approve.component.html',
})

export class ApproveComponent implements OnInit {
  loading;
  listLoading;
  columns;
  list = [];
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  queryFields: [];
  allChecked = false;
  disabledButton = true;
  checkedNumber = 0;
  isOpen = false;
  indeterminate = false;
  approve = {
    title: '',
    flag: 1,
    remark: '',
    loading: false
  };
  msgHint = {
    key: '',
    isShow: false,
    isSubmitLoading: false,
    type: 1,
    msg: '',
    data: []
  };
  mshShow = {
    loading: true,
    isShow: false,
    code: '',
    url: ''
  };

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private menuService: MenuService,
  ) {}

  ngOnInit() {
    this.getConfig();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/project-budget/get-approve-configs').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.queryFields      = result['search_form'];
      this.getList();
    });
  }

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
    this.http.get('web/project-budget/approve-list', { params: params }).subscribe(result => {
      if (result['code'] === 0) {
        this.listLoading            = false;
        this.list                   = result['list'];
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index  = result['pager']['page'];
        this.pagination.page_size   = result['pager']['pageSize'];
      }

    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'upload_file_name') {
      location.href = event.item['upload_file_url'];
    } else if (event.key === 'msh_click') {
      this.mshShow.code = event.item['msh_code'] || '';
      this.mshShow.url = event.item['upload_file_show'] || '';
      this.mshShow.isShow = true;
    } else if (event.key === 'info') {
      this.msgHint.data = event.item['approve_log'] || [];
      this.msgHint.isShow = true;
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

  approveSubmit(approve_type) {
    const ids = [];
    this.list.forEach(value => {
      if (value.checked) {
        ids.push(value.id);
      }
    });
    if (ids.length === 0) {
      this.message.error('请先选择操作的单据');
      return;
    }
    this.approve.loading = true;
    this.message.isAllLoading = true;
    this.http.post('web/project-budget/budget-approve-submit', {
      'ids': ids,
      'approve_type': approve_type,
    }).subscribe(results => {
      this.approve.loading = false;
      this.message.isAllLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.handleCancel();
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.approve.loading = false;
    });
  }

  showModal(flag): void {
    const ids = [];
    this.list.forEach(value => {
      if (value.checked) {
        ids.push(value.id);
      }
    });
    if (ids.length === 0) {
      this.message.error('请先选择操作的单据');
      return;
    }
    this.isOpen = true;
    this.approve.title  = flag === 1 ? '是否确认通过审批？' : '是否确认驳回审批？';
    this.approve.flag   = flag;
    this.approve.remark = '';
  }

  handleOk(): void {
    this.isOpen = false;
    // 审批通过
    if (this.approve.flag === 1) {
      this.approveSubmit(1);
    } else {
      this.approveSubmit(2);
    }
  }

  handleCancel(): void {
    this.isOpen = false;
  }

  msgHintModalCancel() {
    this.msgHint.msg = '';
    this.msgHint.data = [];
    this.msgHint.isShow = false;
  }
  mshShowModalCancel() {
    this.mshShow.code = '';
    this.mshShow.url = '';
    this.mshShow.isShow = false;
    this.mshShow.loading = true;
  }
  changeLoad() {
    this.mshShow.loading = false;
  }
  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
