import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../../../services/message.service';
import { ThingDetailModalComponent } from '../../../../../containers/modal/thing-detail/thing-detail.component';
import { MenuService } from '../../../../../services/menu.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  templateUrl: './confirm.component.html',
})

export class ConfirmComponent implements OnInit {
  @ViewChild(ThingDetailModalComponent)
  private thingDetailModal: ThingDetailModalComponent;
  // loading
  loading = true;
  listLoading = false;
  submitLoading = false;
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
  msgHint = {
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: ''
  };
  // 驳回原因
  rejectVisible = false;
  rejectReason = '';

  // 提示语
  crumbTitle = null;
  noItemSelect = null;

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private menuService: MenuService,
    private translate: TranslateService,
    private language: LanguageService
  ) {
    this.translate.use(this.language.language);
    this.translate.get('TEST_TIP').subscribe(res => {
      this.crumbTitle = '(' + res + ')';
    });
    this.translate.use(this.language.language);
    this.translate.get('NO_ITEM_SELECTED').subscribe(result => {
      this.noItemSelect = result;
    });
  }

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/assess/confirm-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      // 获取列表
      this.getList();
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }

    this.http.get('web/assess/confirm-list', { params: {
      page_index: this.pagination.page_index.toString(),
      page_size: this.pagination.page_size.toString()
    } }).subscribe(result => {
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

  // 按钮事件
  confirmSubmit(optionType, hint = true) {
    let item, params;
    item = [];

    this.list.forEach(data => {
      if (data.children) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            item.push(data2.id);
          }
        });
      }
    });

    if (item.length === 0) {
      // this.message.error('未选择需要执行的物件');
      this.message.error(this.noItemSelect)
      return false;
    }
    if (hint) {
      this.msgHint.msg = '';
      this.msgHint.flag = optionType;
      if (optionType === 'accept') {
        this.msgHint.isShow = true;
        this.msgHint.msg = `您一共选择了 ${item.length} 个物件。
       ----------------------------------------------------------------------------------------- 确认验收价格？`;
      } else {
        this.rejectReason = '';
        this.rejectVisible = true;
        this.msgHint.msg = `您一共选择了 ${item.length} 个物件。
       ----------------------------------------------------------------------------------------- 返回采购经理？`;
      }
      return;
    } else {
      this.msgHint.isShow = false;
      this.msgHint.msg = '';
    }
    params = {
      option_type: optionType,
      ids: item,
      remark: this.rejectReason
    };
    this.submitLoading = true;
    this.http.post('web/assess/submit', params).subscribe(result => {
      this.submitLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
      this.rejectVisible = false;
      this.msgHint.isShow = false;
    });
  }

  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.thingDetailModal.openModal(event.item);
    }
  }
}
