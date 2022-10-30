import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './common-price.component.html',
})

export class CommonPriceComponent implements OnInit {
  @ViewChild(SaveModalComponent)
  private saveModal: SaveModalComponent;
  constructor(
    private http: HttpClient,
    private message: MessageService,
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
  isSave = false;

  ngOnInit() {
    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.getList();
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/price-library/library-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.form             = result['form'];
      this.queryFields      = result['search_form'];
      this.isSave           = result['isSave'] || false;
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
    this.http.get('web/price-library/library-list', { params: params }).subscribe(result => {
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
    } else if (event.key === 'del') {
      this.submitDel(event.item);
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
    this.http.post('web/supplier-shortlist/del', {
      id: item['id']
    }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
    });
  }

  // 编辑 or 新建 弹窗
  openModal(item = {}) {
    let formBase;
    formBase = this.form;
    if (item['id'] && item['category_id']) {
      this.http.get('web/price-library/category-change', { params: {category_id: item['category_id']} }).subscribe(result => {
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        // 改变表单配置
        formBase.forEach(form => {
          if (form.key === 'produce_grade_id') {
            form.hideExpression = false;
            form.templateOptions.options = result['data']['produceGradeList'] || [];
          } else if (form.key === 'produce_breakdown_id') {
            form.hideExpression = false;
            form.templateOptions.options = result['data']['produceBreakdownList'] || [];
          }
        });
        this.saveModal.openModal(formBase, item, 'common-price');
      });
    } else {
      this.saveModal.openModal(formBase, item, 'common-price');
    }
  }

  // 编辑框
  submitSaveForm(value): void {
    if (value['code'] === 0) {
      this.message.isAllLoading = true;
      this.http.post('web/price-library/library-save', { params: value['value'] }).subscribe(result => {
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
