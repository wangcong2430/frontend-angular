import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  
import { ModalService } from '../../../services/modal.service';

@Component({
  templateUrl: './story.component.html',
})

export class StoryComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    private route: ActivatedRoute
  ) {}
  formObject = {};
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
  queryFields: [];
  disabledButton = true;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  admin = false;
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  searchLoading = false;

  ngOnInit() {
    // 获取url参数
    this.route.queryParams.subscribe(obj => {
      this.formObject = obj;
    });
    // 获取列表配置
    this.getConfig();
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/story/story-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
      this.can     = result['can'];
      this.admin     = result['admin'];
      this.queryFields.forEach((item: Object) => {
        if (this.formObject[item['key']]) {
          item['defaultValue'] = this.formObject[item['key']];
        }
      });
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.searchLoading = true;
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);

    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.formObject,
      ...this.searchFormData
    };
    this.http.get('web/story/story-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.searchLoading = false;
      this.list                   = result['data']['list'];
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
    }, () => {
      this.listLoading            = false;
      this.searchLoading          = false;
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  //到处物件耗时
  exportOrderNew(){
    this.modalService.open('export', {
      url: 'web/thing/special-export',
      type: '1000'
    })
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
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
