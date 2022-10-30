import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { AcceptanceRateComponent } from '../../../containers/modal/acceptance-rate/acceptance-rate.component';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

@Component({
  templateUrl: './demand-audit-acceptance.component.html',
})

export class DemandAuditAcceptanceComponent implements OnInit {
  @ViewChild(AcceptanceRateComponent)
  loading = true;
  listLoading = false;
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
  expands = {}; // 展开项
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  pass_degree = {};
  msgHint = {
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: ''
  };
  // 驳回原因
  rejectVisible = false;
  rejectReason = '';

  // 评分相关变量
  acceptanceScore = [];
  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private modalService: ModalService,
    private message: MessageService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
    this.getList();
  }

  selectPass ($event) {
    this.pass_degree[$event.key] = $event.item;
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance/demand-audit-acceptance-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.acceptanceScore = result['acceptanceScore'];
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
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
       group_by: '1',
       ...this.searchFormData
    };
    this.http.get('web/acceptance/demand-audit-acceptance-list', {
      params: params
    }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
      if (this.expands && result['data']['list']) {
        result['data']['list'] = result['data']['list'].map(item => {
          if (this.expands[item.id]) {
            item['expand'] = this.expands[item.id];
          }
          return item;
        });
      }
      this.list                   = result['data']['list'];
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
      this.modalService.open('thing', event.item);

    }
    if (event.key === 'operation') {
      window.open(event.item.operation_id);
    }
  }

  acceptanceSubmit(optionType, hint = true) {
    let thing_id;
    thing_id = [];
    this.list.forEach((story, storyIndex) => {
      if (story.expand != undefined) {
        this.expands[story.id] = story.expand;
      }
      if (story.children) {
        story['children'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    if (thing_id.length == 0) {
      this.message.error('请选择物件');
      return false;
    }
    if (hint) {
      this.msgHint.msg = '';
      this.msgHint.flag = optionType;
      if (optionType === 'pass') {
        this.msgHint.isShow = true;
        this.msgHint.msg = `您一共选择了 ${thing_id.length} 个物件。
       ----------------------------------------------------------------------------------------- 确认？`;
      } else {
        this.rejectReason = '';
        this.rejectVisible = true;
        this.msgHint.msg = `您一共选择了 ${thing_id.length} 个物件。
       ----------------------------------------------------------------------------------------- 确认要【驳回】吗？`;
      }
      return;
    } else {
      this.msgHint.isShow = false;
      this.msgHint.msg = '';
    }

    this.msgHint.isSubmitLoading = true;
    if (optionType === 'pass') {
      this.message.isAllLoading = true;
      this.http.post('/web/acceptance/demand-audit-acceptance-' + optionType, {
        thing_id: thing_id
      }).subscribe(result => {
        this.msgHint.isSubmitLoading = false;
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
        this.msgHint.isSubmitLoading = false;
        this.message.isAllLoading = false;
      });
    } else {
      this.message.isAllLoading = true;
      this.http.post('/web/acceptance/demand-audit-acceptance-' + optionType, {
        thing_id: thing_id,
        remark: this.rejectReason
      }).subscribe(result => {
        this.msgHint.isSubmitLoading = false;
        this.message.isAllLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.rejectVisible = false;
        this.getList();
        this.menuService.getBacklog();
      }, () => {
        this.message.error('网络异常，请稍后再试');
        this.msgHint.isSubmitLoading = false;
        this.message.isAllLoading = false;
        this.rejectVisible = false;
      });
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

  delayNotice() {
    let thing_id;
    thing_id = [];
    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        this.expands[items.id] = items.expand;
        items.children.forEach(thing => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 11100,
      thing_id: thing_id
    });
  }
}
