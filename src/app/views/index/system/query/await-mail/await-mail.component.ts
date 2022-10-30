import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { ThingDetailModalComponent } from '../../../../../containers/modal/thing-detail/thing-detail.component';
import { MessageService } from '../../../../../services/message.service';
import { LanguageService } from '../../../../../services/language.service';
import { TranslateService } from '@ngx-translate/core';

import { FormsModule } from '@angular/forms';

import { formatDate } from '@angular/common';
import { UploadXHRArgs, NzModalService} from 'ng-zorro-antd';

import { MenuService } from '../../../../../services/menu.service';
import { UploadService } from '../../../../../services/upload.service';
import { ModalService } from '../../../../../services/modal.service';
import { NzMessageService } from 'ng-zorro-antd';
import { CosService } from '../../../../../services/cos.service';

@Component({
  templateUrl: './await-mail.component.html',
})

export class AwaitMailComponent implements OnInit {
  @ViewChild(ThingDetailModalComponent)
  private thingDetailModal: ThingDetailModalComponent;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private message: MessageService,
    private language: LanguageService,
    private translate: TranslateService,
    private menuService: MenuService,
  ) {
    this.translate.use(this.language.language);
  }

  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;

  msgHint = {
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: ''
  };

  isOpen = false;
  formData;
  // loading
  loading = false;
  listLoading = false;
  isSubmitLoading = false;
  submitLoading = false;
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
  // 提示语
  NO_ITEM_SELECTED;
  reason = '';
  isVisible = false;
  // 驳回原因
  rejectVisible = false;
  rejectReason = '';

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }

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

  // 提示语
  crumbTitle = null;
  noItemSelect = null;

  ngOnInit() {
    this.getConfig();
    this.getList();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/await-mail/await-mail-config').subscribe(result => {
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
    this.http.get('web/await-mail/await-mail-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.list                   = result['data']['list'];
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
      this.disabledButton = true;
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
      const url = '/web/await-mail/download/' + event.item.id;
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

  noFullOnlineProcess = {
    isVisible: false,
    list: []
  }

  noFullOnlineCancel () {
    this.noFullOnlineProcess.isVisible = false
  }

  noFullOnlinehandleOk () {

    this.http.post('web/await-mail/save-invoice-status', {
      await_email_list: this.noFullOnlineProcess.list.map(item => {
        if(item.id){
          return {
            id: item.id,
            mail_address: item.mail_address,
          }
        }
      })
    }).subscribe(res => {
      if (res['code'] == 0) {
        this.message.success(res['msg'])
        this.noFullOnlineProcess.isVisible = false
        this.getList();
        this.menuService.getBacklog();
      } else {
        this.message.error(res['msg'])
      }
    }, err => {
      this.message.error(err.msg)
    })
  }

  // 按钮事件
  confirmSubmit(optionType, hint = true) {
    let item, params;
    item = [];

    this.list.forEach(data => {
      if (data.checked) {
        item.push(data.id);
      }
    });

    if (item.length === 0) {
      // this.message.error('未选择需要执行的物件');
      this.message.error(this.noItemSelect)
      return false;
    }

    this.noFullOnlineProcess.list =   this.list.filter(item => item.checked || item.indeterminate).map(item => {
      const things = item.children.filter(i => i.is_reduce_process == '1')
      return {
        acceptance_code: item.acceptance_code,
        thing_sum: item.thing_sum,
        id: item.id
      }
    }).filter(item => item)
    if (this.noFullOnlineProcess.list.length > 0) {
      this.noFullOnlineProcess.isVisible = true
    }

    // if (hint) {
    //   this.msgHint.msg = '';
    //   this.msgHint.flag = optionType;
    //   if (optionType === 'accept') {
    //     this.msgHint.isShow = true;
    //     this.msgHint.msg = `是否已对当前选中的单据完成发票邮寄？`;
    //   } else {
    //     this.rejectReason = '';
    //     this.rejectVisible = true;
    //     this.msgHint.msg = `是否已对当前选中的单据完成发票邮寄？`;
    //   }
    //   return;
    // } else {
    //   this.msgHint.isShow = false;
    //   this.msgHint.msg = '';
    // }
    // params = {
    //   option_type: optionType,
    //   ids: item
    // };
    // this.submitLoading = true;
    // this.http.post('web/await-mail/save-invoice-status', params).subscribe(result => {
    //   this.submitLoading = false;
    //   if (result['code'] !== 0) {
    //     this.message.error(result['msg']);
    //     return false;
    //   }
    //   this.message.success(result['msg']);
    //   this.getList();
    //   this.menuService.getBacklog();
    //   this.rejectVisible = false;
    //   this.msgHint.isShow = false;
    // });
  }

}
