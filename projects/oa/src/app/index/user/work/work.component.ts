import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { FormGroup } from '@angular/forms';
import { debounceTime, filter, map, takeUntil,  } from 'rxjs/operators';
import { ModalService } from 'src/app/services/modal.service';
import { combineLatest, Subject } from 'rxjs';

@Component({
  templateUrl: './work.component.html',
})

export class WorkComponent implements OnInit {
  @ViewChild(SaveModalComponent)
  private saveModal: SaveModalComponent;
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,

  ) {}
// Model 参数配置
  isModelVisible = false;
  title = 'title';
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

  onDestroy$ = new Subject<void>();

  isVisible: Boolean = false;
  model: any = {};
  form = new FormGroup({});
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
      project_options: []
    },
  };

  fields: FormlyFieldConfig[] = [
    {
      key: 'new_people',
      type: 'nz-select',
      className: 'ant-col-14',
      templateOptions: {
        nzLayout: 'fixedwidth',
        label: '被交接人',
        autoSearch: false,
        nzRequired: true,
        nzValidateStatus: true,
        extra: '(如没有找到相关用户, 请到用户权限管理-内部用户管理页面进行添加)',
        extraClassName: 'red',
        nzServerSearch: true,
        callback: (name: string) => this.http.get('web/user/search-names', {
            params: {enName: name}
          }).pipe(takeUntil(this.onDestroy$)).pipe(map((res: any) => {
            return res.data;
          })),
        nzShowSearch: true,
        nzMode: 'default',
        options: [],
      },
    },
    {
      key: 'old_people',
      type: 'nz-select',
      className: 'ant-col-14',
      templateOptions: {
        nzLayout: 'fixedwidth',
        label: '交接人',
        autoSearch: false,

        nzRequired: true,
        nzServerSearch: true,
        callback: (name: string) => this.http.get('web/user/search-names', {
            params: {enName: name}
          }).pipe(takeUntil(this.onDestroy$)).pipe(map((res: any) => {
            console.log(res)
            return res.data;
          })),
        nzShowSearch: true,
        nzMode: 'default',
        options: [],
      },
    },
    {
      key: 'project_ids',
      type: 'field-name-checkbox',
      className: 'ant-col-24',
      wrappers: ['field-wrapper'],
      templateOptions: {
        nzRequired: true,
        nzLayout: 'fixedwidth',
        label: '交接项目',
        options: [],
        height: '500px',
        nzSpan: 24
      },
      expressionProperties: {
        'templateOptions.options': 'formState.project_options'
      },
      lifecycle: {
        onInit: (form, field, model, options) => {
          // this.fields
          options.formState.project_options = []

          combineLatest([
            form.root.get('old_people').valueChanges,
            form.root.get('new_people').valueChanges,
          ]).pipe(takeUntil(this.onDestroy$)).subscribe(res => {
              const [old_people, new_people] = res


              if (old_people && new_people) {
                const messageId = this.message.loading('正在获取交接人的项目信息', { nzDuration: 0 }).messageId;
                this.http.post(' web/user/get-projects', { old_people: old_people, new_people: new_people }).subscribe(result => {
                  this.message.remove(messageId);

                  let data = []
                  if (result['data'] && result['data'] instanceof Array) {
                    data = result['data'].map(item => {
                      return {
                        ...item,
                        key: item.value,
                        checked: true,
                      }
                    })
                  }

                  // 设置默认值
                  field.formControl.setValue(data.map(item => item.value).join(','))

                  if (result['code'] === 0) {
                    const list = [{
                      "label": "全部",
                      checked: true,
                      "children": data
                      }
                    ];
                    options.formState.project_options = data && data.length ? [...list] : []
                    console.log(options)
                  } else {
                    this.message.error(result['msg']);
                  }
                }, (err) => {
                  this.message.remove(messageId);
                  this.message.error('网络异常，请稍后再试');
                });
              }

          })
        }
      }
    }
  ];

  introduce = '';
  allRequired = true;
  baseUrl = '';


  ngOnInit() {
    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.getList();
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/user/work-config', { params: {'user_type': '1'}}).subscribe(result => {
      if (result['code'] === 0) {
        this.loading          = false;
        this.columns          = result['columns'];
        // this.form             = result['form'];
        this.queryFields      = result['search_form'];
        this.onDestroy$ = new Subject<void>();
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
    this.http.get('web/user/work', { params: {
      user_type: '1',
      page_index: this.pagination.page_index.toString(),
      page_size: this.pagination.page_size.toString(),
      ...this.searchFormData
    }}).subscribe(result => {
      if (result['code'] === 0) {
        this.listLoading            = false;
        this.list                   = result['list'] || [];
        if (result['pager']) {
          this.pagination.total_count = result['pager']['itemCount'];
          this.pagination.page_index  = result['pager']['page'];
          this.pagination.page_size   = result['pager']['pageSize'];
        }
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
      this.openModal(event.item);
    } else if (event.key === 'del') {
      this.submitDel(event.item);
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

  // 编辑框
  submitDel(item): void {
    this.http.post('web/user/user-del', { id: item['id'] }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
    });
  }

  // 编辑 or 新建 弹窗
  openModal(item = {}) {
    this.saveModal.openModal(this.form, item, 'user-oa');
  }

  // 编辑框
  submitSaveForm(value): void {
    if (value['code'] === 0) {
      this.message.isAllLoading = true;
      this.http.post('web/user/work-save', { user_type: 1, ...value['value']  }).subscribe(result => {
        this.message.isAllLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.saveModal.cancelModal();
        this.getList();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
      });
    }
  }

  isWorkVisible = false

  workModalCancel () {
    this.isWorkVisible = false;
    this.isLoading = false;
  }

  isLoading = false;

  workModalOk () {

    if (!(this.model && this.model.old_people)) {
      this.message.error('请选择交接人');
      return
    }

    if (!(this.model && this.model.new_people)) {
      this.message.error('请选择被交接人');
      return
    }

    if (!(this.model && this.model.project_ids)) {
      this.message.error('请选择交接项目');
      return
    }

    const messageId = this.message.loading('数据正在提交中...', { nzDuration: 0 }).messageId;

    this.isLoading = true
    this.http.post('web/user/work-save-v1', this.model).subscribe(result => {
      this.message.remove(messageId);
      this.isLoading = false;

      if (result['code'] === 0) {

        // this.form.reset();
        this.isWorkVisible = false;
        this.model = {};
        this.options.formState.project_options = [];
        this.message.success(result['msg'] || '交接成功!')
        this.workModalCancel();

        this.onDestroy$.next();
        this.onDestroy$.complete();
      } else  {
        this.message.error(result['msg']);
      }
    }, err => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.message.remove(messageId);
      this.isLoading = false;
    });
  }

  showWorkModal () {
    this.isWorkVisible = true;
  }

  ngOnDestroy () {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
