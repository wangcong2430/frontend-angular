import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { takeUntil} from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import {DownloadService} from "../../../services/download.service";

@Component({
  templateUrl: './list.component.html',
})

export class ListComponent implements OnInit, OnDestroy {
  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    private message: MessageService,
    private cd: ChangeDetectorRef,
    private _downloadService: DownloadService,
  ) {
    this.modalService.complete$.pipe(takeUntil(this.onDestroy$)).subscribe(res => {
      if ((res['key'] === 'create-supplier' || res['key'] === 'supplier-info') && res['data']['code'] === 0) {
        this.getList();
      }
    });
  }

  onDestroy$ = new Subject<void>();

  formData;

  // loading
  loading = false;
  listLoading = false;

  // 配置项
  columns = [];
  disabledButton = true;

  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  queryFields = [];
  exportSupplier = false;

  // 数据列表
  list = [];

  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
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
    this.http.get('web/supplier/list-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.isSave           = result['isSave'] || false;
      this.queryFields      = result['query'];
      this.exportSupplier   = result['exportSupplier'] || false;
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
    this.http.get('web/supplier/list', { params: params }).subscribe(result => {
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
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'info') {
      window.open('/supplier/detail?id=' +  event.item['id']);
    } else if (event.key === 'update') {
      this.modalService.open('create-supplier', {id: event.item['id']});
    } else if (event.key === 'ability') {
      window.open('/supplier/ability?code=' +  event.item['code']);
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
  openModal(id = null) {
    this.modalService.open('create-supplier', {id: id});
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  //导出供应商信息

  export() {
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    const fileName = '供应商信息导出.csv';
    params = {
      ...this.searchFormData
    };
    const messageId = this.message.loading('文件正在下载中...', { nzDuration: 0 }).messageId;
    this.http.post('/web/supplier/export', {params: params}).subscribe(result => {
      this.message.remove(messageId);
      if (result['code'] == 0) {
        this.message.success('下载成功');
        this._downloadService.loaded({
          data: {
            msg: '下载成功',
            name: fileName,
            link: result['data']['url']
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
    }, error => {
      this.message.remove(messageId);
      this.message.success('没有符合条件的数据');
      this.cd.markForCheck();
    });
  }

  searchChange ($event) {
    this.searchFormData = $event;
  }

  download (blob, name) {
    const eleLink = document.createElement('a');
    eleLink.download = name;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  }
}
