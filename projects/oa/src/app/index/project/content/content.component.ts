import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { FormlyFieldConfig, FormlyFormOptions, Field } from '@ngx-formly/core';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { ProductBudgetAdjustModalComponent } from '../../../containers/modal/product-budget-adjust/product-budget-adjust.component';
import { ModalService } from '../../../services/modal.service';
import { map, takeUntil,debounceTime,distinctUntilChanged, filter, switchMap, tap, skip } from 'rxjs/operators';
import { Options } from 'selenium-webdriver/chrome';
import { Subject } from 'rxjs';
import { UploadXHRArgs} from 'ng-zorro-antd';
import { UploadService} from '../../../services/upload.service';
import { NzModalRef, NzModalService, NzNotificationService } from 'ng-zorro-antd';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  
import { CosService } from '../../../services/cos.service';
import { CommonFunctionService } from '../../../services/common-function.service';

@Component({
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})

export class ContentComponent implements OnInit {
  @ViewChild(SaveModalComponent)
  private saveModalComponent: SaveModalComponent;
  @ViewChild(ProductBudgetAdjustModalComponent)
  private productBudgetAdjustModal: ProductBudgetAdjustModalComponent;

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    public uploadService: UploadService,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private commonFunctionService: CommonFunctionService,
    public cos: CosService
  ) {}

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
  onDestroy$ = null

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
  deptCenterOptions = [];
  costCenterOptions = [];
  isAdd = 0;
  isBMP = false;

  isEdit = false;
  isVisible: Boolean = false;
  Title: String = '项目编辑';
  model: any = {};
  form = new FormGroup({});
  options: FormlyFormOptions = {
    formState: {
      isBMP: false,
      isEdit: false,
      is_iomc: '1'
    },
  };
  fields: FormlyFieldConfig[] = [{
    fieldGroupClassName: 'ant-row',
    fieldGroup: [
      {
        key: 'id',
        type: 'nz-label',
        hide: true,
      },
      {
        key: 'product_name',
        type: 'nz-select',
        className: 'ant-col-12',
        templateOptions: {
          nzMode: 'default',
          nzServerSearch: true,
          nzLayout: 'fixedwidth',
          nzShowSearch: true,
          nzPlaceHolder: '输入关键字搜索',
          label: '产品名称',
          nzValue: 'option',
          nzRequired: true,
          callback: (name: string) => this.http.get('web/pull-coa/name-list', {params: {name: name, category_type: '1'}}).pipe(map((res: any) => { return res.data; })),
          options: [],
        },
        lifecycle: {
          onInit: (from, field: FormlyFieldConfig) => {
            field.formControl.valueChanges
              .pipe(takeUntil(this.onDestroy$))
              .pipe(debounceTime(60))
              .pipe(distinctUntilChanged())
              .subscribe(item => {
                if (from.controls.product_code && item.coa_code) {
                  from.controls.product_code.setValue(item.coa_code);

                  this.http.get('web/pull-coa/update-project-budget-operated?product_code=' + item.coa_code)
                  .pipe(debounceTime(60))
                  .pipe(takeUntil(this.onDestroy$)).subscribe(res => {
                    // field.formControl.setValue(res && res['data'] && res['data'].new_value ? res['data'].new_value : 'NA')
                    from.controls.budget.setValue(res && res['data'] && res['data'].new_value ? res['data'].new_value : 'NA');

                  })

                }
              })
          }
        },
        expressionProperties: {
          'templateOptions.disabled': 'model.id'
        }
      },
      {
        type: 'nz-label',
        key: 'product_code',
        className: 'ant-col-12',
        wrappers: ['field-wrapper'],
        templateOptions: {
          nzRequired: true,
          label: '产品编号',
          nzLayout: 'fixedwidth'

        }
      },
      {
        key: 'costcenter_list',
        type: 'nz-select',
        className: 'ant-col-12',
        templateOptions: {
          label: '成本中心',
          nzServerSearch: true,
          nzShowSearch: true,
          nzLayout: 'fixedwidth',
          nzRequired: true,
          nzValue: 'option',
          nzMode: 'multiple',
          callback: (name: string) => this.http.get('web/pull-coa/cost-center-list', {params: {name: name}}).pipe(map((res: any) => { return res.data; })),
          options: [],
        },
        hideExpression: '!model.product_name',
        expressionProperties: {
          'templateOptions.disabled': 'false'
        },
        lifecycle: {
          onInit: (from, field: FormlyFieldConfig, model, option) => {
            from.get('product_name').valueChanges
              .pipe(takeUntil(this.onDestroy$)).subscribe(item => {
              if (item.costcenter_code) {
                field.templateOptions.options = [{
                  dept_code: item.dept_code,
                  dept_id: item.department_id,
                  dept_name: item.department_name,
                  label: item.costcenter_name,
                  value: item.costcenter_code
                }]
                let costcenter_list =  [{
                  dept_code: item.dept_code,
                  dept_id: item.department_id,
                  dept_name: item.department_name,
                  label: item.costcenter_name,
                  value: item.costcenter_code
                }]
                field.formControl.setValue(costcenter_list);
              } else {
                field.formControl.setValue(null)
              }
            });
          }
        }
      },
      {
        key: 'department_id',
        className: 'ant-col-12',
        type: 'nz-select',
        templateOptions: {
          label: '所属部门',
          nzValue: 'value',
          nzShowSearch: true,
          nzRequired: true,
          nzLayout: 'fixedwidth',
          options: []
        },
        lifecycle: {
          onInit: (from, field) => {
            from.get('product_name').valueChanges
                .pipe(takeUntil(this.onDestroy$))
                .pipe(distinctUntilChanged())
                .pipe(debounceTime(60))
                .subscribe(item => {
                  if (item) {
                    if (item.department_id) {
                      field.formControl.setValue(item.department_id)
                      field.templateOptions.disabled = true
                    } else {
                      field.formControl.setValue(null)
                      field.templateOptions.disabled = false
                    }
                  }
            });
          },
        },
        expressionProperties: {
          'templateOptions.disabled': 'model.id'
        }
      },
      {
        type: 'nz-input',
        key: 'product_name_en',
        className: 'ant-col-12',
        templateOptions: {
          label: '产品英文名',
          nzLayout: 'fixedwidth'

        }
      },
      {
        type: 'nz-select',
        key: 'dept_id',
        className: 'ant-col-12',
        templateOptions: {
          label: '所属中心',
          nzLayout: 'fixedwidth',
          nzValue: 'value',
          nzShowSearch: true,
          options: []
        },
        lifecycle: {
          onInit: (from, field: FormlyFieldConfig, model, option) => {

            if(from.root.get('department_id').value) {
              this.http.get(`web/department/get-dept-center?id=${from.get('department_id').value}`)
                .pipe(takeUntil(this.onDestroy$))
                .pipe(filter((res: any) => res.code == 0))
                .pipe(map((res: any) => res.data))
                .subscribe(options => {
                  field.templateOptions.options = options
                  field.formControl.patchValue(field.formControl.value)
                })
            }

            from.get('department_id').valueChanges
              .pipe(takeUntil(this.onDestroy$))
              .pipe(filter(id => id))
              .pipe(distinctUntilChanged())
              .pipe(debounceTime(200))
              .pipe(
                switchMap((id) => this.http.get(`web/department/get-dept-center?id=${id}`)
                  .pipe(takeUntil(this.onDestroy$))
                  .pipe(filter((res: any) => res.code == 0))
                  .pipe(map((res: any) => res.data))
                ))
              .subscribe(options => {
                if (options.some(item => item.value != field.formControl.value)) {
                }
                field.templateOptions.options = options
              });
          },
        },
      },
      {
        type: 'nz-select',
        key: 'org_ids',
        className: 'ant-col-12',
        templateOptions: {
          label: '主体信息',
          nzMode: 'multiple',
          nzRequired: false,
          nzLayout: 'fixedwidth',
          nzValue: 'value',
          options: []
        },
        expressionProperties: {
          'templateOptions.disabled': 'formState.isBMP || formState.isEdit'
        },
        lifecycle: {
          onInit: (from, field, model, option) => {
            from.get('product_name').valueChanges
                .pipe(distinctUntilChanged())
                .pipe(takeUntil(this.onDestroy$)).subscribe(item => {
                  if (item.org_id) {
                    field.formControl.setValue([item.org_id]);
                    field.templateOptions.disabled = true;
                    field.templateOptions.nzRequired = false;
                  } else {
                    field.formControl.setValue(null);
                    field.templateOptions.disabled = true;
                  }
            });
          }
        }
      },
      {
        type: 'nz-select',
        key: 'type',
        className: 'ant-col-12',
        templateOptions: {
          label: '项目类型',
          nzLayout: 'fixedwidth',
          nzValue: 'value',
          options: []

        }
      },
      {
        key: 'is_not_demand_audit',
        type: 'nz-select',
        className: 'ant-col-12',
        defaultValue: '0',
        templateOptions: {
          label: '无需求审核',
          nzValue: 'value',
          options: [
            {
              label: '是',
              value: '1'
            },
            {
              label: '否',
              value: '0'
            }
          ]
        },
        expressionProperties: {
          'templateOptions.disabled': 'formState.isBMP',
        }
      },
      {
        type: 'nz-label',
        key: 'budget',
        className: 'ant-col-12',
        wrappers: ['field-wrapper'],
        templateOptions: {
          label: '年度预算',
          nzLayout: 'fixedwidth'
        },
        lifecycle:{
          onInit: (from, field: FormlyFieldConfig, model, option) => {
            model.budget = this.commonFunctionService.numberFormat(model.budget);
          }
        }
        // lifecycle: {
        //   onInit: (from, field: FormlyFieldConfig, model, option) => {
        //     from.get('product_code').valueChanges
        //       .pipe(distinctUntilChanged())
        //       .pipe(skip(1))
        //       .pipe(takeUntil(this.onDestroy$)).subscribe(item => {
        //         console.log(item)
        //         this.http.get('web/pull-coa/update-project-budget-operated?product_code=' + item).subscribe(res => {
        //           field.formControl.setValue(res && res['data'] && res['data'].new_value ? res['data'].new_value : 'NA')
        //         })
        //     });
        //   },
        // },
      },
      {
        key: 'category_id',
        type: 'nz-label',
        hide: true
      },
      {
        key: 'project_manager',
        type: 'select-oa-user-new',
        wrappers: ['field-wrapper'],
        className: 'ant-col-12',
        templateOptions: {
          nzLayout: 'fixedwidth',
          label: '项目管理员',
          options: [],
          nzValue: 'value',
        },
      },
      {
        key: 'resources_manager',
        type: 'select-oa-user-new',
        wrappers: ['field-wrapper'],
        className: 'ant-col-12',
        templateOptions: {
          nzLayout: 'fixedwidth',
          label: '资源管理员',
          options: [],
          nzValue: 'value',
        },
      },
      {
        key: 'categorys',
        type: 'tabs-section',
        className: 'ant-col-24',
        templateOptions: {
          nzAnimated: false,
          label: '分类',
          nzType: 'line',
          nzTabBarGutter: '0',
          nzForceRender: true,
          nzShowPagination: false,
        },
        expressionProperties: {
          'templateOptions.btnhide': 'formState.isBMP',
        },
        fieldArray: {
          fieldGroupClassName: 'ant-row',
          fieldGroup: [
            {
              key: 'label',
              type: 'nz-label',
              className: 'ant-col-12',
              wrappers: ['field-wrapper'],
              templateOptions: {
                label: '服务品类',
              },
              hide: true,
            },
            {
              key: 'demander',
              type: 'select-oa-user-new',
              wrappers: ['field-wrapper'],
              className: 'ant-col-24',
              templateOptions: {
                label: '需求人',
                options: [],
                nzRequired: true,
                nzValue: 'value',
              },
              expressionProperties: {
                'templateOptions.disabled': 'formState.is_iomc == 1',
              },
            },

            {
              key: 'is_all_need_approver',
              type: 'nz-select',
              className: 'ant-col-12',
              wrappers: ['field-wrapper'],
              defaultValue: false,
              templateOptions: {
                label: '全部审核',
                nzValue: 'value',
                nzRequired: true,
                nzPlaceHolder: '是/否',
                options: [
                  {
                    label: '是',
                    value: '1'
                  },
                  {
                    label: '否',
                    value: '0'
                  }
                ]
              },
            },
            {
              key: 'need_approver',
              type: 'nz-select-user',
              className: 'ant-col-12',
              wrappers: ['field-wrapper'],
              templateOptions: {
                label: '需求审核人',
                options: [],
                nzRequired: true,
                nzValue: 'value',
              },
              expressionProperties: {
                'templateOptions.disabled': 'formState.is_iomc == 1',
              },
              lifecycle: {
                onInit: (from, field) => {
                  field.formControl.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(item => {
                    if (from.parent.get('is_add_story_approver')) {
                      if (item.need_approver) {
                        from.parent.get('is_add_story_approver').setValue('0')
                      } else {
                        from.parent.get('is_add_story_approver').setValue('1')
                      }
                    }

                  })
                },
              },
            },
            {
              key: 'purchasing_manager',
              type: 'select-oa-user-new',
              wrappers: ['field-wrapper'],
              className: 'ant-col-12',
              templateOptions: {
                label: '采购经理',
                options: [],
                nzValue: 'value',
                nzRequired: false,
              },
              expressionProperties: {
                'templateOptions.disabled': 'formState.isBMP'
              },
            },
            {
              key: 'order_approver',
              type: 'select-oa-user-new',
              wrappers: ['field-wrapper'],
              className: 'ant-col-12',
              templateOptions: {
                label: '订单审批人',
                options: [],
                nzRequired: false,
                nzValue: 'value',
              },
              expressionProperties: {
                'templateOptions.disabled': 'formState.isBMP'
              },
            },
            {
              key: 'is_add_story_approver',
              type: 'nz-select',
              className: 'ant-col-12',
              wrappers: ['field-wrapper'],
              defaultValue: false,
              hide: true,
            },
            {
              key: 'acceptance_approver',
              type: 'select-oa-user-new',
              wrappers: ['field-wrapper'],
              className: 'ant-col-12',
              templateOptions: {
                label: '验收审批人',
                options: [],
                nzValue: 'value',
                nzRequired: true,
              },
              expressionProperties: {
                'templateOptions.disabled': 'formState.is_iomc == 1',
              },
            },
            {
              key: 'is_add_story_approver',
              type: 'nz-select',
              className: 'ant-col-12',
              wrappers: ['field-wrapper'],
              defaultValue: false,
              hide: true,
            },
            {
              key: 'core_people',
              type: 'select-oa-user-new',
              className: 'ant-col-12',
              wrappers: ['field-wrapper'],
              templateOptions: {
                label: '核心组成员',
                options: [],
                nzValue: 'value',
              },
              expressionProperties: {
                'templateOptions.disabled': 'formState.is_iomc == 1',
              },
            },
            {
              key: 'focus_peopler',
              type: 'select-oa-user-new',
              className: 'ant-col-12',
              wrappers: ['field-wrapper'],
              templateOptions: {
                label: '一般关注人',
                options: [],
                nzValue: 'value'
              },
              expressionProperties: {
                'templateOptions.disabled': 'formState.is_iomc == 1',
              },
            },

          ]
        }
      }
    ]
  }]



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
    this.http.get('web/project/content-configs').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.queryFields     = result['search_form'];
      this.typeOptions     = result['type_options'];
      this.isOptions       = result['is_options'];
      this.orgOptions      = result['org_options'];
      this.depatOptions    = result['dept_options'];
      this.deptCenterOptions    = result['dept_center_options'];
      this.levelOptions    = result['level_options'];
      this.costCenterOptions = result['cost_center_options'];
      this.isAdd           = result['isAdd'] || 0;

      if (!result['isBMP'] || result['isBMP'] === 0) {
        this.isBMP = true;
      } else {
        this.isBMP = false;
      }
      this.options.formState.isBMP = this.isBMP;
      this.fields[0].fieldGroup.find(item => item.key === 'department_id').templateOptions.options = this.depatOptions
      // this.fields[0].fieldGroup.find(item => item.key === 'dept_id').templateOptions.options = this.deptCenterOptions
      this.fields[0].fieldGroup.find(item => item.key === 'org_ids').templateOptions.options = this.orgOptions
      this.fields[0].fieldGroup.find(item => item.key === 'type').templateOptions.options = this.typeOptions
      // this.fields[0].fieldGroup.find(item => item.key === 'costcenter_list').templateOptions.options = this.costCenterOptions;
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
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/project/content-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
      //对于货币字段格式化处理
      this.currencyPretreat(result['list']);
      this.list                   = result['list'];
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }
  currencyPretreat(datas){
    for(let i in datas){
      if (datas[i]['budget'] != 'NA') {
        datas[i]['budget'] = this.commonFunctionService.numberFormat(datas[i]['budget']);
      }
    }
  }
  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 列表点击事件
  clickEvent(event) {
    if (event.key === 'update' && event.item && event.item.id) {
      this.openModel(event.item);
    } else if (event.key === 'need_approver_names') {
      this.selectNeedApprover(event.item);
    }
  }
  // 列表失去焦点事件
  blurEvent(event) {
    if (event.key === 'producer_name') {
    }
  }

  // 是否渲染表单
  // tslint:disable-next-line:member-ordering
  isRenderForm: Boolean = false;


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
      if (params['batch_type'] === '1' && (params['user_id'] === '' || params['user_id'] === null)) {
        this.message.error('追加时，成员不能为空');
        return;
      }
      if (params['category_id'] === '') {
        this.message.error('项目大类不能为空');
        return;
      }
      this.http.post('web/project/design-batch-save', { params: params }).subscribe(result => {
        this.message.isAllLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.saveModalComponent.cancelModal();
        this.getList();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
      });
    }
  }

  closeModel () {
    this.saveModal.isVisible = false;
  }

  submit() {
    this.saveModal.isOkLoading = true;
    this.message.isAllLoading = true;
    if (this.saveModal.model['id']) {
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

  // 新建内容类
  openModel (data = {}) {
    this.onDestroy$ = new Subject<any>()
    let id, category_id
    id = data['id'] || ''
    category_id = data['category_id'] || ''
    this.http.get('web/project/content-info?id=' + id).subscribe(result => {
      if (result['code'] === 0) {
        if(result['data']['id']) {
          this.options.formState.isEdit = true
          this.options.formState.is_iomc = result['data']['is_iomc'];
        } else {
          this.options.formState.isEdit = false
          this.options.formState.is_iomc = '1';
        }
        this.model = result['data']
        this.model['category_id'] = category_id
        this.isVisible = true
      } else {
        let msg = result['msg']?result['msg']:'';
        this.message.error('失败 '+ msg)
      }
    })

  }

  // 取消
  handleCancel () {
    this.isVisible = false;
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  isOkLoading
  // 确定
  handleOk () {
    let iserror = false;

    this.fields[0].fieldGroup.forEach(item => {
      if (item.templateOptions && item.templateOptions.nzRequired && this.model[item.key] && this.model[item.key] === '') {
        this.message.error(item.templateOptions.label + '不能为空');
        iserror = true;
        return;
      }
    });

    if (iserror) {
      return;
    }

    if (this.model && this.model['categorys']) {
      this.model['categorys'].forEach(item => {
        if(item['purchasing_manager'] || item['order_approver'] || item['core_people'] || item['focus_peopler'] || item['demander'] || item['acceptance_approver']) {
          item.checked = true;
        }
      });
    }

    // let status =  this.model.categorys.some(item => item.purchasing_manager && item.order_approver && item.demander && item.need_approver && item.acceptance_approver);
    // if (!status) {
    //   this.message.error('请配置大类人员信息');
    //   return;
    // }
    this.isOkLoading = true
    this.http.post('web/project/content-save', this.model).subscribe(result => {
      this.isOkLoading = false
      if (result['code'] === 0) {
        this.model = result['data']
        this.message.success(result['msg'])

        this.isVisible = false
        this.onDestroy$.next();
        this.onDestroy$.complete();
        // 刷新列表
        this.getList()
      } else {
        this.message.error(result['msg'])
      }
    })
  }
  // 查看需求审核人 小类别配置
  listNeedData
  selectNeedApprover(item) {
    this.http.get('web/project/content-category-napprover', {params: {id: item.id, category_id: item.category_id}}).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.isNeedVisible = true
      this.listNeedData = result['data']
    });
  }

  isNeedVisible
  handleNeedCancel () {
    this.isNeedVisible = false
  }

  handleNeedOk () {
    this.isNeedVisible = false
  }

  beforeUploadImg = (file: File) => {
    const isLt2M = file.size / 1024 / 1024 < 100;
    if (!isLt2M) {
      this.message.error('文件必需小于100MB!');
    }
    return isLt2M;
  }

  // customBigReq = (item: UploadXHRArgs) => {
  //   this.uploadService.uploadBig(item, 1600, data => {
  //       this.http.post('/web/project-budget/epo-use', {
  //         file_id: data.id
  //       }).subscribe(results => {
  //         if (results['code'] == 0) {
  //           this.notification.blank(
  //             '处理消息',
  //             results['msg'],
  //             { nzDuration: 0 }
  //           );
  //         }else{
  //           this.message.error(results['msg']);
  //         }
  //       }, (error) => {
  //       });
  //   });
  // }

  uploadChange ($event) {
    if ($event.file && $event.file.status === 'done') {
      this.http.post('/web/project-budget/epo-use', {
        file_id: $event.file.originFileObj.file_id
      }).subscribe(results => {
        if (results['code'] === 0) {
          this.message.success(results['msg']);
        } else {
          this.message.error(results['msg']);
        }
      }, () => {
        this.message.error('网络异常, 请稍后再试...');
      });
    }
  }
}
