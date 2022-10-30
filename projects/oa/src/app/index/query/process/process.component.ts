import { Component, OnInit,  ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../services/modal.service';
import { MessageService } from '../../../services/message.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

@Component({
  templateUrl: './process.component.html',
  styles: [`
    ::ng-deep .ant-collapse > .ant-collapse-item.ant-collapse-no-arrow > .ant-collapse-header {
      color: #000000;
      font-size: 18px;
    }
    ::ng-deep .ant-collapse-content .ant-collapse-content-box {
      padding: 0;
    }
    ::ng-deep .bg-light.pb-5.ant-layout-content {
      min-height: auto;
    }
    :host ::ng-deep .ant-table-tbody > tr > td  {
      max-width: 160px;
      min-width: 120px;
      width: 120px;
      word-wrap: break-word;
    }

    ::ng-deep .search-results {
      -webkit-transform: translateZ(0);
      -moz-transform: translateZ(0);
      -ms-transform: translateZ(0);
      -o-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-backface-visibility: hidden;
      -moz-backface-visibility: hidden;
      -ms-backface-visibility: hidden;
      backface-visibility: hidden;

      -webkit-perspective: 1000;
      -moz-perspective: 1000;
      -ms-perspective: 1000;
      perspective: 1000;
    }
    :host ::ng-deep .ng-star-inserted   .ant-btn-default {
      background-color: #2575e6!important ;
      color: #fff;
    }
    :host ::ng-deep .ng-star-inserted    .ant-btn-default:hover {
      background-color: #2575e6!important ;
      color: #fff;
    }
    :host ::ng-deep .ng-star-inserted .ant-btn-primary{
      background-color: #2575e6!important ;
      color: #fff;
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProcessComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    private message: MessageService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  // Model 参数配置
  title = 'title';

  // loading
  loading = false;
  listLoading = false;

  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;

  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  // 数据列表
  list = [];
  listConfig = [];
  searchLoading = false;
  searchFormIsDisabled = false;
  // 分页
  pagination = {
    total_count: 0,
    page_size: '20',
    page_index: '1'
  };
  // 是否显示全部展开/收起
  isChildren = false;
  // 流程列表
  status = [];
  // 流程数
  statusLength;
  // 流程计数 == 流程数 显示全部展开
  statusNum = 0;
  isSearchDropdown = false;
  isColumnDropdown = false;
  serviceData; // 保存页面数据
  filterValue = '';

  ngOnInit() {
    // 获取列表配置
    this.getConfig();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.cd.markForCheck();
    this.http.get('/web/process/process-config').subscribe(result => {
      this.loading = false;
      this.columns = result['data']['columns'];
      this.childrenColumns = result['data']['columnsChindren'];
      this.queryFields = result['data']['search_form'];
      for (let i = 0; i < this.queryFields.length; i++) {
        if (this.queryFields[i]['key'] === 'task_step') {
          this.status = this.queryFields[i]['templateOptions']['options'];
          break;
        }
      }
      this.statusLength = this.status['length'];
      for (let i = 0; i < this.status.length; i++) {
        this.listConfig[i] = {
          task_step: this.status[i]['value'],
          process_name: this.status[i]['label'],
          title: this.status[i]['label'],
          thing_count: 0,
          children: [],
          expand: true,
          tbloading: true
        };
      }
      this.list = JSON.parse(JSON.stringify(this.listConfig));
      this.statusNum = 0;
      this.childrenColumns.forEach(item => {
        item.show = true;
      });
      this.getDropdown();
      const task_steps = this.status.map(item => item.value);
      this.getList(task_steps);
      this.cd.markForCheck();
    });
  }

  total = 0

  // 获取数据列表
  getList(task_steps?) {
    const params = task_steps.map(item => {
      return {
        params: {
          ...this.searchFormData,
          task_step: item
        }
      };
    });
    this.searchLoading = true;
    this.searchFormIsDisabled = true;
    this.cd.markForCheck();

    from(params).pipe(
      mergeMap(item => this.http.get('/web/process/process-list', item))
    ).subscribe(result => {
      if (result['code'] === 0) {
        this.list.forEach((item) => {
          if (item['process_name'] === result['data']['process_name']['title']) {
            item['children'] = result['data']['children'];
            item['thing_count'] = result['data']['thing_count'];
            item['task_step'] = result['data']['task_step'];
            item['title'] = item['process_name'] + '(' + result['data']['thing_count'] + ')';
            item['thing_count'] = result['data']['thing_count'];
            item['tbloading'] = false;
          }
        });
      }

      this.total = this.list.map(item => item.thing_count).reduce((total, num ) =>  Number(num) + Number(total));
      this.searchLoading = false;
      this.cd.markForCheck();
    });
    window.setTimeout(() => {
      this.searchFormIsDisabled = false;
    }, 2000);
  }

  getClickEvent(event, value) {
    event.stopPropagation();
    this.modalService.open('thing', value);
    this.cd.markForCheck();
  }
  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.searchFormData = paramsFilter(this.searchFormData);
      this.statusNum = 0;
      if (this.searchFormData['task_step']) {
        this.status.forEach(item => {
          if (this.searchFormData['task_step'] === item['value']) {
            this.list = [{
              task_step: item['value'],
              process_name: item['label'],
              thing_count: 0,
              children: [],
              expand: false,
              tbloading: true
            }];
            this.statusLength = this.list.length;
          }
        });
      } else {
        this.list = JSON.parse(JSON.stringify(this.listConfig));
        this.statusLength = this.list.length;
      }

      let task_steps = this.status.map(item => item.value);
      if (this.searchFormData['task_step']) {
        task_steps = this.status.filter(item => item['value'] === this.searchFormData['task_step']).map(item => item.value);
      }
      this.getList(task_steps);
      this.cd.markForCheck();
    }
  }

  // 导出订单
  exportOrder() {
    this.modalService.open('order-export', {});
    this.cd.markForCheck();
  }

  // 当前处理人分割成数组
  getUsersList(str: string) {
    const users = str.split(';').map(user => {
      return user.split('(');
    });
    return users;
  }

  // url处理
  getUrl(url) {
    if (isNaN(url)) {
      url = 'WXWork://message?username=' + url;
    } else {
      url = `http://wpa.qq.com/msgrd?v=3&uin=${url}&site=qq&menu=yes`;
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  dropdownChange(bol, type) {
    if (bol === false) {
      this.closeDropdown(type);
    }
  }
  // 设置已选择缓存
  closeDropdown(type) {
    if (type === 'search') {
      let searchList = {};
      if (localStorage.getItem('searchDropdown')) {
        searchList = JSON.parse(localStorage.getItem('searchDropdown'));
        searchList[this.router.url] = [];
      } else {
        searchList = {
          [this.router.url]: []
        };
      }
      this.isSearchDropdown = false;
      this.queryFields.forEach(item => {
        searchList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('searchDropdown', JSON.stringify(searchList));
    } else if (type === 'column') {
      this.isColumnDropdown = false;
      let columnList = {};
      if (localStorage.getItem('columnDropdown')) {
        columnList = JSON.parse(localStorage.getItem('searchDropdown'));
        columnList[this.router.url] = [];
      } else {
        columnList = {
          [this.router.url]: []
        };
      }
      this.childrenColumns.forEach(item => {
        columnList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('columnDropdown', JSON.stringify(columnList));
    }
    this.cd.markForCheck();
  }
  // 获取缓存
  getDropdown() {
    const url = this.router.url;
    if (localStorage.getItem('searchDropdown')) {
      const searchList = JSON.parse(localStorage.getItem('searchDropdown'));
      if (searchList[url]) {
        this.queryFields.forEach(item => {
          searchList[url].forEach(search => {
            if (item.key === search.key) {
              item.show = search.show;
            }
          });
        });
      }
    }
    if (localStorage.getItem('columnDropdown')) {
      const columnList = JSON.parse(localStorage.getItem('columnDropdown'));
      if (columnList[url]) {
        this.childrenColumns.forEach(item => {
          columnList[url].forEach(column => {
            if (item.key === column.key) {
              item.show = column.show;
            }
          });
        });
      }
    }
    this.cd.markForCheck();
  }
  // 页面过滤
  searchData() {

    if (this.filterValue) {
      this.filterValue = this.filterValue.toString().trim().toUpperCase();
    } else {
      this.message.error('请输入查询的值');
      return;
    }

    if (this.statusNum < this.statusLength) {
      return;
    }
    if (!this.serviceData) {
      this.serviceData = JSON.parse(JSON.stringify(this.list));
    }
    if (!this.filterValue) {
      this.list = this.serviceData;
      return;
    }
    this.list = JSON.parse(JSON.stringify(this.serviceData)).filter(item => {
      item.children = item.children.filter(child => {
        for (let i = 0; i < this.childrenColumns.length; i++) {
          if (this.childrenColumns[i].show
                && child[this.childrenColumns[i].key]
                && child[this.childrenColumns[i].key].toString().indexOf(this.filterValue) !== -1) {
            return child;
          }
        }
      });
      item.thing_count = item.children.length;
      item.title = item.process_name + '(' + item.thing_count + ')';
      return item.children.length > 0;
    });
    this.cd.markForCheck();
  }

  trackByIndex(_: number, data): number {
    return data.index;
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}

