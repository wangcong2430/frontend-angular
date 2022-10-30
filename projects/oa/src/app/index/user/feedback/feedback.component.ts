import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { Field, FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  
import { ModalService } from '../../../services/modal.service';
import { DownloadService } from '../../../services/download.service';

@Component({
  templateUrl: './feedback.component.html',
})

export class FeedbackComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    private download: DownloadService
  ) {}

  // Model 参数配置
  isModelVisible = false;
  isOkLoading = false;

  isOpen = false;
  formData;
  // loading
  loading = false;
  listLoading = false;
  
  // 配置项

  columns = [];
  childrenColumns = [];
  disabledButton = true;
  
  // 筛选
  search
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

  // modal
  isVisible = false;
  model: any = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };
  formFields: FormlyFieldConfig[];
  formGroup = new FormGroup({});
  form = new FormGroup({});
  ngOnInit() {
    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.getList();
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/helpcenter/feedback/config').subscribe(result => {
      if (result['code'] === 0) {
        this.loading          = false;
        this.columns          = result['data']['columns'];
        this.formFields       = result['data']['form'];
        this.queryFields      = result['data']['queryFields'];
      }
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    this.searchFormData = paramsFilter(this.searchFormData);
    this.http.get('web/helpcenter/feedback/list', { params: {
      page:  this.pagination.page_index,
      pageSize: this.pagination.page_size,
      ...this.searchFormData
    }}).subscribe(result => {
      if (result['code'] === 0) {
        this.listLoading            = false;
        this.list                   = result['data']['list'];
        this.pagination.total_count = result['data']['pager']['totalCount'];
        this.pagination.page_index  = result['data']['pager']['page'];
        this.pagination.page_size   = result['data']['pager']['pageSize'];
      }
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
    } else if (event.key === 'del') {
    }
  }

  // 筛选
  submitSearchForm($event): void {
    if ($event.code === 0) {
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  searchChange($event) {
    this.searchFormData = $event;
  }

  // 意见导出
  export(): void {
    const search = paramsFilter(this.searchFormData);
    this.download.getExportFile('web/helpcenter/feedback/export', search);
  }

  // 编辑框
  delFeedback(id): void {
    this.http.post('web/feedback/del', { id: id}).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.success(result['msg']);
        this.getList();
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      console.log(err)
      this.message.error('网络异常，请稍后再试');
    });
  }

  // 添加意见反馈
  addFeedback(model): void {
    this.http.post('web/helpcenter/feedback/add', model).subscribe(result => {
      if (result['code'] === 0) {
        this.message.success(result['msg']);
        this.getList();
        this.isVisible = false;
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      console.log(err)
      this.message.error('网络异常，请稍后再试');
    });
  }

  // 添加意见反馈
  editFeedback(model): void {
    this.http.post('web/feedback/edit', model).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.success(result['msg']);
        this.getList();
        this.isVisible = false;
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      console.log(err)
      this.message.error('网络异常，请稍后再试');
    });
  }






  openModal () { 
    this.modalService.open('form', {
      url: 'web/helpcenter/feedback/add',
      type: '1000'
    })
  }

  handleOk () {
    this.addFeedback({
      score: this.model.score,
      content: this.model.content,
      type: this.model.type
    })
  }

  handleCancel () {
    this.isVisible = false;
  }

  modelChange () {
  }
}
