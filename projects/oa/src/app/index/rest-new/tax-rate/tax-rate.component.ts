import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { Subject } from 'rxjs';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './tax-rate.component.html',
})

export class TaxRateComponent implements OnInit {
  @ViewChild(SaveModalComponent)
  private saveModal: SaveModalComponent;
  constructor(
    private http: HttpClient,
    private message: MessageService
  ) {}
  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;

  isOpen = false;
  formData;
  // loading
  loading = false;
  listLoading = false;
  changLoading = false;
  // 配置项
  form = {};
  formFields: FormlyFieldConfig[];
  columns = [];
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

  changeList = [];
  logsVisible = false;


  // 弹窗
  model: any = {};
  modelSubject = new Subject<void>();
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
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
    this.http.get('web/tax-rate/config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.queryFields      = result['query'];
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
    this.http.get('web/tax-rate/list', { params: params }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.listLoading            = false;
        this.list                   = [];
        this.pagination.total_count = '0';
        return false;
      }
      this.listLoading            = false;
      this.list                   = result['list'];
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
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
    if (event.key === 'update') {
      this.openModal(event.item);
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
  // 编辑 or 新建 弹窗
  openModal(item = {}) {
    let params = {};
    if (item['id']) {
      params = { id: item['id'] };
    }
    this.http.get('web/tax-rate/save-config', { params: params }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.saveModal.openModal(result['data']['form'], item);
    });
  }
  // 编辑框
  submitSaveForm(value): void {
    if (value['code'] === 0) {
      this.message.isAllLoading = true;
      this.http.post('web/tax-rate/save', { ...value['value'] }).subscribe(result => {
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
  // 操作记录
  openLogModal() {
    this.changLoading = true;
    this.logsVisible = true;
    this.changeList = [];
    this.http.get('web/tax-rate/change-list').subscribe(result => {
      this.changLoading = false;
      this.changeList = result['list'] || [];
    });
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
