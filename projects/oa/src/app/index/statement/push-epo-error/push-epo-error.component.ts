import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';


@Component({
  templateUrl: './push-epo-error.component.html',
  styles: [`
    :host ::ng-deep .ant-table-placeholder {
        border-bottom: none;
    }
    ::ng-deep .ant-form-item label{
        margin-bottom: 0;
    }

    ::ng-deep .ant-form-item{
        margin-bottom: 12px;
    }
  `]
})

export class PushEpoErrorComponent implements OnInit, OnDestroy {
  loading = true;
  listLoading = false;
  isOkLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  disabledButton = true;
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  isSubmit = false;

  auth = false;

  onDestroy$ = null;

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modal: ModalService,
    private modalService: NzModalService,
    private msg: NzMessageService
  ) {

  }

  ngOnInit() {
    // 获取页面配置
    this.onDestroy$ = new Subject<void>();
    this.getConfig();
    this.getList();

    this.modal.complete$
      .pipe(takeUntil(this.onDestroy$))
      .pipe(debounceTime(120))
      .pipe(filter(item => item && (item['key'] === 'push-epo' || item['key'] === 'statement-push-epo' )))
      .subscribe(() => {
        this.getList();
        this.menuService.getBacklog();
      });
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/statement/push-statement-error-config').subscribe(result => {
      this.loading = false;
      this.columns = result['columns'];
      this.queryFields      = result['searchForm'];
      this.childrenColumns = result['columnsChildren'];
      this.auth = result['auth'] || false;
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    // this.msg.loading()
    const id = this.msg.loading('正在查询数据中', { nzDuration: 0 }).messageId;
    // this.list = []
    if (pagination) {
      this.pagination = pagination;
    }
    this.http.get('web/statement/push-statement-error-list', {
      params: {
        'page_index':  this.pagination.page_index.toString(),
        'page_size':  this.pagination.page_size.toString(),
        ...this.searchFormData
      }
    }).subscribe(result => {
      this.listLoading = false;
      this.msg.remove(id);
      if (result['code'] == 0) {
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index = result['pager']['page'];
        this.pagination.page_size = result['pager']['pageSize'];
        this.list = result['list'];
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.listLoading = false;
      this.msg.remove(id);
      this.message.error('网络错误，请刷新后重试，多次失败请联系管理员');
    });
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modal.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modal.open('order', event.item);
    } else if (event.key === 'sync_epo_order') {
      this.modal.open('push-epo', event.item);
    } else if (event.key === 'show_manual') {
      // this.modal.open('push-epo', event.item);
      // alert('2233');
      this.modalService.create({
        nzTitle: '提示信息',
        nzContent: '确认提交后，系统将自动推送EPO生成EPO验收单，推送验收成功收到供应商发票后，请到EPO系统基于EPO验收单手动发起付款！',
        nzClosable: false,
        nzOnOk: () => {
          this.http.get('web/statement/re-push-acceptance?id=' + event.item.id).subscribe(result => {
            this.isSubmit = false;
            if (result['code'] !== 0) {
              this.message.error(result['msg']);
              return false;
            }
            this.message.success(result['msg']);
            this.getList();
            this.menuService.getBacklog();
          }, (err) => {
            this.message.error('网络异常，请稍后再试');
            this.isSubmit = false;
            this.message.isAllLoading = false;
          });
        },
        nzOnCancel: () => {

        }
      });
    }

  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 推送epo，生成订单
  approvalSubmit() {
    const statement_id = this.list.filter(item => item.checked).map(items => items.id);
    const url = '/web/statement/again-push-epo';
    this.isSubmit = true;
    this.http.post(url, {statement_id: statement_id}).subscribe(result => {
      this.isSubmit = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.isSubmit = false;
      this.message.isAllLoading = false;
    });
  }

  pushEpo () {
    const thingIds = [];
    this.list.forEach((item, itemIndex) => {
      if (item.checked || item.indeterminate) {
        item.children.forEach((thing, thingIndex) => {
          if (thing.checked) {
            thingIds.push(thing.id);
          }
        });
      }
    });
    this.modal.open('statement-push-epo', { thingIds: thingIds});
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  ngOnDestroy () {
    if (this.onDestroy$) {
      this.onDestroy$.next();
      this.onDestroy$.complete();
    }
  }
}
