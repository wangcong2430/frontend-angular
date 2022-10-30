import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { DownloadService } from '../../../services/download.service';

@Component({
  templateUrl: './statistics.component.html',
  styles: [
    `
    :host ::ng-deep .ant-card-body{
      padding: 12px;
    }

    :host ::ng-deep .ant-table-thead > tr > th {
      background-color:#E8EFFB;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 14px;
      color: rgba(0,0,0,0.90);
      line-height: 22px;
    }


    :host ::ng-deep  .ant-table-thead > tr > th.ant-table-column-has-actions.ant-table-column-has-sorters:hover {
      background-color: #0052D9;
      color: white;
    }

    :host ::ng-deep .ant-table-thead > tr > th .ant-table-column-sorter .ant-table-column-sorter-inner-full {
      color: white;
    }

    :host ::ng-deep .ant-table-thead > tr > th .ant-table-column-sorter .ant-table-column-sorter-inner .ant-table-column-sorter-up.on,
    :host ::ng-deep .ant-table-thead > tr > th .ant-table-column-sorter .ant-table-column-sorter-inner .ant-table-column-sorter-down.on {
      color: #ccc;
    }

    :host ::ng-deep .ant-table-thead > tr > th, .ant-table-tbody > tr > td {
      padding: 10px;
    }

    `
  ]
})

export class StatisticsComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private _downloadService: DownloadService,
    private route: ActivatedRoute,
  ) {

    this.route.url.subscribe(urls => {
      if (urls[0].path === 'used-statistics') {
        this.is_used = 1;
      }
    });
  }
  // loading
  loading = false;
  listLoading = false;
  is_used = null;
  sortName: string | null = null;
  sortValue: string | null = null;

  can = false;
  is_disabled = false;
  list;

  isVisible: Boolean = false;
  searchModel: any = {
    ym: null
  };
  searchForm = new FormGroup({});
  searchOptions: FormlyFormOptions = {};
  searchFields: FormlyFieldConfig[] = []

  config;

  totalitem;

  ngOnInit() {
    this.loading = true;
    this.http.get('web/statistics/config', {
      params: {
        is_used: this.is_used
      }
    }
    ).subscribe(result => {
      this.searchFields = result['search_form'];
      setTimeout(() => {
        this.loading = false;
      }, 100);
      result['search_form'][0]['fieldGroup'].forEach(item => {
        if (item['defaultValue'] && item['defaultValue'] != '') {
          this.searchModel[item['key']] = item['defaultValue'];
        }
      });
      this.searchModel.ym = this.getMonths().join(',');
      this.search();
    });
  }

  search(): void {
    this.getConfig();
  }

  // 获取页面配置
  getConfig() {
    this.listLoading = true;
    this.is_disabled = true;
    const loading = this.message.loading('加载数据中...', { nzDuration: 0 }).messageId;
    if (this.is_used) {
      this.searchModel = { ...this.searchModel, select_type: 70, budget_type: 1 };
    }
    this.http.get('web/statistics/list', {
      params: this.searchModel
    }).subscribe(result => {
      window.setTimeout(() => {
        this.is_disabled = false;
      }, 2000);
      this.listLoading = false;
      this.message.remove(loading);
      if (result['code'] == 0) {
        const keys = result['config'].filter(item => item.calculate).map(item => item.key);

        this.list = result['data'].map(item => {
          if (item && item.children && item.children.length > 0) {
            item.children = item.children.map(res => {
              return { ...res, total: (keys.map(key => Number(res[key])).reduce((n, t) => Number(n) + Number(t))).toFixed(2) }
            });

            keys.map(key => {
              item[key] = item.children.map(res => Number(res[key])).reduce((n, t) => Number(n) + Number(t)).toFixed(2)
            });
          }

          return { ...item, total: (keys.map(key => Number(item[key])).reduce((n, t) => Number(n) + Number(t))).toFixed(2) }
        });
        this.config = result['config'];

        this.totalitem = {
          group_name: '总计'
        };
        keys.map(key => {
          this.totalitem[key] = +(this.list.map(res => Number(res[key])).reduce((n, t) => Number(n) + Number(t))).toFixed(2);
        });
        this.totalitem['total'] = (keys.map(key => Number(this.totalitem[key])).reduce((n, t) => Number(n) + Number(t))).toFixed(2);
      } else {
        this.message.error(result['msg']);
      }
    }, () => {
      this.loading = false;
      this.listLoading = false;
      this.message.remove(loading);
      this.message.error('服务器异常, 请联系管理员');
    });
  }

  export() {
    this.searchModel.download = true;
    const now = formatDate(new Date(), 'yyyyMMddhhmmss', 'zh-ch');
    const fileName = `数据统计____导出时间${now}.csv`;
    this._downloadService.loading({
      data: {
        msg: '下载中',
        name: fileName
      }
    });

    const params = Object.assign({}, this.searchModel, { is_export: true });
    this.http.get('/web/statistics/list', { params: params }).subscribe(result => {
      if (result['code'] == 0) {
        this.message.success('下载成功');
        this._downloadService.loaded({
          data: {
            msg: '下载成功',
            name: fileName,
            link: result['data']
          }
        });
      } else {
        this.message.error(result['msg']);
        this._downloadService.error({
          data: {
            msg: '下载失败:' + result['msg'],
            name: fileName,
          }
        });
      }
    });
  }

  sort(sort: { key: string; value: string }, list): void {
    list.sort((a, b) => {
      return sort.value === 'ascend'
        ? Number(a[sort.key!]) > Number(b[sort.key!])
          ? 1
          : -1
        : Number(b[sort.key!]) > Number(a[sort.key!])
          ? 1
          : -1;
    });
  }

  getMonths() {
    const dataArr = [];
    const data = new Date();
    data.setMonth(data.getMonth() + 1, 1); // 获取到当前月份,设置月份
    for (let i = 0; i < 6; i++) {
      data.setMonth(data.getMonth() - 1); // 每次循环一次 月份值减1
      const m = data.getMonth() + 1;
      const month = m < 10 ? '0' + m : m;
      dataArr.push(data.getFullYear() + '' + month);
    }
    return dataArr;
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
