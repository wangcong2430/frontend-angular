import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { ThingDetailModalComponent } from '../../../../../containers/modal/thing-detail/thing-detail.component';
import { MessageService } from '../../../../../services/message.service';
import { LanguageService } from '../../../../../services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './soa.component.html',
})

export class SoaComponent implements OnInit {
  @ViewChild(ThingDetailModalComponent)
  private thingDetailModal: ThingDetailModalComponent;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private message: MessageService,
    private language: LanguageService,
    private translate: TranslateService
  ) {
    this.translate.use(this.language.language);
  }

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
  queryFields: [];
  disabledButton = true;
  // 筛选
    searchFormData = {
  };
  // 数据列表
  list = [];
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

  // 供应商的合同列表
  contractList = [];
  // 弹窗接口配置


  // 定义表单配置
  formFields: FormlyFieldConfig[];

  ngOnInit() {
    this.getConfig();
    this.getList();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/statement/statement-config').subscribe(result => {
      this.loading         = false;
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
    let params;
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/statement/statement-list', { params: params }).subscribe(result => {
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
    if (event.key === 'thing_code') {
      this.thingDetailModal.openModal(event.item);
    } else if (event.key === 'download') {
      const url = '/web/statement/download/' + event.item.id;
      location.href = url;
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
