import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';

@Component({
  templateUrl: './gm-approve.component.html',
})

export class GmApproveComponent implements OnInit {
  // loading
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
    this.getList();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/statement/approve-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    this.http.get('web/statement/gm-approve-list', {
      params: {
        group_by: '1',
        ...this.pagination
      }
    }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
      this.list                   = result['list'];
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  approvalSubmit(optionType) {
    const thing_id = [];
    this.list.forEach((story) => {
      if (story.checked) {
        story['children'].forEach((thing) => {
          thing_id.push(thing.id);
        });
      }
    });
    this.message.isAllLoading = true;
    this.http.post('/web/statement/gm-approve-submit', {thing_id: thing_id, option_type: optionType, role_type: 'gm'}).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, () => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

}
