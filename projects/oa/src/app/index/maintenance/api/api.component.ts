import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  


@Component({
  templateUrl: './api.component.html',
})

export class ApiComponent implements OnInit {
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
  // 配置项
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
  update_form = new FormGroup({});
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };
  // 定义表单配置
  formFields: FormlyFieldConfig[];
  // 弹窗
  modalData = {
    loading: true,
    isShow: false,
    formBase: [],
    data: {},
    result: {}
  };
  ngOnInit() {
    // 获取列表配置
    this.getConfig();
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/maintenance/system-api-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.form             = result['form'];
      this.queryFields      = result['search_form'];
      // 获取列表信息
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
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/maintenance/system-api-list', { params: params }).subscribe(result => {
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
    } else if (event.key === 'trigger') {
      this.openModalData(event.item);
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
    this.saveModal.openModal(this.form, item, 'system-api');
  }

  // 编辑框
  submitSaveForm(value): void {
    if (value['code'] === 0) {
      this.message.isAllLoading = true;
      this.http.post('web/maintenance/system-api-save', { params: value['value'] }).subscribe(result => {
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

  // 弹窗开启
  openModalData(item) {
    if (item.method && item.method == 2) {
      const params = {};
      item.params.split('&').map(p => {
        params[p.split('=')[0]] = p.split('=')[1];
      });
      this.http.post(item['url'],  params).subscribe(result => {
        this.message.success(result['msg']);
      }, (err) => {
        this.modalData.loading = false;
        this.modalData.result = err.error.text;
      });
    } else {
      this.modalData.result = {};
      this.modalData.loading = true;
      this.modalData.isShow = true;

      let url = item['url'];
      if (item['params']) {
        url += '?' + item['params'];
      }
      this.http.get(url).subscribe(result => {
        this.modalData.loading = false;
        if (typeof(result) === 'object') {
          result = JSON.stringify(result);
        }
        this.modalData.result = result;
      }, (err) => {
        this.modalData.loading = false;
        this.modalData.result = err.error.text;
      });
    }
  }
  // 弹窗关闭
  cancelModal(): void {
    this.modalData.isShow = false;
  }
}
