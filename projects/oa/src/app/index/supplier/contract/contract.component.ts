import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './contract.component.html',
})

export class ContractComponent implements OnInit {
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
    this.http.get('web/contract/config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.formFields       = result['form'];
      this.queryFields      = [];
      for (const formItem of this.formFields) {
        if (formItem.key === 'supplier_id') {
          formItem['lifecycle'] = {
            onInit: (form, field) => {
              form.get('supplier_id').valueChanges.pipe(
                takeUntil(this.modelSubject)
              ).subscribe(
                value => {
                  this.http.get('web/ajax-check/get-epo-order', {
                    params: {
                      'supplier_id': value
                    },
                    observe: 'response'
                  }).subscribe(response => {
                    if (response.body['data']) {
                      this.formFields[1].templateOptions.options = response.body['data'];
                    } else {
                      this.formFields[1].templateOptions.options = [];
                    }

                  });
                }
              );
            }
          };
        } else if (formItem.key === 'epo_order_code') {
          formItem['lifecycle'] = {
            onInit: (form, field) => {
              form.get('vendor_id').valueChanges.pipe(
                takeUntil(this.modelSubject)
              ).subscribe(
                value => {
                  this.http.get('web/ajax-check/get-epo-order-info', {
                    params: {
                      'epo_order_code': value
                    },
                    observe: 'response'
                  }).subscribe(response => {
                    if (field.formControl.parent.get('contract_number') ) {
                      field.formControl.parent.get('contract_number').setValue(response.body['data']['contract_number']);
                    }
                    if (field.formControl.parent.get('date_range')) {
                      field.formControl.parent.get('date_range').setValue(response.body['data']['date_range']);
                    }
                    if (response.body['data']['org_info']) {
                      this.formFields[4].templateOptions.options = response.body['data']['org_info'];
                    } else {
                      this.formFields[4].templateOptions.options = [];
                    }

                  });
                }
              );
            }
          };
        }
      }
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
    this.http.get('web/contract/list', { params: params }).subscribe(result => {
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
    this.formData = item;
    this.isModelVisible = true;
  }

  closeModel(): void {
    this.isModelVisible = false;
    this.isOkLoading = false;
    this.modelSubject.next();
  }

  save(form) {
    this.isOkLoading = true;
    if (form.valid) {
        this.http.post('web/contract/save', this.formData).subscribe(result => {
          this.isOkLoading = false;
          this.isModelVisible = false;
          this.modelSubject.next();
          this.getList();
        });
      }
  }
}
