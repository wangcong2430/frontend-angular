import { Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFormOptions } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MessageService } from '../../../services/message.service';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './contract-approval.component.html',
})

export class ContractApprovalComponent implements OnInit, OnDestroy {
  @ViewChild(SaveModalComponent)
  private saveModal: SaveModalComponent;
  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    private message: MessageService
  ) {
    this.modalService.complete$.pipe(takeUntil(this.onDestroy$)).subscribe(res => {
      if (res['key'] === 'contract-price-apply-info' && res['data']['code'] === 0 ) {
        this.getList();
      }
    });
  }
  onDestroy$ = new Subject<void>();
  isSubmitLoading = false;
  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;


  isOpen = false;
  formData;
  // loading
  loading = false;
  listLoading = false;
  // 配置项
  form = {};
  columns = [];
  childrenColumns = [];
  disabledButton = true;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  queryFields = [];
  // 数据列表
  list = [];
  treeSelect = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  model: any = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };

  showModal = {
    isOpen: false,
    id: 0,
    loading: false,
    type: 'reject',
    title: '是否驳回？',
    reject_remark: ''
  };

  ngOnInit() {
    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.getList();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/contract/contract-apply-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.form             = result['form'];
      // this.queryFields      = result['search_form'];
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
      ...this.searchFormData
    };
    this.http.get('web/contract/contract-apply-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.list                   = result['data']['list'];
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

  // 点击事件
  clickEvent(event) {
    if (event.key === 'info') {
      this.modalService.open('contract-price-apply-info', {
        id: event.item['id'],
        is_show_apply: true
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

  // 编辑框
  submitDel(item): void {
    this.http.post('web/supplier-shortlist/del', { id: item['id'] }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
    });
  }
  submitStepDialog() {
    this.showModal.loading = false;
    this.showModal.isOpen = true;
  }
  // 通过或驳回
  submitStep(type) {
    if (!this.isSubmitLoading) {
      const id = [];
      this.list.forEach((data, statementIndex) => {
        if (data.checked) {
          id.push(data.id);
        }
      });
      const reject_remark = '';
      this.isSubmitLoading = true;
      this.http.post('web/contract/contract-approval-submit', {
        id: id,
        type: type,
        reject_remark: this.showModal.reject_remark
      }).subscribe(result => {
        this.isSubmitLoading = false;
        this.showModal.loading = false;
        this.showModal.isOpen = false;
        this.showModal.reject_remark = '';
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.getList();
      }, () => {
        this.isSubmitLoading = false;
      });
    }

  }

  // 编辑框
  submitSaveForm(value): void {
    if (value['code'] === 0) {
      this.message.isAllLoading = true;
      this.http.post('web/supplier-shortlist/save', { params: value['value'] }).subscribe(result => {
        this.message.isAllLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.saveModal.cancelModal();
        this.getList();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
      });
    }
  }
}
