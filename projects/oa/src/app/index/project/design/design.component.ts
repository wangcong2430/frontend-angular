import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { map, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd';

import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { ProductBudgetAdjustModalComponent } from '../../../containers/modal/product-budget-adjust/product-budget-adjust.component';
import { ModalService } from '../../../services/modal.service';
import { MessageService } from '../../../services/message.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

@Component({
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.css']
})

export class DesignComponent implements OnInit {
  @ViewChild(SaveModalComponent)
  private saveModalComponent: SaveModalComponent;
  @ViewChild(ProductBudgetAdjustModalComponent)
  private productBudgetAdjustModal: ProductBudgetAdjustModalComponent;
  // loading
  loading = true;
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
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  onDestroy$ = null;

  // 编辑窗
  saveModal = {
    isVisible : false,
    title : '项目编辑',
    isOkLoading : false,
    model: {}
  };

  typeOptions = [];
  isOptions = [];
  orgOptions = [];
  levelOptions = [];
  depatOptions = [];
  isAdd = 0;
  isBMP = false;
  isMsh = false;

  // 是否渲染表单
  isRenderForm: Boolean = false;

  // 定义表单的字段
  form = new FormGroup({});

  options: FormlyFormOptions = {
    formState: {
      isMsh: false,
      awesomeIsForced: false,
      centers: []
    },
  };

  formlyField: FormlyFieldConfig[] = [];

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    private modal: NzModalService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/project/design-configs').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.queryFields     = result['search_form'];
      this.typeOptions     = result['type_options'];
      this.isOptions       = result['is_options'];
      this.orgOptions      = result['org_options'];
      this.depatOptions    = result['dept_options'];
      this.levelOptions    = result['level_options'];
      this.isAdd           = result['isAdd'] || 0;
      /*
      if (!result['isBMP'] || result['isBMP'] === 0) {
        this.isBMP = false;
      } else {
        this.isBMP = true;
      }
      */
      // 获取列表
      this.getList();
      // this.setFormlyField(this.isBMP);
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
      ...this.searchFormData
    };
    this.http.get('web/project/design-list', { params: params }).subscribe(result => {
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

  // 列表点击事件
  clickEvent(event) {
    if (event.key === 'adjustment') {
      this.productBudgetAdjustModal.openModal(event.item);
    } else if (event.key === 'update') {
      this.openModel(event.item);
    } else if (event.key === 'budget') {
      this.modalService.open('product_budget', event.item);
    } else if (event.key === 'copy') {
      this.copy(event.item);
    } else if (event.key === 'pull') {
      this.pullMsh(event.item);
    }
  }
  // 列表失去焦点事件
  blurEvent(event) {
    if (event.key === 'producer_name') {
    }
  }


  setFormlyField(isBMP = false, isMsh = false) {
    this.formlyField = [
      {
        fieldGroupClassName: 'row no-gutters justify-content-between',

        fieldGroup: [
          {

            key: 'category_type',
            type: 'input',
            className: 'ant-col-12 px-3',
            defaultValue: '2',
            templateOptions: {
              label: 'category_type',
            },
            hideExpression: 'true',
            expressionProperties: {
              'templateOptions.disabled': 'true'
            },
          },
          {
            key: 'product_name',
            type: 'nz-select',
            className: 'ant-col-12 px-3',
            templateOptions: {
              nzMode: 'default',
              nzServerSearch: true,
              nzShowSearch: true,
              nzRequired: true,
              nzPlaceHolder: '输入关键字搜索',
              nzValue: 'option',
              label: '产品名称',
              callback: (name: string) => this.http.get('web/pull-coa/name-list', {
                                            params: {
                                              name: name,
                                              category_type: '2'
                                            }
                                          }).pipe(map(res => res['data'])),
              options: [],
            },
            hideExpression: 'model.id',
            expressionProperties: {
              'templateOptions.disabled': (isBMP ? 'true' : 'false')
            },
            lifecycle: {
              onInit: (fieldform, field: FormlyFieldConfig) => {
                if (field.formControl.valueChanges) {
                  field.formControl.valueChanges
                  .pipe(distinctUntilChanged())
                  .pipe(takeUntil(this.onDestroy$)).subscribe(item => {
                    if (fieldform.controls.product_code && item.coa_code) {
                      fieldform.controls.product_code.setValue(item.coa_code);
                    }
                  });
                }
              }
            }
          },
          {
            key: 'product_text',
            type: 'nz-input',
            className: 'ant-col-12 px-3 ',
            templateOptions: {
              nzRequired: true,
              'label': '产品名称'
            },
            hideExpression: '!model.id',
            expressionProperties: {
              'templateOptions.disabled': 'true'
            }
          },
          {
            key: 'parent_project_no',
            type: 'nz-select',
            className: 'ant-col-12 px-3',
            templateOptions: {
              nzMode: 'default',
              nzServerSearch: true,
              nzShowSearch: true,
              nzValue: 'option',
              nzPlaceHolder: '输入关键字搜索',
              label: '母项目',
              callback: (name: string) => this.http.get('web/pull-parent-project/name-list', {
                                            params: {
                                              name: name
                                            }
                                          }).pipe(map(res =>  res['data'])),
              options: [],
            },
            hideExpression: 'model.id',
            expressionProperties: {
              'templateOptions.disabled': 'model.id'
            },
            lifecycle: {
              onInit: (fieldform, field: FormlyFieldConfig) => {
                field.formControl.valueChanges
                    .pipe(distinctUntilChanged())
                    .pipe(takeUntil(this.onDestroy$)).subscribe(item => {
                      if (fieldform.controls.project_group_name && item.label) {
                        fieldform.controls.project_group_name.setValue(item.label);
                      }
                    });
              }
            }
          },

          {
            key: 'product_code',
            type: 'nz-input',
            className: 'ant-col-12 px-3',
            templateOptions: {
              label: '产品编码'
            },
            hideExpression: '!model.product_name',
            expressionProperties: {
              'templateOptions.disabled': 'true'
            }
          },
          {
            key: 'project_group_name',
            type: 'nz-input',
            className: 'ant-col-12 px-3',
            templateOptions: {
              label: '母项目'
            },
            hideExpression: '!model.id',
            expressionProperties: {
              'templateOptions.disabled': 'true'
            }
          },
          /*{
            key: 'costcenter_name',
            type: 'nz-select',
            className: 'ant-col-12 px-3',
            templateOptions: {
              label: '成本中心',
              nzServerSearch: true,
              nzShowSearch: true,
              nzValue: 'option',
              nzRequired: true,
              nzMode: 'multiple',
              callback: (name: string) => this.http.get('web/pull-coa/cost-center-list', {
                params: {name: name}}).pipe(map(res => res['data'])),
              options: [],
            },
            hideExpression: '!model.product_name',
            expressionProperties: {
              'templateOptions.disabled': 'false'
            }
          },*/
          {
            key: 'department_id',
            className: 'ant-col-12 px-3',
            type: 'nz-select',
            templateOptions: {
              'label': '部门名称',
              nzValue: 'value',
              nzShowSearch: true,
              nzRequired: true,
              options: this.depatOptions
            },
            expressionProperties: {
              'templateOptions.disabled': (isMsh ? 'true' : 'false')
            },
          },
          {
            key: 'level',
            type: 'nz-select',
            className: 'ant-col-12 px-3',
            templateOptions: {
              label: '项目星级',
              nzValue: 'value',
              options: this.levelOptions
            }
          },
          {
            key: 'type',
            type: 'nz-select',
            className: 'ant-col-12 px-3',
            templateOptions: {
              label: '项目类型',
              nzValue: 'value',
              options: this.typeOptions
            }
          },
          {
            key: 'service_type',
            type: 'nz-input',
            className: 'ant-col-12 px-3',
            templateOptions: {
              label: '对应业务',
              nzValue: 'value',
              options: this.typeOptions
            }
          },
          {
            key: 'service_url',
            type: 'nz-input',
            className: 'ant-col-12 px-3',
            templateOptions: {
              label: '对应域名',
              nzValue: 'value',
              options: this.typeOptions
            }
          },
          {
            key: 'org_ids',
            className: 'ant-col-12 px-3',
            type: 'nz-select',
            templateOptions: {
              nzMode: 'multiple',
              label: '主体信息',
              nzValue: 'value',
              nzShowSearch: true,
              options: this.orgOptions,
              disabled: false
            },
            expressionProperties: {
              'templateOptions.disabled': (isMsh ? 'true' : 'false')
            },
            lifecycle: {
              onInit: (from, field: FormlyFieldConfig) => {
                if (from.get('product_name') && from.get('product_name').valueChanges) {
                  from.get('product_name').valueChanges
                    .pipe(distinctUntilChanged())
                    .pipe(takeUntil(this.onDestroy$)).subscribe(item => {
                      if (item.org_id) {
                        from.controls.org_id.setValue([item.org_id]);
                      } else {
                        from.controls.org_id.setValue(null);
                      }
                    });
                }
              }
            }
          },
          {
            key: 'product_manager',
            className: 'ant-col-12 px-3',
            type: 'select-oa-user-new',
            templateOptions: {
              label: '产品经理',
              nzServerSearch: true,
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
            },
            expressionProperties: {
              'templateOptions.disabled': (isMsh ? 'true' : 'false')
            },
            lifecycle: {
              onInit: (from, field: FormlyFieldConfig) => {
                field.formControl.valueChanges
                .pipe(distinctUntilChanged())
                .pipe(debounceTime(120))
                .pipe(takeUntil(this.onDestroy$)).subscribe(names => {
                  if (names && names.split(';').length > 3 && from.get('is_restrict_produce_member').value == 1) {
                    //this.message.error('按照项目管理组要求，市场部统管的产品最多只能配置两个产品经理，如需额外添加，请品牌经理负责人确认后联系helenhei');
                    this.message.error('该产品已限制产品经理数量，最多只能添加两位产品经理，如需添加更多请在限制产品数量处选择\'否\'后再进行添加。');
                  }
                });
              }
            }
          },
          {
            key: 'brand_manager',
            className: 'ant-col-12 px-3',
            type: 'select-oa-user-new',
            templateOptions: {
              'label': '品牌经理',
              nzServerSearch: true,
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
            },
            expressionProperties: {
              'templateOptions.disabled': (isMsh ? 'true' : 'false')
            },
          },
          {
            key: 'brand_director',
            className: 'ant-col-12 px-3',
            type: 'select-oa-user-new',
            templateOptions: {
              'label': '品牌经理负责人',
              nzServerSearch: true,
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
            },
            expressionProperties: {
              'templateOptions.disabled': (isMsh ? 'true' : 'false')
            },
          },
          {
            key: 'brand_leader',
            className: 'ant-col-12 px-3',
            type: 'select-oa-user-new',
            templateOptions: {
              label: '品牌组长',
              nzServerSearch: true,
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
            },
            expressionProperties: {
              'templateOptions.disabled': (isMsh ? 'true' : 'false')
            },
          },
          {
            key: 'director',
            className: 'ant-col-12 px-3',
            type: 'select-oa-user-new',
            templateOptions: {
              'label': '验收终审人',
              nzServerSearch: true,
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
              nzRequired: true
            },
            expressionProperties: {
              'templateOptions.disabled': ('model.is_separate_director || formState.isMsh')
            }
          },
          {
            key: 'page_reconstruct',
            className: 'ant-col-12 px-3',
            type: 'select-oa-user-new',
            templateOptions: {
              'label': '页面重构师',
              nzServerSearch: true,
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
            }
          },

          {
            key: 'is_restrict_produce_member',
            type: 'nz-select',
            className: 'ant-col-12 px-3',
            defaultValue: '0',
            templateOptions: {
              label: '限制产品数量',
              nzValue: 'value',
              options: this.isOptions
            },
            expressionProperties: {
              'templateOptions.disabled': (isBMP || isMsh ? 'true' : 'false')
            }
          },
          {
            key: 'dept_id',
            className: 'ant-col-12 px-3',
            type: 'nz-select',
            templateOptions: {
              label: '所属中心',
              nzValue: 'value',
              options: [],
            },
            expressionProperties: {
              'templateOptions.options': 'formState.centers',
              'templateOptions.disabled': (isMsh ? 'true' : 'false')
            }
            // lifecycle: {
            //   onInit: (fieldform, field: FormlyFieldConfig) => {
            //     if (fieldform.get('brand_director') && fieldform.get('brand_director').value ) {
            //       this.http.get('/web/project/get-dept', {
            //         params: {
            //           brand_id: fieldform.get('brand_director').value
            //         }
            //       }).subscribe(res => {
            //         if (res['code'] === 0 && res['data'].length > 0) {
            //           field.templateOptions.options = res['data'];
            //           field.formControl.setValue(res['data'][0].value);
            //         } else {
            //           field.templateOptions.options = [];
            //           field.formControl.setValue(null);
            //         }
            //       });
            //     } else {
            //       field.templateOptions.options = [];
            //     }

            //     if (fieldform.get('brand_director') && fieldform.get('brand_director').valueChanges) {
            //       fieldform.get('brand_director').valueChanges
            //           .pipe(takeUntil(this.onDestroy$), debounceTime(100), distinctUntilChanged())
            //           .subscribe(item => {

            //               if (item) {
            //                 this.http.get('/web/project/get-dept', {params: {brand_id: item}}).subscribe(res => {
            //                   if (res['code'] === 0 && res['data'].length > 0) {
            //                     field.templateOptions.options = res['data']
            //                     field.formControl.setValue(res['data'][0].value);
            //                   }
            //                 });
            //               } else {
            //                 field.formControl.setValue(null);
            //               }
            //       });
            //     }
            //   },
            // }
          },
          {
            key: 'is_not_demand_audit',
            type: 'nz-select',
            className: 'ant-col-12 px-3',
            defaultValue: '0',
            templateOptions: {
              label: '无需求审核',
              nzValue: 'value',
              options: this.isOptions
            },
            expressionProperties: {
              'templateOptions.disabled': (isBMP || isMsh ? 'true' : 'false')
            }
          },
          {
            key: 'resources_manager',
            type: 'select-oa-user-new',
            wrappers: ['field-wrapper'],
            className: 'ant-col-12 px-3',
            templateOptions: {
              nzLayout: 'fixedwidth',
              label: '资源管理员',
              options: [],
              nzValue: 'value',
            },
          },
          {
            key: 'related_reviewer',
            className: 'ant-col-12 px-3',
            type: 'select-oa-user-new',
            templateOptions: {
              label: '相关审核人',
              nzServerSearch: true,
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
            },
            expressionProperties: {
              'templateOptions.disabled': 'true'
            },
          },
        ]
      },
      {
        key: 'categorys',
        type: 'project-content-tab-section',
        className: 'ProjectCategory',
        templateOptions: {
          nzAnimated: false,
          label: '分类',
          nzType: 'line',
          nzShowPagination: false,
          nzTabBarGutter: '0',
          isBMP: isBMP,
          options: [],
        },
        defaultValue: [],
        fieldArray: {
          templateOptions: {
            tabNameKey: 'label'
          },
          fieldGroupClassName: 'ant-row',
          fieldGroup: [
            {
              key: 'value',
              className: 'ant-col-12 px-3',
              template: '<span></span>'
            },
            {
              key: 'checked',
              className: 'ant-col-12 px-3',
              template: '<span></span>'
            },
            {
              key: 'purchasing_manager',
              className: 'ant-col-12 px-3',
              type: 'select-oa-user-new',
              templateOptions: {
                label: '采购经理',
                nzServerSearch: true,
                nzShowSearch: true,
                nzMode: 'multiple',
                options: [],
              },
              expressionProperties: {
                'templateOptions.disabled': (isBMP ? 'true' : 'false')
              }
            },
            {
              key: 'order_approver',
              className: 'ant-col-12 px-3',
              type: 'select-oa-user-new',
              templateOptions: {
                label: '订单审批人',
                nzServerSearch: true,
                nzShowSearch: true,
                nzMode: 'multiple',
                options: [],
              },
              expressionProperties: {
                'templateOptions.disabled': (isBMP ? 'true' : 'false')
              }
            },
            {
              key: 'authorized_purchasing_manager',
              type: 'select-oa-user-new',
              className: 'ant-col-12 px-3',
              templateOptions: {
                label: '授权采购经理',
                nzServerSearch: true,
                nzShowSearch: true,
                nzMode: 'multiple',
                options: [],
              },
              expressionProperties: {
                'templateOptions.disabled': (isBMP ? 'true' : 'false')
              }
            },
            {
              key: 'authorized_order_approver',
              type: 'select-oa-user-new',
              className: 'ant-col-12 px-3',
              templateOptions: {
                label: '授权订单审批人',
                nzServerSearch: true,
                nzShowSearch: true,
                nzMode: 'multiple',
                options: [],
              },
              expressionProperties: {
                'templateOptions.disabled': (isBMP ? 'true' : 'false')
              }
            },
            {
              key: 'focus_peopler',
              type: 'select-oa-user-new',
              className: 'ant-col-12 px-3',
              templateOptions: {
                label: '一般关注人',
                nzServerSearch: true,
                nzShowSearch: true,
                nzMode: 'multiple',
                options: [],
              }
            },
            {
              key: 'core_people',
              className: 'ant-col-12 px-3',
              type: 'select-oa-user-new',
              templateOptions: {
                label: '核心组成员',
                nzServerSearch: true,
                nzShowSearch: true,
                // callback: (name: string) => this.http.get('web/user/search-names', {
                //         params: {enName: name}}).pipe(map((res: any) => { return res.data})),
                nzMode: 'multiple',
                options: [],
              }
            }
          ]
        }
      }
    ];
  }
  // 批量编辑
  openBatchModel(item ?: {}) {
    this.message.isAllLoading = true;
    this.http.get('web/project/design-batch-configs').subscribe(result => {
      this.message.isAllLoading = false;
      this.saveModalComponent.openModal(result['saveForm'], {}, 'design-batch');
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }
  // 编辑框
  submitSaveForm(value): void {
    if (value['code'] === 0) {
      this.message.isAllLoading = true;
      let params;
      params = value['value'];
      if (params['batch_type'] === '3' && (params['user_id'] === '' || params['user_id'] === null)) {
        this.message.error('追加时，成员不能为空');
        return;
      }
      if (params['category_id'] === '') {
        this.message.error('项目大类不能为空');
        return;
      }
      this.http.post('web/project/design-batch-save', { ...params }).subscribe(result => {
        this.message.isAllLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        // this.saveModalComponent.cancelModal();
        this.getList();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
      });
    }
  }
  // 编辑框
  openModel (item ?: {}) {
    this.isRenderForm = false;
    this.onDestroy$ = new Subject<void>();    // 打开弹窗
    if (item && item['id']) {
      // this.isVisible = true
      this.http.get('web/project/info', {
        params: {
          id: item['id']
        },
      }).subscribe(res => {
        this.saveModal.model = res['data'];
        if (!res['isBMP'] || res['isBMP'] === 0) {
          this.isBMP = false;
        } else {
          this.isBMP = true;
        }
        this.isMsh = res['isMsh'] || false;
        this.options.formState.isMsh = this.isMsh;
        this.setFormlyField(this.isBMP, this.isMsh);
        this.saveModal.isVisible = true;
        this.isRenderForm = true;
        this.options.formState.centers = res['centers'];
      });
    } else {
      this.http.get('web/project/init', {
        params: {
          category_type: '2'
        },
      }).subscribe(res => {
        this.saveModal.model = res['data'];
        this.setFormlyField();
        this.saveModal.isVisible = true;
        this.isRenderForm = true;
      });
    }
  }

  copy(event ?: {}) {

    this.isRenderForm = false;
    this.http.get('web/project/info', {
      params: {
        id: event['id']
      },
    }).subscribe(res => {
      if (res['code'] !== 0) {
        this.message.error('项目已存在');
        return false;
      }
      this.onDestroy$ = new Subject<void>();
      this.saveModal.model = res['data'];
      this.saveModal.model['id'] = '';
      if (!res['isBMP'] || res['isBMP'] === 0) {
        this.isBMP = false;
      } else {
        this.isBMP = true;
      }
      this.saveModal.model['isBMP'] = this.isBMP;
      this.setFormlyField(this.isBMP);
      this.formlyField[0]['fieldGroup'].forEach(item => {
        if (item.key === 'product_text') {
          item['hideExpression'] = 'false';
        }
        if (item.key === 'product_name') {
          item['hideExpression'] = 'true';
        }
      });
      this.saveModal.isVisible = true;
      this.isRenderForm = true;
    });
  }

  pullMsh(item = {}) {
    this.message.isAllLoading = true;
    this.http.get('web/task/update-msh-project', { params: {pid: item['id']} }).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  closeModel () {
    this.saveModal.isVisible = false;
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  submit() {
    this.saveModal.model['categorys'].forEach(item => {
      if (item['authorized_order_approver']
          || item['authorized_purchasing_manager']
          || item['core_people']
          || item['focus_peopler']
          || item['order_approver']
          || item['purchasing_manager']) {
        item.checked = true;
      } else {
        item.checked = false;
      }
    });
    if (this.saveModal.model['id']) {
      this.saveModal.isOkLoading = true;
      this.message.isAllLoading = true;
      this.http.post('web/project/save', this.saveModal.model).subscribe(result => {
        this.saveModal.isOkLoading = false;
        this.message.isAllLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.closeModel();
        this.getList();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
        this.saveModal.isOkLoading = false;
      });
    } else {
      if (!this.saveModal.model['product_name']) {
        this.message.error('请填写产品名称');
        return;
      }
      if (!this.saveModal.model['parent_project_no'] && !this.saveModal.model['id']) {
        this.modal.create({
          nzTitle: '提示',
          nzContent: '没有配置母项目信息，确认提交?',
          nzClosable: false,
          nzOnOk: () => {
            this.createDesignProject();
          }
        });
      } else {
        this.createDesignProject();
      }
    }
  }

  createDesignProject () {
    this.saveModal.isOkLoading = true;
    this.message.isAllLoading = true;
    this.http.post('web/project/create', this.saveModal.model).subscribe(result => {
      this.saveModal.isOkLoading = false;
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.closeModel();
      this.getList();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.saveModal.isOkLoading = false;
    });
  }
}
