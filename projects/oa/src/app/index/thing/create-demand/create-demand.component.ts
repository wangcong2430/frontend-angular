import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Field, FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { differenceInCalendarDays, addDays } from 'date-fns';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { CommonFunctionService } from '../../../services/common-function.service';

import { merge, Subject, of, combineLatest, race } from 'rxjs';
import { skip, distinctUntilChanged, takeUntil, filter, debounceTime } from 'rxjs/operators';



import { isArray } from 'ngx-bootstrap';


@Component({
  templateUrl: './create-demand.component.html',
  styleUrls: ['create-demand.component.css']
})

export class CreateDemandComponent  implements OnInit {
  @ViewChild('progressTemplate') progressTemplate: TemplateRef<{}>;

  from = '';
  reqId = '';
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private message: MessageService,
    private modalService: ModalService,
    private commonFunctionService: CommonFunctionService,
    private cd: ChangeDetectorRef,

  ) {
    route.queryParams.subscribe(params => {
      if (params) {
        if (params.from) {
          this.from = params.from;
          this.options.formState.from = this.from;
        }
        if (params.reqId) {
          this.reqId = params.reqId;
        }

      }
    });
  }

  dragState;

  // 项目名称的下拉选项
  getCreateDemandInfo = {};

  is_not_demand_audit = false;

  projectSelectedOptions = [];
  project_id = '';
  story_id = '';
  story_code = '';
  is_demand_edit = true;

  onDestroy$ = null;

  projectIdChange$ = new Subject<object>();
  projectProductIdChange$ = new Subject<object>();

//获取品类的值
  oldValue=[]
  // 附件上传状态
  uploadStatus = true;
  // Formly表单的字段
  formGroup = new FormGroup({});
  form = new FormGroup({});
  model: any = {
    is_demand_edit: true,
    project_product_id: '',
    project_id: '',
    product_name: '',
    story_code: '',
    project_group_name: '',
    budget_price: '',
    brand_principal: '',
    story_name: '',
    brand_available: '',
    brand_budget: '',
    product_available: '',
    product_budget: '',
    story_id: '',
    project_role: '',
    cost_center_code: '',
    brand_manager: null,
    brand_group_leader: '',
    product_type_hide:true,
    product_type:null, 
    product_type_plus:null,   

  };
  options: FormlyFormOptions = {
    formState: {
      projectCategoryOptions: [],
      awesomeIsForced: false,
      isEdit: false,
      userRoleLevel: null,
      showBrandManager: false,
      manager_list: [],
      brand_manager_list: [],
      budget_type_list: [],
      project_list: [],
      test_list: [],
      property_list: [],
      cost_center_options: [],

      product_data: [],
      design_engine: [],
      art_style: [],
      area_style: [],
      theme_element: [],
    },
  };

  loading = false;

  // 是否编辑

  // 项目对应意向CP
  supplierObj = {};

  allRequired = false;

  // 是否渲染表单
  isRenderForm = false;
  isSaveLoading = false;
  isSubmitLoading = false;
  isUnbindStoryLoading = false;
  msgHint = {
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: ''
  };
  painter_name_hidn = 0;
  isAuth = false;
  isAuthErrorMsg: '';
  isVisible = false; // 提示弹窗
  isTest = false; // 内容类测试
  // 保存服务器获取的信息
  getdemandinfo: {};

  thingNameOld = []

  today = new Date();
  formFields: FormlyFieldConfig[];
  initFormFields () {
    this.formFields = [
      {
        fieldGroupClassName: 'ant-row d-flex flex-wrap',
        fieldGroup: [
          {
            key: 'is_demand_edit',
            type: 'nz-label',
            hide: true,
          },

          {
            key: 'user_role_level',
            type: 'nz-radio',
            className: 'ant-col-18 ',
            templateOptions: {
              label: '请先选择费用类型',
              formState: {}
            },
            expressionProperties: {
              'templateOptions.disabled': 'formState.isEdit',
            },
            lifecycle: {
              onInit: (from, field, model, option) => {

                field.hide=false
                //console.log(field.templateOptions.options)
                if(isArray(field.templateOptions.options)){
                  if(field.templateOptions.options.length==1){
                     field.templateOptions.label=null
                  }
                }
                this.onDestroy$ = new Subject<void>();
                from.get('user_role_level').valueChanges
                    .pipe(takeUntil(this.onDestroy$))
                    .pipe(filter(x => x))
                    .pipe(distinctUntilChanged())
                    .subscribe(id => {
                        this.options.formState.userRoleLevel = id;
                        let options = this.getCreateDemandInfo['project_list'].filter(item => item.category_type == id);
                        if(id === '1') {
                          this.isVisible = true;
                          this.onModelChange();
                          options = options.filter(item => item.value === '219' || item.value === '220');
                          if(options.length > 0) {
                            this.isTest = true;
                          }
                        }
                        option.formState.project_list = options;
                        this.model.story_id = this.story_id;

                        if (options.length === 1) {
                            option.resetModel({
                              user_role_level: id,
                              project_id: options[0].value,
                              is_demand_edit: true,
                              first_category_list: []
                            });
                        } else {
                            option.resetModel({
                              user_role_level: id,
                              project_id: null,
                              is_demand_edit: true,
                              first_category_list: []
                            });
                        }
                    });
                }
            }

          },
          {
            key: 'story_code',
            type: 'nz-label',
            className: 'ant-col-6',
            wrappers: ['field-wrapper'],
            expressionProperties: {
              'templateOptions.disabled': 'true',
            },
            templateOptions: {
              label: '需求编号',
              nzLayout: 'inline',
            },
            hideExpression: (model) => {
              return model.user_role_level === '1' && !this.isTest;
            },
          },

          {
            key: 'project_id',
            type: 'nz-select',
            className: 'ant-col-6 project_id',
            templateOptions: {
              label: '项目名称',
              nzLayout: 'fixedwidth',
              nzValue: 'value',
              nzPlaceHolder: '请选择',
              nzRequired: true,
              options: []
            },
            hideExpression: (model) => {
              return model.user_role_level === '1' && !this.isTest;
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
              'templateOptions.options': 'formState.project_list'
            },
            lifecycle: {
              onInit: (from, field: FormlyFieldConfig, model, options) => {
                this.onDestroy$ = new Subject<void>();
                // 当项目发生改变时
                field.formControl.valueChanges
                .pipe(takeUntil(this.onDestroy$))
                .pipe(filter(x => x))
                .pipe(distinctUntilChanged())   // 值不同
                .pipe(debounceTime(120))
                .subscribe(value => {
                  //console.log(value)
                  const project =  options.formState.project_list.find(item => item.value === value)
                  if (project) {
                    options.formState.is_msh_management = project.is_msh_management
                  }
                  this.onModelChange(value);
                });

                field.formControl.setValue(field.formControl.value);
              },
              onDestroy: (field) => {
                this.onDestroy$.next();
                this.onDestroy$.complete();
              }
            }
          },

          {
            key: 'project_product_id',
            type: 'nz-select',
            className: 'ant-col-6',
            templateOptions: {
              label: '立项信息',
              nzLayout: 'fixedwidth',
              nzValue: 'value',
              nzPlaceHolder: '请选择',
              nzRequired: true,
              required: true,
              buttonClick: (model, options, _this) => {
                const messageId = this.message.loading('正在拉取MSH立项信息...', { nzDuration: 0 }).messageId;
                this.http.get('/web/task/update-msh-project?pid=' + model.project_id).subscribe(result => {
                  if (result['code'] == 0) {
                    this.onModelChange(model.project_id);
                  } else if (result['msg']) {
                    this.message.error(result['msg']);
                  }
                  this.message.remove(messageId);
                }, (err) => {
                  this.message.remove(messageId);
                  this.message.error('网络异常，请稍后再试');
                });
              },

              options: []
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
              'templateOptions.options': 'formState.project_product_list',
              'templateOptions.buttonLabel': 'formState.is_msh_management == "1" ?  "拉取MSH" : ""'
            },
            lifecycle: {
              onInit: (from, field, model, options) => {
                field.formControl.valueChanges.pipe(takeUntil(this.onDestroy$))
                                              .pipe(distinctUntilChanged())
                                              .pipe(skip(1))
                                              .pipe(debounceTime(60)).subscribe(value => {
                  if(this.getdemandinfo['project_product'].length == 1 && this.getdemandinfo['project_product'].filter(item=>item.value===this.model.project_product_id && item.nzDisabled===true).length != 0){
                    field.templateOptions.nzValidateStatus = 'error';
                    field.templateOptions.nzErrorTip = "该立项状态为【"+this.getdemandinfo['project_product'][0]['status_tag']+"】无法保存与提交";
                  }else{
                    field.templateOptions.nzValidateStatus = '';
                    field.templateOptions.nzErrorTip = '';
                  }
                  if (field.templateOptions.options instanceof Array) {
                    const obj = field.templateOptions.options.find(item => item.value === value);

                    if (obj) {
                      options.formState._manager_list = obj.manager_list;
                      options.formState._brand_manager_list = obj.brand_manager_list;
                      options.formState.brand_manager_list = obj.brand_manager_list;
                      options.formState.manager_list = [];
                      options.formState.budget_type_list = obj.budget_type.map(item => {
                        return {
                          value: item.budget_type,
                          label: item.budget_type_name
                        };
                      });

                      if (options.formState.budget_type_list
                          && options.formState.budget_type_list.length === 1
                          && from.root.get('budget_type')) {
                        from.root.get('budget_type').setValue(options.formState.budget_type_list[0].value);
                      } else if (from.root.get('budget_type')
                          && !options.formState.budget_type_list.some(item => item.value == from.root.get('budget_type').value)) {
                        from.root.get('budget_type').setValue(null);
                      } else if (from.root.get('budget_type')) {
                        from.root.get('budget_type').setValue(from.root.get('budget_type').value);
                      }
                      if (options.formState.brand_manager_list && options.formState.brand_manager_list.length === 1
                            && from.root.get('brand_manager')) {
                        from.root.get('brand_manager').setValue([options.formState.brand_manager_list[0].value]);
                      } else if (from.root.get('brand_manager')
                              && !options.formState.brand_manager_list.some(item => item.value == from.root.get('brand_manager').value)) {
                        from.root.get('brand_manager').setValue(null);
                      } else if (from.root.get('brand_manager')) {
                        from.root.get('brand_manager').setValue(from.root.get('brand_manager').value);
                      }
                    }
                  } else {
                    options.formState._manager_list = [];
                    options.formState._brand_manager_list = [];
                    options.formState.brand_manager_list = [];
                    options.formState.manager_list = [];
                    options.formState.budget_type_list = [];
                  }


                  this.projectProductIdChange$.next(value);
                  if (value && value != '0') {
                    this.http.get('web/demand/get-cost-center', {
                      params: {
                        budget_id: value,
                      }
                    }).subscribe(result => {
                      if (result['code'] == 0) {
                        let data =  result && result['data'] ?  result['data'] : [];
                        data = data.map(item => {
                          return {value: item.cost_center_code, label: item.cost_center_name, id: item.id};
                        });

                        options.formState.cost_center_options = data;

                        if (data && data.length === 1) {
                          from.root.get('cost_center_code').setValue(data[0].value);
                        } else {
                          if (data.some(item => item.value == from.root.get('cost_center_code').value)) {
                            from.root.get('cost_center_code').setValue(from.root.get('cost_center_code').value);
                          } else {
                            from.root.get('cost_center_code').setValue(null);
                          }
                        }
                      } else {
                        // this.message.remove(id)
                        if (result['msg']) {
                          this.message.error(result['msg']);
                        }
                      }
                    }, () => {
                      // this.message.remove(id)
                    });
                  }

                });
              }
            },
          },
          {
            key: 'budget_type',
            type: 'nz-select',
            className: 'ant-col-6',
            templateOptions: {
              label: '使用预算',
              nzLayout: 'fixedwidth',
              nzValue: 'value',
              nzPlaceHolder: '请选择',
              required: true,
              options: []
            },
            lifecycle: {
              onInit: (from, field, model, options) => {
                field.formControl.valueChanges.pipe(debounceTime(60)).pipe(filter(x => x)).subscribe(value => {
                  if (value == 2) {
                    if (options.formState.brand_manager_list
                        && options.formState.brand_manager_list.length === 1
                        && from.get('brand_manager')) {
                      from.get('brand_manager').setValue([options.formState.brand_manager_list[0].value]);
                    }
                    options.formState.manager_list = options.formState._manager_list ? options.formState._manager_list : [];
                  } else {
                    options.formState.manager_list = options.formState._brand_manager_list ? options.formState._brand_manager_list : [];
                    model.brand_manager = null;
                  }
                  if (options.formState.manager_list && options.formState.manager_list.length === 1) {
                    from.root.get('manager_id').setValue(options.formState.manager_list[0].value);
                  } else if (from.root.get('manager_id')
                              && !options.formState.manager_list.some(item =>
                                item.value == from.root.get('manager_id').value)) {
                    from.root.get('manager_id').setValue(null);
                  } else {
                    from.root.get('manager_id').setValue( from.root.get('manager_id').value);
                  }
                });
              }
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
              'templateOptions.options': 'formState.budget_type_list'
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
          },
          {
            type: 'nz-input',
            key: 'brand_principal',
            className: 'ant-col-6',
            expressionProperties: {
              'templateOptions.disabled': 'true',
            },
            templateOptions: {
              label: '品牌经理负责人',
              nzLayout: 'fixedwidth',
              nzCol: {
                nzOffset: 0,
              },
              options: [
                { label: 'QQ飞车', value: 'snickers'},
                { label: '自由幻想', value: 'snickers'},
              ]
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
          },
          {
            key: 'cost_center_code',
            type: 'nz-select',
            className: 'ant-col-6',

            templateOptions: {
              label: '成本中心',
              nzLayout: 'fixedwidth',
              nzValue: 'value',
              nzPlaceHolder: '请选择',
              required: true,
              nzRequired: true,
              options: []
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
              'templateOptions.options': 'formState.cost_center_options',
            },
            hideExpression: (model) => {
              return model.user_role_level === '1' && !this.isTest;
            },
          },
          {
            key: 'manager_id',
            type: 'nz-select',
            className: 'ant-col-6',

            templateOptions: {
              label: '经办人',
              nzLayout: 'fixedwidth',
              nzValue: 'value',
              nzPlaceHolder: '请选择',
              required: true,
              nzRequired: true,
              options: []
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
              'templateOptions.options': 'formState.manager_list',

            },
            hideExpression: (model) => {
              return !model.user_role_level || model.user_role_level != 2;
            },
          },
          {
            key: 'brand_manager',
            type: 'nz-select',
            className: 'ant-col-6',

            templateOptions: {
              label: '品牌经理',
              nzLayout: 'fixedwidth',
              nzValue: 'value',
              nzPlaceHolder: '请选择',
              nzRequired: true,
              required: true,
              nzMode: 'multiple',
              options: []
            },
            lifecycle: {
              onInit: (from, field, model, options) => {
                if (options.formState.brand_manager_list && options.formState.brand_manager_list.length == 1) {
                  field.formControl.setValue([options.formState.brand_manager_list[0].value]);
                }
                field.formControl.setValue(field.formControl.value);

              }
            },
            hideExpression: (model, formState) => {
                return !(model.user_role_level == 2 && model.budget_type == '2' && !formState.showBrandManager);

            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
              'templateOptions.options': 'formState.brand_manager_list',
            },
          },


          {
            key: 'brand_group_leader',
            type: 'nz-select',
            className: 'ant-col-6',

            templateOptions: {
              label: '品牌组长',
              nzLayout: 'fixedwidth',
              nzValue: 'value',
              nzPlaceHolder: '请选择',
              required: true,
              nzRequired: true,
              options: []
            },
            hideExpression: (model) => {
              return !model.user_role_level || model.user_role_level != 2;
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
            },
            lifecycle: {
              onInit: (from, field: FormlyFieldConfig) => {
                this.projectIdChange$.pipe(takeUntil(this.onDestroy$)).subscribe(item => {
                  if (item && this.getdemandinfo['brand_group_leader_option']
                          && this.getdemandinfo['brand_group_leader_option'].length > 0 ) {

                    field.templateOptions.options = this.getdemandinfo['brand_group_leader_option'];

                    from.get('manager_id').valueChanges
                        .pipe(takeUntil(this.onDestroy$))
                        .pipe(filter(id => id)).subscribe(id => {

                          let options = [];
                          if (this.is_not_demand_audit) {
                            options = this.getdemandinfo['brand_group_leader_option'];
                          } else {
                            options = this.getdemandinfo['brand_group_leader_option'].filter(item => item.value != id);
                          }
                          field.templateOptions.options = options;

                          if (options && options.length == 1) {
                            field.formControl.setValue(options[0].value);
                          } else if (field.formControl.value && field.formControl.value == id) {
                            this.message.error('按照风控要求，需求人和需求审核的人员不可以为同一人');
                            field.formControl.setValue(null);
                          }

                    });
                  }
                })
              }
            },
          },
          {
            key: 'story_name',
            type: 'nz-input',
            className: 'ant-col-6',
            templateOptions: {
              label: '需求名称',
              nzLayout: 'fixedwidth',
              required: true,
              nzRequired: true,
            },
            hideExpression: (model) => {
              return model.user_role_level === '1' && !this.isTest;
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
            },
          },
          {
            key: 'demand_type',
            type: 'nz-select',
            className: 'ant-col-6',
            defaultValue: '0',
            templateOptions: {
              label: '需求种类',
              nzLayout: 'fixedwidth',
              nzValue: 'value',
              nzPlaceHolder: '请选择',
              required: true,
              nzRequired: true,
              options: [
                {
                  label: '常规',
                  value: '0'
                },
                {
                  label: '基地',
                  value: '1'
                },
                {
                  label: '画师',
                  value: '2'
                },
              ],
              onModelChange : ($event, field) => {
                //console.log($event)
                //console.log(this.formFields[0].fieldGroup)

                if ($event == 2) {
                  this.painter_name_hidn = 1;
                  this.formFields[0].fieldGroup.map((item,index)=>{
                     if(item.key=='demand_type'){
                       item.className='ant-col-2'
                     }
                  })
                } else {
                  this.painter_name_hidn = 0;
                  this.formFields[0].fieldGroup.map((item,index)=>{
                    if(item.key=='demand_type'){
                      item.className='ant-col-6'
                    }
                 })
                }

              },
            }


          },
          {
            key: 'painter_name',
            type: 'nz-input',
            className: 'ant-col-4 painter_name',
            templateOptions: {
              label: '',
              nzLayout: 'fixedwidth',
              nzPlaceHolder: '画师名称',
              required: true,
              nzRequired: true,
            },
            hideExpression: (model) => {
              return this.painter_name_hidn == 0;
            },
          },
          {
            key: 'related_reviewer',
            type: 'select-oa-user-new',
            className: 'ant-col-6',
            templateOptions: {
              nzType: 'number',
              label: '相关审核人',
              nzPlaceHolder: '',
              nzLayout: 'fixedwidth',
              minRows: 1
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
          },
          {
            key: 'product_name',
            type: 'nz-input',
            className: 'ant-col-6',
            templateOptions: {
              label: '产品名称',
              nzLayout: 'fixedwidth',
              nzCol: {
                nzOffset: 0,
              }
            },
            expressionProperties: {
              'templateOptions.disabled': 'true',
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
          },
          {
            key: 'project_group_name',
            type: 'nz-input',
            className: 'ant-col-6',
            templateOptions: {
              label: '母项目名称',
              nzLayout: 'fixedwidth',
              nzPlaceHolder: '请输入',
              nzCol: {
                nzOffset: 0,
              }
            },
            expressionProperties: {
              'templateOptions.disabled': 'true',
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
          },
          {
            key: 'attachment_id',
            type: 'create-demand-upload-component',
            className: 'ant-col-24',
            templateOptions: {
              label: '需求附件',
              nzLayout: 'fixedwidth',
              // nzLimit: 1,
              // nzMultiple: true,
              key: '1025',
              options: [],
              nzChange: (fileList, file, event) => {
                if (fileList && fileList.length > 0) {
                  if (fileList.length == 0 || fileList.every(item => item.status == 'done')) {
                    this.uploadStatus = true;
                  } else {
                    this.uploadStatus = false;
                  }
                }
              }
            },
            lifecycle: {
              onInit: (from, field: FormlyFieldConfig) => {
                const options$ = new Subject<Array<{}>>();
                field.templateOptions.options = options$;
                this.projectIdChange$.pipe(takeUntil(this.onDestroy$)).subscribe(item => {
                  if (item) {
                    if (this.getdemandinfo
                        && this.getdemandinfo['demand']
                        && this.getdemandinfo['demand']['attachment_list']
                        && this.getdemandinfo['demand']['attachment_list'].length > 0) {
                      const attachment_list = this.getdemandinfo['demand']['attachment_list'];
                      options$.next(attachment_list);
                    }
                  }
                });
              }
            },

            expressionProperties: {
              'templateOptions.nzDisabled': '!model.is_demand_edit',
            },
            hideExpression: (model) => {
              return model.user_role_level === '1' && !this.isTest;
            },
          },

          {
            key: 'story_remark',
            type: 'nz-textarea',
            className: 'ant-col-24 nz-textarea',
            templateOptions: {
              label: '需求说明',
              nzRow: 3,
              nzLayout: 'fixedwidth',
              nzPlaceHolder: '仅做需求说明之用, 不要涉及任何价格, 供应商等信息, 不超过500字'
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.is_demand_edit',
            },

            hideExpression: (model) => {
              return model.user_role_level === '1' && !this.isTest;
            },
          },
          {
            key: 'budget_price',
            type: 'nz-template',
            className: 'ant-col-3',
            templateOptions: {
              template: '',
            },
            expressionProperties: {
              'templateOptions.template': () => `
              <div class="media ant-form-item-label" >
                <label class="text-right pl-1">预计花费合计</label>
                <p class="media-body text-left">
                ${this.model['budget_price'] ?
                this.commonFunctionService.numberFormat(this.model['budget_price']) : '0.00'}
              </div >
              `
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
          },
          {
            type: 'nz-template',
            className: 'ant-col-3',
            templateOptions: {
              template: '',
            },
            expressionProperties: {
              'templateOptions.template': () => `
              <div class="media ant-form-item-label" >
                <label class="text-right pl-1">可用预算/总预算</label>
                <p class="media-body text-left">${this.model['use_budget'] ?
                this.commonFunctionService.numberFormat(this.model['use_budget']) : '0.00'}/${this.model['total_budget'] ?
                this.commonFunctionService.numberFormat(this.model['total_budget']) : '0.00'}</p>
              </div >
              `
            },
            hideExpression: (model) => {
              return model.user_role_level === '1' && !this.isTest;
            },
          },
          {
            key: 'product_budget',
            type: 'nz-label',
            hide: true
          },
          {
            key: 'product_available',
            type: 'nz-label',
            hide: true
          },
          {
            key: 'brand_budget',
            type: 'nz-label',
            hide: true
          },
          {
            key: 'brand_available',
            type: 'nz-label',
            hide: true
          },
          {
            key: 'use_budget',
            type: 'nz-label',
            hide: true
          },
          {
            key: 'total_budget',
            type: 'nz-label',
            hide: true
          },
          {
            type: 'nz-template',
            className: 'ant-col-3',
            templateOptions: {
              template: '',
              onClick: (model, $event) => {
                this.modalService.open('budget', {
                  key: '2',
                  data: {
                    id: model.project_product_id
                  }
                });
              }
            },
            lifecycle: {
              onInit: (from, field) => {
                this.projectProductIdChange$.subscribe(id => {
                  if (id && this.getdemandinfo['project_budget'][id]) {
                    this.model['product_available'] = this.getdemandinfo['project_budget'][id]['product_available'] ?
                                                         this.getdemandinfo['project_budget'][id]['product_available'] : 0;
                    this.model['product_budget'] = this.getdemandinfo['project_budget'][id]['product_budget'] ?
                                                          this.getdemandinfo['project_budget'][id]['product_budget'] : 0;
                    from.get('product_available').setValue(this.model['product_available']);
                    from.get('product_budget').setValue(this.model['product_budget']);
                  } else {
                    from.get('product_available').setValue(0);
                    from.get('product_budget').setValue(0);
                  }
                })
              }
            },
            expressionProperties: {
              'templateOptions.template': () => `
                <div class="media ant-form-item-label" >
                  <label class="text-right pl-1">可用/总产品费用</label>
                  <p class="media-body text-left"  *ngIf="false">
                    <a class="text-primary" >${this.commonFunctionService.numberFormat(this.model.product_available)}</a>
                    /<a class="text-primary">${this.commonFunctionService.numberFormat(this.model.product_budget)}</a></p>
                </div >
              `
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
          },
          {
            type: 'nz-template',
            className: 'ant-col-3',
            templateOptions: {
              template: '',
              onClick: (model, $event) => {
                this.modalService.open('budget', {
                  key: '1',
                  data: {
                    id: model.project_product_id
                  }
                });
              }
            },
            lifecycle: {
              onInit: (from, field: FormlyFieldConfig) => {
                this.projectProductIdChange$.subscribe(id => {
                  if (id && this.getdemandinfo['project_budget'][id]) {
                    this.model['brand_available'] = this.getdemandinfo['project_budget'][id]['brand_available'] ?
                           this.getdemandinfo['project_budget'][id]['brand_available'] : 0;
                    this.model['brand_budget'] = this.getdemandinfo['project_budget'][id]['brand_budget'] ?
                           this.getdemandinfo['project_budget'][id]['brand_budget'] : 0;
                    from.get('brand_available').setValue(this.model['brand_available']);
                    from.get('brand_budget').setValue(this.model['brand_budget']);
                  } else {
                    from.get('brand_available').setValue(0);
                    from.get('brand_budget').setValue(0);
                  }
                })
              }
            },
            expressionProperties: {
              'templateOptions.template': () => `
                <div class="media ant-form-item-label" >
                  <label class="text-right pl-1">可用/总品牌费用</label>
                  <p class="media-body text-left"><a class="text-primary">
                  ${this.commonFunctionService.numberFormat(this.model['brand_available'])}</a>/<a class="text-primary">
                  ${this.commonFunctionService.numberFormat(this.model['brand_budget'])}</a></p>
                </div >
              `
            },
            hideExpression: (model) => {
              return model.user_role_level == 1 || !model.user_role_level;
            },
          },






          //产品标签

          // {
          //   key: 'design_engine',
          //   type: 'nz-select',
          //   className: 'ant-col-4',

          //   templateOptions: {
          //     label: '产品引擎',
          //     nzLayout: 'fixedwidth',
          //     nzValue: 'value',
          //     nzPlaceHolder: '请选择',
          //     nzMode: "multiple",
          //     nzAllowClear: true,
          //     //required: true,
          //     //nzRequired: true,
          //     options: []
          //   },
          //   expressionProperties: {
          //     //'templateOptions.disabled': '!model.is_demand_edit',
          //     // 'templateOptions.options': 'formState.design_engine.design_engine_options',
          //   },
          // },
          // {
          //   key: 'art_style',
          //   type: 'nz-select',
          //   className: 'ant-col-4',

          //   templateOptions: {
          //     label: '美术风格',
          //     nzLayout: 'fixedwidth',
          //     nzValue: 'value',
          //     nzPlaceHolder: '请选择',
          //     nzMode: "multiple",
          //     nzAllowClear: true,
          //     //required: true,
          //     //nzRequired: true,
          //     nzMultiple: true,
          //     options: []
          //   },
          //   expressionProperties: {
          //    // 'templateOptions.disabled': '!model.is_demand_edit',
          //     // 'templateOptions.options': 'formState.art_style.art_style_options',
          //   },
          // },
          // {
          //   key: 'area_style',
          //   type: 'nz-select',
          //   className: 'ant-col-4',

          //   templateOptions: {
          //     label: '地域风格',
          //     nzLayout: 'fixedwidth',
          //     nzMode: "multiple",
          //     nzValue: 'value',
          //     nzAllowClear: true,
          //     nzPlaceHolder: '请选择',
          //     //required: true,
          //     //nzRequired: true,
          //     options: []
          //   },
          //   expressionProperties: {
          //     //'templateOptions.disabled': '!model.is_demand_edit',
          //     // 'templateOptions.options': 'formState.area_style.area_style_options',
          //   },
          // },
          // {
          //   key: 'theme_element',
          //   type: 'nz-select',
          //   className: 'ant-col-4',

          //   templateOptions: {
          //     label: '题材元素',
          //     nzLayout: 'fixedwidth',
          //     nzValue: 'value',
          //     nzPlaceHolder: '请选择',
          //     nzMode: "multiple",
          //     nzAllowClear: true,
          //     //required: true,
          //    // nzRequired: true,
          //     options: []
          //   },
          //   expressionProperties: {
          //    // 'templateOptions.disabled': '!model.is_demand_edit',
          //     // 'templateOptions.options': 'formState.theme_element.theme_element_options',
          //   },
          // },

         /*  {
            key: 'product_type',
            type: 'multiple-select',
            className: 'ant-col-24 ',
            templateOptions: {
            },
            expressionProperties: {
            },
            hideExpression:() => {
              return this.model.product_type_hide
            }
          }, */
          {
            type: 'create-demand-tabs',
            key: 'first_category_list',
            className: 'ant-col-24',
            templateOptions: {
              label: '分类',
              nzLayout: 'fixedwidth',
              price_library_list: [],
              options: [],
            },
            expressionProperties: {
              'templateOptions.from': 'formState.from',
            },
            lifecycle: {
              onInit: (from, field: FormlyFieldConfig) => {

                //console.log(field)
                const options$ = new Subject<Array<{}>>();
                field.templateOptions.options = options$;

                // 当选择3D&动效或2D&平面时更新必填项
                field.formControl.valueChanges
                .subscribe(value => {
                  let isSelectID338OrID331 = false
                 //console.log(value)
                 //console.log(this.oldValue)
                   //this.oldValue=value
               /*  if(value.length>0&&this.oldValue.length==0){
                    if(value[0].id!='331'&&value[0].id!='338'){
                      this.model.product_type_hide= true;                      
                      this.oldValue=value;
                      return
                    }else if(value[0].id=='331'||value[0].id=='338'){
                      this.model.product_type_hide= false;
                      this.oldValue=value;                      
                      return
                    } 
                  }else if(value.length>0&&this.oldValue.length>0&&value.length>this.oldValue.length){                 
                    
                    var valueId=value.map((item)=>{
                       return  item.id})
                    //console.log(valueId)   
                    var oldValueId=this.oldValue.map((item)=>{
                     return  item.id})
                    //console.log(oldValueId) 
                    var ID=null
                   valueId.map((item2)=>{
                       if(oldValueId.indexOf(item2)==-1){
                        ID=item2
                       }

                    })
                    console.log(ID)
                    if(ID!='331'&&ID!='338'){
                      this.model.product_type_hide= true;                    
                      this.oldValue=value; 

                      return                   
                    }else if(ID=='331'||ID=='338'){
                      this.model.product_type_hide= false;                      
                      this.oldValue=value;                                                    
                      return                   
                    }
                  }else if(value.length>0&&this.oldValue.length>0&&value.length<this.oldValue.length){                   
                      this.model.product_type_hide= true;
                      this.oldValue=value;    
                      return               
                  }else if(value.length==0){
                      this.model.product_type_hide= true;
                      this.oldValue=value;                       
                      return   
                  }else if(value.length>0&&this.oldValue.length>0&&value.length==this.oldValue.length){
                    //console.log(value,this.oldValue)
                     this.model.product_type_hide= false;
                     this.oldValue=value;
                     return   
                  } */
                                                   
                 
                  //console.log(value)
                  const selectIDList = value.map(item => item.id)
                  if(selectIDList.includes('331') || selectIDList.includes('338') || selectIDList.includes('5')&&!selectIDList.includes('1') &&!selectIDList.includes('79') ){
                    //this.model.product_type_hide= false;
                    //console.log(this.model.product_type_hide)
                  }
                   //if(selectIDList.includes('5') || selectIDList.includes('331') &&selectIDList.some////////(item=>item!='1') &&selectIDList.some(item=>item!='79') ){
                    //this.model.product_type_hide=false;
                    //console.log(this.model.product_type_hide)
                  //}
                   //else if(selectIDList.includes('338') || selectIDList.includes('331')) {
                    //isSelectID338OrID331 = true
                  //} */
                    else {
                    //isSelectID338OrID331 = false
                    //this.model.product_type_hide=true;
                  }


                  // ['theme_element', 'area_style', 'art_style', 'design_engine', 'product_type'].forEach(item => {
                  //   this.formFields[0].fieldGroup.find(ele => ele.key == item).templateOptions.nzRequired = isSelectID338OrID331
                  // })
                });

                this.projectIdChange$.pipe(takeUntil(this.onDestroy$))
                    .pipe(distinctUntilChanged()).subscribe(item => {                    
                    if (item) {
                      //console.log(item)
                      let selectOption = [];
                      // 选中的参数
                      if (this.getdemandinfo['demand']
                          && this.getdemandinfo['demand']['category_select']
                          && this.getdemandinfo['demand']['category_select'].length > 0) {
                           // console.log(this.getdemandinfo['demand'])
                        selectOption = this.getdemandinfo['demand']['category_select'];
                      }

                      const options = this.getdemandinfo['first_category_list'].map(res => {
                        return {
                          label: res.title,
                          value: res.id,
                          checked: selectOption.some(item => item == res.id),
                          disabled: res.disabled || false};
                      });
                      options$.next(options);
                    } else {
                      options$.next([]);
                    }
                });
              },
              onDestroy: () => {
                if (this.onDestroy$) {
                  this.onDestroy$.next();
                  this.onDestroy$.complete();
                }
              },
            },


            fieldArray: {
              fieldGroupClassName: 'row',
              fieldGroup: [

                  //产品标签

                {
                  key: 'id',
                  type: 'nz-label',
                  hide: true
                },
                {
                  key: 'title',
                  type: 'nz-label',
                  hide: true
                },

                {
                  key: 'product_type',
                  type: 'multiple-select',
                  className: 'ant-col-24 ',
                  templateOptions: {
                  },
                  expressionProperties: {
                  },
                  lifecycle: {
                    onInit: (from, field, model, options) => { 
                      //console.log(this.model.product_type,this.model.product_type_plus)                                        
                      field.hide=this.model.product_type_hide                      
                      console.log(model)                                                                    
                      if(model.thing_list.length>0){
                        field.formControl.setValue(model.product_type)
                        field.hide=false 
                      }else if(model.thing_list.length==0&&model.title=='3D&动效'){
                        field.formControl.setValue(this.model.product_type)
                        field.hide=false                       
                      }else if(model.thing_list.length==0&&model.title=='2D&平面'){
                        field.formControl.setValue(this.model.product_type_plus)
                        field.hide=false                       
                      }                 
                      
                    }
                  },

                },
                {
                  key: 'thing_list',
                  type: 'table-section',
                  className: 'ant-col-24 p-3',
                  templateOptions: {
                    nzTitleTemplate: true,
                    nzTitle: 'nzAddTemplate',
                    label: '操作',
                    type: 'action',
                    options: [
                      {
                      type: 'copy',
                      label: '复制',
                    }, {
                      type: 'remove',
                      label: '删除'
                    }],
                    categoryOptions: []
                  },

                  lifecycle: {
                    onInit: (from, field, model, options) => {

                      const category_id = from.get('id').value;


                      // 物件类别
                      field.templateOptions.is_test = options.formState.test_list.some(id => id == category_id);
                      field.templateOptions.is_property = options.formState.property_list.some(id => id == category_id);

                      if (model.id) {
                        field.templateOptions.disabled = model.id ? true : false
                      }

                      const category = this.getdemandinfo['category_list'].find(res => res.id == category_id);
                      if (category && category.child_category) {
                        field.templateOptions.categoryOptions = category.child_category.map(item => {
                          return {
                            label: item.name,
                            value: item.id
                          };
                        });
                      }
                    }
                  },



                  fieldArray: {
                    fieldGroupClassName: '',

                    fieldGroup: [

                      {
                        key: 'id',
                        type: 'nz-label',
                        hide: true,
                      },


                      {
                        key: 'thing_code',
                        type: 'nz-label',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '物件单号',
                        },
                        expressionProperties: {
                          'templateOptions.tooltip': 'model.rejected_reason',
                        },
                        hideExpression: '!formState.story_id'
                      },
                      {

                        key: 'category_id',
                        type: 'nz-select',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '类别',
                          nzPlaceHolder: '请选择',
                          nzShowSearch: true,
                          nzRequired: true,
                          nzSize: 'small',
                          options: [],
                          nzDropdownStyle: {'min-width': '220px'},
                          nzValue: 'value'
                        },
                        lifecycle: {
                          onInit: (from, field, model, options) => {
                            // 物件类别
                            merge(
                              from.parent.get('category_id').valueChanges,

                            ).subscribe(data => {
                              let thing_price = 0;
                              const model = JSON.parse(JSON.stringify(field.model));
                              model.category_id = from.parent.get('category_id').value;
                              //console.log(data)
                              //console.log(model.category_id)
                              //console.log(model)
                              //if(model.category_id!=89){
                                //model.attribute.map((item)=>{
                                      //if(item.title=='制作方式'){
                                        //console.log(item.form_value.split('|'))
                                      //const creation_method_form_value=item.form_value.split('|').filter(idm=>idm!=='实拍买量'&&idm!=='剪辑买量'&&idm!=='引擎买量')
                                        //localStorage.setItem('creation_method_form_value',creation_method_form_value)
                                        //console.log(creation_method_form_value)
                                      //}
                                //})
                              //}

                            })


                            const category_id = field.formControl.parent.parent.parent.value.id ?
                                                  field.formControl.parent.parent.parent.value.id  : null;

                            if (category_id) {
                              model.first_category = category_id;
                            }
                            const category = this.getdemandinfo['category_list'].find(res => res.id == category_id);
                            if (category && category.child_category) {
                              field.templateOptions.options = category.child_category.map(item => {
                                return {
                                  label: item.name,
                                  value: item.id,
                                  description: item.description
                                };
                              });
                            }
                            //console.log(field.templateOptions.options)
                          }
                        },
                      },
                      {
                        key: 'thing_name',
                        type: 'nz-textarea',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '物件名称',
                          nzRequired: true,
                          nzPlaceHolder: '请输入物件名称',
                          width: '240px',
                          nzRow: 2,
                        },
                        lifecycle: {
                          onInit: (from, field, model, options) => {
                            // 物件类别
                            field.formControl.valueChanges.pipe(debounceTime(300)).pipe(distinctUntilChanged()).subscribe(item => {
                              this.formRequired(this.formFields);
                              field.formControl.patchValue(field.formControl.value);
                            })
                          }
                        },
                      },

                      {
                        key: 'attribute',
                        type: 'create-demand-attribute-edit',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '标签',
                          tip: '标签是成本合理性回溯的重要依据，请如实填写',
                          width: '220px',
                          nzSize: 'small',
                        },
                        lifecycle: {
                          onInit: (from, field, model, options) => {
                            // 如果分类改变, 则属性发生改变
                            if (!field.formControl.value && from.parent.get('category_id').value && this.getdemandinfo['attribute']) {
                              const labelList = this.getdemandinfo['attribute'].filter(item => item.category_id == model.category_id + '');
                              field.formControl.setValue(labelList);
                            }

                            from.parent.get('category_id').valueChanges.pipe(distinctUntilChanged()).subscribe(id => {
                              const labelList = this.getdemandinfo['attribute'].filter(item => item.category_id == id + '');
                              field.formControl.patchValue(labelList);
                            });
                          }
                        }
                      },
                      {
                        key: 'pre_workload',
                        type: 'nz-label',
                        hide: true
                      },
                      {
                        key: 'pre_produce_grade_id',
                        type: 'nz-select',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '制作等级',
                          nzSize: 'small',
                          nzPlaceHolder: '请选择',
                          options: [],
                          nzValue: 'value',
                          // required: true,
                          // nzRequired: true,
                        },
                        lifecycle: {
                          onInit: (from, field: FormlyFieldConfig, model) => {
                            const id = from.parent.get('category_id').value + '';

                            const produceBreakdownGrade = this.getdemandinfo['produce_breakdown_grade_list'].find(res => res.id == id)

                            const options = produceBreakdownGrade ? produceBreakdownGrade.produceGrades.map(res => ({
                                label: res.title,
                                value: res.id
                              })) : [];

                            field.templateOptions.options = options;


                            // 设置默认值
                            if (from.parent.get('category_id').value) {
                              if ( options.length < 1 ) {
                                field.formControl.setValue('');
                                field.templateOptions.nzPlaceHolder = 'NA';
                                field.templateOptions.nzDisabled = true;
                              }

                              if (options.length > 0) {

                                field.templateOptions.nzPlaceHolder = '请选择';
                                field.templateOptions.nzDisabled = false;
                                if (!field.formControl.value) {
                                  field.formControl.setValue(options[0].value ? options[0].value : '');
                                }
                              }
                            }
                            // 获取类别, 动态改变等级的下拉选项*
                            from.parent.get('category_id').valueChanges.subscribe(id => {
                              let options = this.getdemandinfo['produce_breakdown_grade_list'].find(res => res.id + '' === id + '') ?
                                                this.getdemandinfo['produce_breakdown_grade_list']
                                                    .find(res => res.id + '' === id + '')
                                                    .produceGrades
                                                    .map(res => ({label: res.title, value: res.id + ''}))
                                                : [];
                              //  参数
                              if ( options.length < 1 ) {
                                field.formControl.setValue('');
                                field.templateOptions.nzPlaceHolder = 'NA';
                                field.templateOptions.nzDisabled = true;
                              }

                              if (options.length > 0) {
                                field.formControl.setValue(options[0].value ? options[0].value : '');
                                field.templateOptions.nzPlaceHolder = '请选择';
                                field.templateOptions.nzDisabled = false;
                              }

                              field.templateOptions.options = options;
                            });
                          }
                        },
                      },
                      {
                        key: 'produce_breakdowns',
                        type: 'create-demand-breakdowns',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '数量/预估工作量',
                          nzRequired: true,
                          width: '120px',
                          nzSize: 'default',
                          price_template_library_list: [],
                          is_breakdown: 0,
                          produceBreakdowns: []
                        },
                        lifecycle: {
                          onInit: (from, field: FormlyFieldConfig, model) => {
                            // 获取类别, 动态改变等级的下拉选项
                            race([
                              from.parent.get('category_id').valueChanges,
                              from.parent.get('pre_produce_grade_id').valueChanges
                            ]).subscribe(id => {
                              const category_id = from.parent.get('category_id').value
                              const pre_produce_grade_id = from.parent.get('pre_produce_grade_id').value

                              const produceBreakdownGrade = this.getdemandinfo['produce_breakdown_grade_list'].find(res => res.id == category_id)
                              field.templateOptions.produceBreakdowns = produceBreakdownGrade? produceBreakdownGrade.produceBreakdowns.filter(item => item.produce_grade_id == pre_produce_grade_id ) : [];
                              field.templateOptions.is_breakdown = produceBreakdownGrade ? produceBreakdownGrade.is_breakdown : false;

                              field.templateOptions.price_template_library_list = this.getdemandinfo['price_template_library_list'];
                              field.templateOptions.workload_unit_list = this.getdemandinfo['workload_unit_list'];
                              field.templateOptions.price_library_list = this.getdemandinfo['price_library_list'].filter(item => item.category_id == category_id && item.produce_grade_id == pre_produce_grade_id);

                            });

                            if (from.parent.get('category_id').value) {
                              const category_id = from.parent.get('category_id').value
                              const pre_produce_grade_id = from.parent.get('pre_produce_grade_id').value

                              const produceBreakdownGrade = this.getdemandinfo['produce_breakdown_grade_list'].find(res => res.id  == category_id)
                              field.templateOptions.produceBreakdowns = produceBreakdownGrade? produceBreakdownGrade.produceBreakdowns.filter(item => item.produce_grade_id == pre_produce_grade_id ) : [];
                              field.templateOptions.is_breakdown = produceBreakdownGrade ? produceBreakdownGrade.is_breakdown : false;
                              field.templateOptions.price_template_library_list = this.getdemandinfo['price_template_library_list'];
                              field.templateOptions.workload_unit_list = this.getdemandinfo['workload_unit_list'];
                              field.templateOptions.price_library_list = this.getdemandinfo['price_library_list']
                                .filter(item => item.category_id == category_id && item.produce_grade_id == pre_produce_grade_id);

                            }
                          }
                        },
                        // hide: true
                      },
                      {
                        key: 'is_lock_breakdown_number',
                        type: 'nz-checkbox',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '禁止CP修改明细 ',
                          type: 'isBoolean',
                          nzSize: 'small',
                        },
                        hide: true
                      },
                      {
                        key: 'is_show_thing_cost',
                        type: 'nz-checkbox',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '是否显示物件价格 ',
                          type: 'isBoolean',
                          nzSize: 'small',
                          value:"0"
                        },
                        hide: true
                      },
                      {
                        key: 'pre_workload_unit_id',
                        type: 'nz-select',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '工作量单位',
                          nzPlaceHolder: '请选择',
                          nzSize: 'small',
                          options: [],
                          nzValue: 'value',
                          nzRequired: true
                        },
                        lifecycle: {
                          onInit: (from, field: FormlyFieldConfig,model) => {
                            // from.valueChanges.subscribe(id=>{
                            //   let workload_info = this.getdemandinfo['workload_unit_list'].find(item=>item.value==id)
                            //   from.parent.get('is_show_thing_cost').setValue(workload_info['is_show_thing_cost']);
                            // })
                            var changeOptions = (category_id) => {
                              let first_category_model = this.getdemandinfo['category_list'].find(item => item.id == model.first_category);
                              let category_model = first_category_model['child_category'].find(item=>item.id == category_id);
                              let category_workload_unit = [];
                              if(category_model.workload_unit_ids[0] == '0'){
                                category_workload_unit = this.getdemandinfo['workload_unit_list']
                              }else{
                                for(let workload_unit of this.getdemandinfo['workload_unit_list']){
                                  if(category_model.workload_unit_ids.indexOf(workload_unit.value.toString()) == -1){
                                      continue;
                                  }
                                  category_workload_unit.push(workload_unit)
                                }
                              }
                              // 设置下拉参数
                              const options = category_workload_unit.map(res => {
                                return {
                                  label: res.label,
                                  value: res.value + '',
                                  is_show_thing_cost: res.is_show_thing_cost+''
                                };
                              });

                              field.templateOptions.options = options;

                              if(options.length == 1){
                                field.formControl.setValue(options[0].value + '');
                              }else{
                                if(model.pre_workload_unit_id && options.find(item=>item.value == model.pre_workload_unit_id)){
                                  field.formControl.setValue(model.pre_workload_unit_id + '');
                                }else{
                                  field.formControl.setValue(null);
                                }
                              }
                            }

                            // 当类别发生改变时, 重新设置默认值
                            from.parent.get('category_id').valueChanges.subscribe(category_id => {
                              changeOptions(category_id)
                            });
                            changeOptions(model.category_id)
                          }
                        },
                      },

                      {
                        key: 'expected_expenditure',
                        type: 'nz-input',
                        wrappers: ['empty-wrapper'],
                        defaultValue: 0,
                        templateOptions: {
                          nzSize: 'small',
                          label: '预计花费',
                          nzRequired: true,
                        },
                        lifecycle: {
                          onInit: (from, field: FormlyFieldConfig,model) => {
                            from.parent.get('expected_expenditure').valueChanges.pipe(debounceTime(1000)).subscribe(data=>{
                              if(model.is_show_thing_cost == '1' && model['expected_expenditure'] != "" && !this.isNumeric(model['expected_expenditure'])){
                                this.message.error('请输入数字');
                                field.formControl.setValue("0")
                              }
                              if(this.isNumeric(model['expected_expenditure'])){
                                field.formControl.setValue(parseFloat(model['expected_expenditure']).toFixed(2))
                              }
                            });

                            merge(
                              from.parent.get('category_id').valueChanges,
                              from.parent.get('produce_breakdowns').valueChanges,
                              from.parent.get('pre_workload_unit_id').valueChanges,
                              from.parent.get('pre_produce_grade_id').valueChanges,
                            ).subscribe(data => {
                              let self_grade_list = this.getdemandinfo['produce_breakdown_grade_list'].find(res => res.id == from.parent.get('category_id').value)
                              for(let i in data){
                                let cur_grade_list = self_grade_list['produceBreakdowns'].find(res=>res.produce_grade_id == from.parent.get('pre_produce_grade_id').value && res.workload_unit_id == data[i].workload_unit_id && res.value == data[i].id)
                                if(cur_grade_list){
                                  data[i].unit_price = cur_grade_list.unit_price;
                                }
                              }

                              let thing_price = 0;
                              const model = JSON.parse(JSON.stringify(field.model));
                              model.pre_produce_grade_id = from.parent.get('pre_produce_grade_id').value;
                              model.pre_workload_unit_id = from.parent.get('pre_workload_unit_id').value;

                              setTimeout(() => {
                                let workload_info = this.getdemandinfo['workload_unit_list'].find(item=>item.value==model.pre_workload_unit_id)
                                if(workload_info){
                                  from.parent.get('is_show_thing_cost').setValue(workload_info['is_show_thing_cost']);
                                  if(workload_info['is_show_thing_cost'] == "0"){
                                    field.formControl.setValue("NA")
                                  }
                                }
                              }, 50);

                              let workload_info = this.getdemandinfo['workload_unit_list'].find(item=>item.value==model.pre_workload_unit_id)
                              if(workload_info){
                                from.parent.get('is_show_thing_cost').setValue(workload_info['is_show_thing_cost']);
                                if(workload_info['is_show_thing_cost'] == "0"){
                                  field.formControl.setValue("NA")
                                }
                              }

                              if (model.price_type == '1') {
                                thing_price = model.unit_price;
                              } else if (model.price_type == '2') {
                                thing_price =
                                    model.produce_breakdowns ?
                                        model.produce_breakdowns.map(res => {
                                              // const unit_price =
                                              // this.getdemandinfo['price_library_list'].find(value =>
                                              //     value.produce_breakdown_id == res.id + ''     // 明细相等
                                              //     && value.workload_unit_id == res.pre_workload_unit_id + ''  // 单位相等
                                              //     && value.category_id == model.category_id + ''  // 品类相等
                                              //     && (value.produce_grade_id == model.pre_produce_grade_id + '' || value.produce_grade_id =='0' ));
                                                return res.unit_price && res.value ? Number(res.unit_price) * Number(res.value) : 0;
                                              }).reduce((total, num) => {
                                                  return Number(total) + Number(num);
                                              })  : 0;
                              } else if (model.price_type == '3') {
                                //console.log('33333')
                                const total_price =
                                    model.produce_breakdowns ?
                                        model.produce_breakdowns.map(res => {
                                          // const unit_price =
                                          //       this.getdemandinfo['price_library_list']
                                          //           .find(value =>
                                          //             value.category_id == model.category_id + ''
                                          //             && value.produce_breakdown_id == res.id + ''
                                          //             && (value.produce_grade_id == model.pre_produce_grade_id + '' || value.produce_grade_id == '0')
                                          //             && value.workload_unit_id == res.pre_workload_unit_id + '' );

                                            return res.unit_price && res.value ? Number(res.unit_price) * Number(res.value) : 0;
                                        }).reduce((total, num) => {
                                          return Number(total) + Number(num);
                                        }) : 0;

                                        const number = model.pre_workload ? Number(model.pre_workload) : 1;
                                        thing_price = Number(total_price) * Number(number);
                              } else {
                                thing_price = 0;
                              }
                              thing_price = thing_price ? thing_price : 0;
                              field.formControl.patchValue(thing_price);

                              if(workload_info){
                                if(workload_info['is_show_thing_cost'] == '0'){
                                  field.formControl.setValue("NA")
                                }
                              }
                            })
                            if(model.is_show_thing_cost == '0'){
                              field.formControl.setValue("NA")
                            }
                          }
                        },
                        expressionProperties:{
                          'templateOptions.disabled': "!model.is_show_thing_cost",
                        },
                        hideExpression: (model, formState) => {
                          return formState.userRoleLevel == '1';
                        }
                      },
                      {
                        key: 'expected_complete_date',
                        type: 'date-picker',
                        wrappers: ['empty-wrapper'],
                        defaultValue: addDays(this.today, 7) ,
                        templateOptions: {
                          label: '期望完成日期',
                          nzSize: 'small',
                          nzRequired: true,
                          nzDisabledDate: (current: Date) => {
                            return differenceInCalendarDays(current, this.today) < 0;
                          }
                        }
                      },
                      {
                        key: 'is_test',
                        type: 'nz-switch',
                        wrappers: ['empty-wrapper'],
                        defaultValue: false,
                        templateOptions: {
                          label: '是否测试单',
                          nzCheckedChildren:"是",
                          nzUnCheckedChildren:"否",
                          nzRequired: true,
                        },
                        lifecycle: {
                          onInit: (from, field, model, options) => {
                            if(options.formState.test_list.indexOf(model.first_category) === -1){
                                field.formControl.setValue(false);
                                field.templateOptions.nzDisabled = true;
                            }
                          }
                        }
                      },
                      {
                        key: 'pre_supplier_id',
                        type: 'demand-presupplier-select',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '意向供应商',
                        },
                        lifecycle: {
                          onInit: (from, field, model, options) => {
                            // 获取类别, 动态改变等级的下拉选项
                            // 监听类别是否改变
                            from.parent.get('category_id').valueChanges.pipe(distinctUntilChanged()).subscribe(id => {
                              if (id && !options.formState.projectCategoryOptions[id]) {
                                this.http.get('web/supplier-shortlist/get-project-category', {
                                  params: {
                                    project_id: this.model.project_id,
                                    category_id: id,
                                    from: this.from,
                                    reqId: this.reqId,
                                  }
                                }).subscribe(result => {
                                  if (result['code'] == 0) {
                                    options.formState.projectCategoryOptions[id] = result['data']
                                    supplierSetDefalultValue();
                                  } else if (result['msg']) {
                                    this.message.error(result['msg']);
                                  }
                                }, (err) => {
                                  this.message.error('网络异常，请稍后再试');
                                });
                              } else if (options.formState.projectCategoryOptions[id]) {
                                supplierSetDefalultValue();
                              }
                            });

                            if (from.parent.get('category_id').value) {
                              const id = from.parent.get('category_id').value;
                              if (id && !options.formState.projectCategoryOptions[id]) {
                                this.http.get('web/supplier-shortlist/get-project-category', {
                                  params: {
                                    project_id: this.model.project_id,
                                    category_id: id,
                                    from: this.from,
                                    reqId: this.reqId,
                                  }
                                }).subscribe(result => {
                                  if (result['code'] == 0) {
                                    options.formState.projectCategoryOptions[id] = result['data'];
                                    supplierSetDefalultValue();
                                  } else if (result['msg']) {
                                    this.message.error(result['msg']);
                                  }
                                }, (err) => {
                                  this.message.error('网络异常，请稍后再试');
                                });
                              } else {
                                supplierSetDefalultValue();
                              }
                            }

                            merge(
                              from.parent.get('category_id').valueChanges,
                              from.parent.get('is_test') ? from.parent.get('is_test').valueChanges : of(null),
                              from.parent.get('pre_produce_grade_id').valueChanges,
                            ).pipe(debounceTime(20)). subscribe(result => {
                              supplierSetDefalultValue();
                            })

                            function supplierSetDefalultValue() {

                              if (options.formState.projectCategoryOptions[model.category_id]) {
                                field.templateOptions.pre_supplier_options = options.formState.projectCategoryOptions[model.category_id].filter(item => {
                                  return ( model.pre_produce_grade_id == undefined
                                            || item.gradeId.length == 0
                                            || item.gradeId.some(id => id == model.pre_produce_grade_id)
                                         ) && item.is_test.some(id => id == model.is_test);
                                });


                                // if (field.templateOptions.options instanceof Array &&
                                //     !field.templateOptions.options.some(item => item.value === field.formControl.value)) {
                                //   field.formControl.setValue(null);
                                // } else {
                                //   field.formControl.setValue(field.formControl.value);
                                // }
                              }
                            }
                          }
                        },
                      },
                      {
                        key: 'remark',
                        type: 'nz-textarea',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '备注',
                          nzRow: 2,
                          nzSize: 'small',
                          maxlength: 200,
                          nzPlaceHolder: '限制200字以内，采购经理及审核人可见，供应商不可见'
                        }
                      },
                      {
                        key: 'thumb_attachment_id',
                        type: 'nz-avatar-uploader',
                        wrappers: ['empty-wrapper'],
                        templateOptions: {
                          label: '展示作品',
                          nzMultiple:  false,
                          nzLimit: 1,
                          objtype: 1800
                        },
                        lifecycle: {
                          onInit: (from, field: FormlyFieldConfig) => {
                            if (field.formControl.value) {
                              field.formControl.setValue(field.formControl.value);
                            }
                          }
                        },
                        hideExpression: (model, formState) => {
                          return formState.userRoleLevel == '2';
                        }
                      },
                    ]
                  }
                },

              ]
            },



          },





        ]
      }
    ];


  }

  ngOnInit() {    
    this.route.params.subscribe(params => {
      let data = {};

      if (params) {
        data = {
          params: {
            story_id: params['storyId'] || 0,
            from: this.from,
            reqId: this.reqId
          }
        };
        this.story_id =  params['storyId'] || 0;
        this.model.story_id = this.story_id;
        this.options.formState.isEdit = this.story_id ? true : false;
      }
      this.http.get('web/demand/create-demand-plus', data).subscribe( response => {
        this.model.product_type_plus = response['data']['demand']['product_type']
        //console.log(this.model.product_type_plus) 
      })
      this.http.get('web/demand/create-demand-plus', data).subscribe( response => {
        if (response['code'] == 0) {
          this.model.product_type = response['data']['demand']['product_type']
         
          this.getCreateDemandInfo = response['data'];
          //console.log(this.model.product_type)                    
          //this.model.product_type = this.getCreateDemandInfo['demand']['product_label']

          // 设置默认值
          this.story_code = response['data']['demand']['story_code'];

          this.is_demand_edit = response['data']['demand']['is_demand_edit'];
          this.model.is_demand_edit = this.is_demand_edit;
          // 费用类型的下拉列表
          this.initFormFields()

          // 选择费用类型的下拉参数
          const user_role_level = this.formFields[0].fieldGroup.find(item => item.key == 'user_role_level');
          user_role_level.templateOptions.options = this.getCreateDemandInfo['user_role_level'];
          if(this.getCreateDemandInfo['user_role_level'].length > 1 || this.getCreateDemandInfo['user_role_level'][0].value === '2') {
            user_role_level.defaultValue = '2'
            this.options.formState.userRoleLevel = '2';
            const options = this.getCreateDemandInfo['project_list'].filter(item => item.category_type == '2');

            this.options.formState.project_list = options;
            this.model.story_id = this.story_id;

            this.formFields[0].fieldGroup.find(item => item.key == 'user_role_level').defaultValue = '2';
            this.formFields[0].fieldGroup.find(item => item.key == 'project_id').defaultValue = options.length === 1 ? options[0].value : null;
            this.formFields[0].fieldGroup.find(item => item.key == 'is_demand_edit').defaultValue = true;
            this.formFields[0].fieldGroup.find(item => item.key == 'first_category_list').defaultValue = [];
          } else if(this.getCreateDemandInfo['user_role_level'].length === 1 && this.getCreateDemandInfo['user_role_level'][0].value === '1') {
            this.isVisible = true;
          }
          const user_option = this.getCreateDemandInfo['user_role_level'];

          // 如果项目类型只有一个下拉参数
          if (!this.story_id && user_option && user_option.length == 1) {
            this.model.user_role_level = this.getCreateDemandInfo['user_role_level'][0].value;
            this.options.formState.userRoleLevel = this.model.user_role_level;

            user_role_level.hide = true;

            const project_id = this.formFields[0].fieldGroup.find(item => item.key == 'project_id');
            const project_option = this.getCreateDemandInfo['project_list']
                                       .filter(item => item.category_type == this.model.user_role_level);

            this.options.formState.project_list = this.getCreateDemandInfo['project_list']
                                                        .filter(item => item.category_type == this.model.user_role_level);

            // 如果项目只有一个, 则默认选中
            if (project_option && project_option.length == 1) {
              this.project_id = project_option[0].value;
              this.model.project_id = this.project_id;
            }
          }

          // 如果是编辑状态
          if (this.model.story_id) {
            // 用户角色
            this.model.user_role_level = response['data']['demand']['user_role_level'];
            this.options.formState.userRoleLevel = this.model.user_role_level;
            this.options.formState.story_id = this.model.story_id;

            // 项目id
            this.project_id = this.getCreateDemandInfo['demand']['project_id'];
            this.model.project_id = this.project_id;

            const project_id = this.formFields[0].fieldGroup.find(item => item.key == 'project_id');
            project_id.templateOptions.options = this.getCreateDemandInfo['project_list']
                                                      .filter(item => item.category_type == this.model.user_role_level);
          }
          this.isAuth = true;
          this.isRenderForm = true;


          //console.log(this.model.product_type)
          // this.options.formState.product_type = this.getCreateDemandInfo['product_label']['product_type'];
          // this.options.formState.design_engine = this.getCreateDemandInfo['product_label']['design_engine'];
          // this.options.formState.art_style = this.getCreateDemandInfo['product_label']['art_style'];
          // this.options.formState.area_style = this.getCreateDemandInfo['product_label']['area_style'];
          // this.options.formState.theme_element = this.getCreateDemandInfo['product_label']['theme_element'];

        } else {
          if (response['code'] == -2) {
            this.router.navigateByUrl('/query/storyExtend?story_code=' + response['story_code']);
          } else  {
            this.isAuth = false;
            this.isAuthErrorMsg = response['msg'];
          }
        }
      });
    });
  }

  fileDrop (e) {
    e.preventDefault();
    e.dataTransfer.effectAllowed = 'linkMove';
  }


  // 项目选择下拉发生改变
  onModelChange (project_id = null) {
    this.project_id = project_id;
    if (project_id && !this.loading) {
      this.loading = true;
      this.options.formState.manager_list = [];
      this.options.formState._manager_list = [];
      this.options.formState._brand_manager_list = [];
      this.options.formState.brand_manager_list = [];
      this.options.formState.budget_type_list = [];
      const messageId = this.message.loading('正在获取立项信息...', { nzDuration: 0 }).messageId
      this.http.get('/web/demand/get-demand-info-plus', {
        params: {
          'story_id': this.model.story_id ? this.model.story_id : '',
          'project_id': project_id,
          from: this.from,
          reqId: this.reqId
        },
        observe: 'response'
      }).subscribe(res => {
        if (res.body['code'] == 0) {
          if(res.body['msg']){
            this.message.error(res.body['msg']);
          }
         
          this.getdemandinfo = res['body']['data'];
          //console.log(this.getdemandinfo)

          this.options.formState.project_product_list =  this.getdemandinfo['project_product'];
          this.options.formState.test_list =  this.getdemandinfo['first_category_list']
                                                  .filter(item => item.is_test == '1').map(item => item.id);
          this.options.formState.property_list =  this.getdemandinfo['first_category_list']
                                                      .filter(item => item.is_property == '1').map(item => item.id);


          this.projectIdChange$.next(res['body']['data'])
          const model = {
            ...this.model,
            is_demand_edit:         this.is_demand_edit,
            project_id:             project_id,
            story_id:               this.model.story_id,
            product_name:           this.getdemandinfo['product_name'],
            story_code:             this.story_code,
            project_product_id:     this.getdemandinfo['project_product_id'] ?
                                        this.getdemandinfo['project_product_id']  :
                                            (this.options.formState.project_product_list && this.options.formState.project_product_list.length == 1 ? this.options.formState.project_product_list[0].value : null ),
            project_group_name:     this.getdemandinfo['project_group_name'],
            budget_price:           this.getdemandinfo['demand']['budget_price'],
            brand_principal:        this.getdemandinfo['brand_principal']['label'],
            story_name:             this.getdemandinfo['demand']['story_name'],
            brand_available:      this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]
                                  && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_available']
                                    ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_available']
                                    : 0,
            brand_budget:         this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]
                                    &&  this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_budget']
                                      ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_budget']
                                      : 0,

            product_available:    this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]
                                    && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_available']
                                      ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_available']
                                      : 0,

            product_budget:       this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]
                                    && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_budget']
                                      ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_budget']
                                      : 0,


            total_budget:          this.getdemandinfo['demand']['total_budget'],
            use_budget:            this.getdemandinfo['demand']['budget_available'],



            project_role:           this.getdemandinfo['project_role'],
            cost_center_code:       this.getdemandinfo['demand']['cost_center_code'],
            manager_id:             this.getdemandinfo['demand']['manager_id'] ,
            budget_type:            this.getdemandinfo['demand']['budget_type'] ?
                                        this.getdemandinfo['demand']['budget_type'] :
                                            (this.getdemandinfo['budget_type_id'] ? this.getdemandinfo['budget_type_id']
                                              : (this.options.formState.budget_type_list
                                                  && this.options.formState.budget_type_list.length == 1
                                                    ? this.options.formState.budget_type_list[0].value : null )),
            attachment_id:          this.getdemandinfo['demand']['attachment_id'],
            story_remark:           this.getdemandinfo['demand']['remark'],
            //product_type:           this.getdemandinfo['demand']['product_type'],
            design_engine:          this.getdemandinfo['demand']['design_engine'],
            art_style:              this.getdemandinfo['demand']['art_style'],
            area_style:             this.getdemandinfo['demand']['area_style'],
            theme_element:          this.getdemandinfo['demand']['theme_element'],
            brand_manager:          this.getdemandinfo['demand']['brand_manager'],
            brand_group_leader:     this.getdemandinfo['demand']['brand_group_leader'],
            related_reviewer:       this.getdemandinfo['demand']['related_reviewer'],
            first_category_list:    [],
          };
          //产品标签赋值

          //model.product_type = this.getCreateDemandInfo['demand']['product_label']
          //console.log(model.product_type)
          //console.log(this.model.product_type)
          //this.model.product_type_plus=this.getCreateDemandInfo['demand']['product_label']
          //console.log( this.model.product_type_plus)
          if (this.getdemandinfo['project_cost_center'] instanceof Array) {
            this.options.formState.cost_center_options = this.getdemandinfo['project_cost_center'].map(item => {
              return {
                value: item.cost_center_code,
                label: item.cost_center_name,
                id: item.id
              };
            });
            if (this.getdemandinfo['project_cost_center'].length == 1) {
              model.cost_center_code = this.getdemandinfo['project_cost_center'][0]['cost_center_code'];
            }
          }

          this.is_not_demand_audit = res['body']['data']['is_not_demand_audit'];

          // 如果是编辑
          if (this.model.story_id) {
            this.http.post('/web/demand/thing-list', {
              story_id: this.model.story_id,
              project_id: this.model.project_id,
              first_category_id:  this.getdemandinfo['first_category_id'],
              from: this.from,
              reqId: this.reqId
            }).subscribe( res => {
              if (res['code'] == 0) {
                //console.log(this.model.product_type_plus)
                console.log(res)
                res['data']= res['data'].map((item)=>{
                  if(item.title=='3D&动效'&&item.product_type&&item.product_type.length==0||item.title=='2D&平面'&&item.product_type&&item.product_type.length==0){
                    item.product_type=this.model.product_type_plus
                  }else if(item.title!='3D&动效'&&item.title!='2D&平面'){
                    item.product_type=[]
                  }else if(item.title=='3D&动效'&&!item.product_type||item.title=='2D&平面'&&!item.product_type){
                    item.product_type=this.model.product_type_plus
                  }
                  return item
                })
                console.log(res)
                this.model = Object.assign({}, this.model, {...model, first_category_list: JSON.parse(JSON.stringify(res['data']))})
                this.options.resetModel(this.model);
                this.options.updateInitialValue();
                
                

                if (res['data'].length > 0 && res['data'][0]['thing_list'].length > 0) {
                 
                  this.model.painter_name = res['data'][0]['thing_list'][0]['painter_name'];
                  //this.model.product_type = res['data'][0]['thing_list'][0]['demand_type'];
                  //console.log(this.model.product_type,res['data'][0].id)
                  if(res['data'][0].id=='331'||res['data'][0].id=='338'){                      
                      this.model.product_type_hide=false
                  }
                }
               /*  if(res['data'].length > 0){
                  res['data'].map((item)=>{
                    if(isArray(item.product_data)){
                      //if(item.product_data.length>0){
                        this.model.product_type=item.product_data
                        console.log(this.model.product_type,this.model.product_type_hide)
                      //}
                    }
                  })
                } */
              }
            });
          } else {
            const newModel = Object.assign({}, this.model, model);
            this.options.resetModel(newModel);
          }
        } else {
          this.message.error(res.body['msg']);
          const newModel = Object.assign({}, {
            user_role_level: this.model.user_role_level,
            project_id: project_id,
            is_demand_edit: this.is_demand_edit,
            first_category_list: []
          });
          this.options.resetModel(newModel);
          this.projectIdChange$.next(null);
        }
        this.loading = false;
        this.message.remove(messageId);
      }, err => {
        this.message.remove(messageId);
      });
    } else {
      setTimeout(() => {
        const newModel = Object.assign({}, {
          user_role_level: this.model.user_role_level,
          project_id: null,
          is_demand_edit: this.is_demand_edit,
          first_category_list: []
        })
        this.options.resetModel(newModel);
        this.projectIdChange$.next(null);
      }, 100);
    }
  }

  // 校验是否必填
  formRequired (fields) {
    let error = false;
    if (fields instanceof Array) {
      fields.map(field => {
        // else if(field.key === 'thing_name' && this.containSpecial(field.formControl.value)){
        //   error = true
        //   field.templateOptions.nzValidateStatus = 'error';
        //   field.templateOptions.nzErrorTip = '不能包括特殊字符';
        // }
        if (field.key === 'thing_name' && this.checkRepeat(field.formControl.value)) {
          error = true
          field.templateOptions.nzValidateStatus = 'error';
          field.templateOptions.nzErrorTip = '为了避免重复提单，按照风控要求，同一项目、同一品类，物件名称不可与历史单据重复';
        } 
        else{
          field.templateOptions.nzValidateStatus = '';
          field.templateOptions.nzValidateText = '';
        }

        if (field.fieldGroup && field.fieldGroup instanceof Array) {
          if (this.formRequired(field.fieldGroup)) {
            error = true
          }
        }
      })
    }
    return error;
  }

  // 重复坚持
  checkRepeat (name) {
    let thing_name = []
    thing_name = [...this.thingNameOld]
    if (this.model && this.model.first_category_list) {
      this.model.first_category_list.forEach(item => {
        if (item && item.thing_list) {
          item.thing_list.forEach(thing => {
            if(typeof(thing.thing_name) == 'undefined'){
              return;
            }
            thing_name.push(thing.thing_name.trim())
          });
        }
      });
    }
    return thing_name.filter(n =>  n === name).length >= 2
  }

  save(isSubmit = false) {       
    //console.log(this.model)
    if (this.formRequired(this.formFields)) {
      this.message.error('为了避免重复提单，按照风控要求，同一项目、同一品类，物件名称不可与历史单据重复。请留意物件名称下方提示信息进行修改');
      return
    }


    this.isSaveLoading = true;
    this.message.isAllLoading = true;
    let isAllrequired = true;

    // 项目名称不能为空
    if (!this.model.project_id) {
        this.message.error('项目名称未填，请先填写完整');

        this.isSubmitLoading = false;
        this.message.isAllLoading = false;
        this.isSaveLoading = false;
        return;
    }

    // 项目名称不能为空
    if (!this.model.story_name) {
        this.message.error('需求名称未填，请先填写完整');

        this.isSubmitLoading = false;
        this.message.isAllLoading = false;
        this.isSaveLoading = false;
        return;
    }

    // 营销推广费用才有立项信息判断
    if (this.model.user_role_level === 2) {
      if (!this.model.project_product_id) {
        this.message.error('立项信息未填，请先填写完整');
        this.isSubmitLoading = false;
        this.message.isAllLoading = false;
        this.isSaveLoading = false;
        return;
      }
    }

    if(this.getdemandinfo['project_product'].length == 1 && this.getdemandinfo['project_product'].filter(item=>item.value===this.model.project_product_id && item.nzDisabled===true).length != 0){
      this.message.error('立项信息当前为状态不可选【已冻结/已失效】');
      this.isSubmitLoading = false;
      this.message.isAllLoading = false;
      this.isSaveLoading = false;
      return;
    }

    //  物件数量不能为空
    this.model.first_category_list.map((item1, index1) => {
      
      item1.thing_list.map((item2, index2) => {
        if (!item2.thing_name) {
          this.message.error('物件名称未填，请先填写完整');

          this.isSubmitLoading = false;
          this.message.isAllLoading = false;
          this.isSaveLoading = false;
          isAllrequired = false;
          return false;
        }

        if (item2.thing_name && item2.thing_name.length > 120) {
          this.message.error('物件名称' + item2.thing_name  + '超过了128个字符');

          this.isSubmitLoading = false;
          this.message.isAllLoading = false;
          this.isSaveLoading = false;
          isAllrequired = false;
          return false;
        }

        if(item2.thing_name && this.containSpecial(item2.thing_name)){
          this.message.error('物件名称不能包括特殊字符');

          this.isSubmitLoading = false;
          this.message.isAllLoading = false;
          this.isSaveLoading = false;
          isAllrequired = false;
          return false;
        }

        if (item2.price_type == '4' || item2.price_type == '3') {

          if (!item2.pre_workload) {
            this.message.error(item2.thing_name  + ': 物件数量未填，请先填写完整');

            this.isSubmitLoading = false;
            this.message.isAllLoading = false;
            this.isSaveLoading = false;
            isAllrequired = false;
            return false;
          }
        } else if (!item2.produce_breakdowns || item2.produce_breakdowns && item2.produce_breakdowns.length == 0
                  || item2.produce_breakdowns && !item2.produce_breakdowns.some(item => item.value) ) {
          this.message.error(item2.thing_name + ': 物件数量未填，请先填写完整');
          this.isSubmitLoading = false;
          this.message.isAllLoading = false;
          isAllrequired = false;
          this.isSaveLoading = false;
          return false;
        }
      });
    });

    if (!isAllrequired) {
      return;
    }
    //过滤不是2D或者3D类产品标签的数据
    
    /* for (var index = 0; index <  this.model.first_category_list.length; index++) {
      if(this.model.first_category_list[index].id=='331'||this.model.first_category_list[index].id=='338'){  
        this.model.first_category_list[index].product_type=this.model.product_type_plus 
        console.log(this.model.first_category_list[index].product_type) 
        console.log(this.model.first_category_list,this.model.product_type_plus,this.model.product_type )                     
        //this.model.product_type= this.model.product_type_plus 
        this.model.product_type_hide=false                
     }
    }   */
    
    
    // 保存需求
   /*  this.model.first_category_list=this.model.first_category_list.map((item)=>{
      if(item.id=='331'||item.id=='338'){
         item.product_type=this.model.product_type_plus        
         return item
      }
      return item
    }) */
/*      this.model.first_category_list.forEach((item)=>{
      if(item.id=='331'&&item.id=='338'){
        item.product_type=this.model.product_type                                
        return item
      }else if(item.id!='331'&&item.id!='338'){
        item.product_type=[]
        return item
      }
     return item
     })  */
 


    
    this.http.post('web/demand/save-content', {
      data: this.model,
      from: this.from,
      reqId: this.reqId
    }, {
      observe: 'response'
    }).subscribe(response => {
      //console.log(this.model)

      this.isSaveLoading = false;
      if (response['body']['code'] == 0) {
        this.model.story_id = response['body']['story_id'];
        this.options.formState.isEdit = this.model.story_id ? true : false;

        // 如果是保存
        if (!isSubmit) {
          this.message.isAllLoading = false;
          if (!this.model.first_category_list) {
            this.message.error('物件数据未填，不能提交，请先填写完整');
            this.isSubmitLoading = false;
            isAllrequired = false;
            return false;
          }
          if (this.model.first_category_list.length == 0) {
            this.message.error('物件数据未填，不能提交，请先填写完整');
            this.isSubmitLoading = false;
            isAllrequired = false;
            return false;
          }
          this.message.success('保存成功');
        }

        if (!isAllrequired) {
          this.message.isAllLoading = false;
          this.isSubmitLoading = false;
          isAllrequired = false;
          return;
        }

        // 保存物件

        
        this.http.post('/web/demand/thing-list', {
          story_id: this.model.story_id,
          project_id: this.model['project_id'],
          from: this.from,
          reqId: this.reqId,
          first_category_id:  this.getdemandinfo['first_category_id']
        }).subscribe(res => {  
          //console.log(res['data']) 
         
          let old_first_category_list = JSON.stringify(this.model.first_category_list)
          old_first_category_list = JSON.parse(old_first_category_list) 
         
                            
        this.options.resetModel({...this.model, first_category_list: JSON.parse(JSON.stringify(res['data']))}); 
                                                                                                                            
      /*   res['data'].forEach((item)=>{           
          JSON.parse(JSON.stringify(old_first_category_list))
              .forEach((idm)=>{              
                if(item.id!='331'&&item.id!='338'){
                  item.product_type=[]                
                  return item
                }else{
                  item.product_type=idm.product_type                                
                  return item
                }                        
           })                        
         })    */
          
          

          let old_thing_list = []
          for(let i of old_first_category_list){
              for(let ii of i['thing_list']){
                old_thing_list.push(ii)
              }
          } 
          this.model.first_category_list.forEach((item, index) => {
            item['thing_list'].forEach((thing, thingIndex) => {
              let old_thing = old_thing_list.find(item=>item.thing_name == thing.thing_name)
              thing['is_show_thing_cost'] = old_thing['is_show_thing_cost']
              thing['expected_expenditure'] = old_thing['expected_expenditure']
            });
          });     
                  
                                                                                                                             
         /*  this.model.first_category_list.forEach((item)=>{           
            JSON.parse(JSON.stringify(old_first_category_list))
                .forEach((idm)=>{
                if(item.id!='331'&&item.id!='338'){
                  //item.product_type=[]               
                  return item
                }else{
                 // item.product_type=idm.product_type
                  //this.model.product_type=idm.product_type                 
                  return item
                }                                          
                //this.model.product_type=idm.product_type
                ///return item          
             })                        
           })  
           this.model.first_category_list=JSON.parse(JSON.stringify(this.model.first_category_list)) */
           //console.log(this.model.first_category_list)
          // 如果是提交
          if (isSubmit) {

            if (!this.uploadStatus) {
              this.message.error('需求附件上传失败或还在上传，请上传成功后再次提交!');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              isAllrequired = false;
              return false;
            }

            let submitUrl = '';
            this.message.isAllLoading = true;
            // 共有字段校验
            if (!this.model.story_name) {
              this.message.error('需求名称未填，请先填写完整');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              isAllrequired = false;
              return false;
            }
            if(this.model.story_name){
              if(this.containSpecial(this.model.story_name)){
                this.message.error('需求名称不能含特殊字符');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                isAllrequired = false;
                return false;
              }
            }
            if (!this.model.cost_center_code) {
              this.message.error('成本中心未填，请先填写完整');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              isAllrequired = false;
              return false;
            }

            let demandPrice = 0;

            if (this.model.user_role_level == 2) {
              // 设计制作进入
              // 判断预算是否够用
              submitUrl = 'web/demand/submit';

              if (this.model.budget_type == 1) {
                if (parseFloat(this.model.budget_price) > parseFloat(this.model.brand_available)) {
                  this.message.error('品牌预算不足, 当前可用预算:' + this.model.brand_available);
                  this.isSubmitLoading = false;
                  isAllrequired = false;
                  this.message.isAllLoading = false;
                  return false;
                }
              } else if (this.model.budget_type == 2) {
                if (parseFloat(this.model.budget_price) > parseFloat(this.model.product_available)) {
                  this.message.error('产品预算不足, 当前可用预算:' + this.model.product_available );
                  this.isSubmitLoading = false;
                  this.message.isAllLoading = false;
                  isAllrequired = false;
                  return false;
                }
              } else {
                this.message.error('请选择预算类型');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                isAllrequired = false;
                return false;
              }
              if (!this.model.first_category_list) {
                this.message.error('物件数据未填，请先填写完整');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                isAllrequired = false;
                return false;
              }
              if (!this.model.project_product_id || this.model.project_product_id.toString() =='0') {
                this.message.error('立项信息未填，请先填写完整，没有立项信息请联系品牌负责人配置');
                this.isSubmitLoading = false;
                isAllrequired = false;
                this.message.isAllLoading = false;
                return false;
              }
              if(this.getdemandinfo['project_product'].length == 1 && this.getdemandinfo['project_product'].filter(item=>item.value===this.model.project_product_id && item.nzDisabled===true).length != 0){
                this.message.error('立项信息当前为状态不可选【已冻结/已失效】');
                this.isSubmitLoading = false;
                isAllrequired = false;
                this.message.isAllLoading = false;
                return false;
              }
              if (!this.model.manager_id) {
                this.message.error('经办人未填，请先填写完整');
                this.isSubmitLoading = false;
                isAllrequired = false;
                this.message.isAllLoading = false;
                return false;
              }
              // if (!this.model.budget_type) {
              //   this.message.error('使用预算为空，不能提交');
              //   this.isSubmitLoading = false;
              //   isAllrequired = false;
              //   this.message.isAllLoading = false;
              //   return false;
              // }
              // 用户是产品经理或者同时是品牌经理选择的是产品预算时，判断品牌经理是否选择
              if ((this.model.project_role == 2 || this.model.project_role == 3)
                    && this.model.budget_type == 2
                    && this.getdemandinfo['brand_manager_list'].length > 0) {
                if (this.model.brand_manager == '' || this.model.brand_manager.length == 0) {
                  this.message.error('请选择品牌经理');
                  this.isSubmitLoading = false;
                  isAllrequired = false;
                  this.message.isAllLoading = false;
                  return false;
                }
              }
              if (!this.model.brand_group_leader || this.model.brand_group_leader == '0') {
                this.isSaveLoading = false;
                this.message.isAllLoading = false;
                this.isSubmitLoading = false;
                isAllrequired = false;
                this.message.error('品牌组长不能为空');
                return false;
              }
              // if (!this.model.budget_price) {
              //   this.message.error('需求预算不能为空');
              //   this.isSubmitLoading = false;
              //   isAllrequired = false;
              //   this.message.isAllLoading = false;
              //   return false;
              // }

              let thing_error = '';

              this.model.first_category_list.forEach((item, index) => {
                if (item['category_price']) {
                  demandPrice += parseFloat(item['category_price']);
                }
                item['thing_list'].forEach((thing, thingIndex) => {
                  if (!thing['expected_expenditure'] || (thing['expected_expenditure'] == 0 && thing['is_show_thing_cost'] != 0)) {
                    thing_error += thing['thing_name'] + ': 预计花费未填，请先填写完整<br />';
                  }

                  if (!thing['expected_complete_date']) {
                    thing_error += thing['thing_name'] + ': 期望完成日期未填，请先填写完整<br />';
                  }

                  thing.attribute && thing.attribute.map((item3, index3) => {
                    if (item3.attr_type == '1') {
                      if (item3.form_num == '1') {
                        if (item3.value === null && item3.is_required === '1') {
                          this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                          this.isSubmitLoading = false;
                          this.message.isAllLoading = false;
                          isAllrequired = false;
                          return false;
                        }

                      } else {
                        if (item3.options && item3.options.some(item => item.value === null) && item3.is_required === '1') {
                          this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                          this.isSubmitLoading = false;
                          this.message.isAllLoading = false;
                          isAllrequired = false;
                          return false;
                        }

                        if (item3.options
                          && item3.options.some(item => item.value == null)
                          && item3.options.some(item => item.value != null)) {
                          this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                          this.isSubmitLoading = false;
                          this.message.isAllLoading = false;
                          isAllrequired = false;
                          return false;
                        }
                      }
                    } else if (item3.attr_type === '2') {
                      if (item3.value === null && item3.is_required === '1') {
                        this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                        this.isSubmitLoading = false;
                        this.message.isAllLoading = false;
                        isAllrequired = false;
                        return false;
                      }
                    }
                  });

                });

              });

              if (thing_error !== '') {
                isAllrequired = false;
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                this.message.error(thing_error);
                return false;
              }

            } else {
                // 内容类进入
                // 属性是否必填需要添加校验
                submitUrl = 'web/demand/submit-content';

                try {
                  this.model.first_category_list.map((item1, index1) => {
                    item1.thing_list.map((item2, index2) => {

                      if (!item2['expected_complete_date']) {
                        this.message.error(item2.thing_name + ': ' + '期望完成日期不能为空');
                        let thingErrorIndex = index2;
                        thingErrorIndex++;
                        isAllrequired = false;
                        this.isSubmitLoading = false;
                        this.message.isAllLoading = false;
                        return false;
                      }

                      item2.attribute && item2.attribute.map((item3, index3) => {
                        if (item3.attr_type == '1') {
                          if (item3.form_num == '1') {
                            if (item3.value === null && item3.is_required === '1') {
                              this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                              this.isSubmitLoading = false;
                              this.message.isAllLoading = false;
                              isAllrequired = false;
                              return false;
                            }

                          } else {
                            if (item3.options && item3.options.some(item => item.value === null) && item3.is_required === '1') {
                              this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                              this.isSubmitLoading = false;
                              this.message.isAllLoading = false;
                              isAllrequired = false;
                              return false;
                            }

                            if (item3.options
                                && item3.options.some(item => item.value == null)
                                && item3.options.some(item => item.value != null)) {
                              this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                              this.isSubmitLoading = false;
                              this.message.isAllLoading = false;
                              isAllrequired = false;
                              return false;
                            }
                          }
                        } else if (item3.attr_type === '2') {
                          if (item3.value === null && item3.is_required === '1') {
                            this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                            this.isSubmitLoading = false;
                            this.message.isAllLoading = false;
                            isAllrequired = false;
                            return false;
                          }
                        }
                      });
                    });
                  });
                } catch (error) {
                  console.log(error);
                }
            }

            if (!isAllrequired) {
              return;
            }

            const thing_id = [];

            this.model.first_category_list.forEach((item, index) => {
              item['thing_list'].forEach((thing, thingIndex) => {
                thing_id.push(thing['id']);
              });
            });

            if (this.model.first_category_list.length == 0) {
              this.message.error('物件数据未填，请先填写完整');
              this.isSubmitLoading = false;
              isAllrequired = false;
              this.message.isAllLoading = false;
              return false;
            }

            if (thing_id.length == 0) {
              this.message.error('物件数据未填，请先填写完整');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              isAllrequired = false;
              return false;
            }
            if (this.model.budget_type == 1) {
              if (demandPrice > parseFloat(this.model.brand_available)) {
                this.message.error('可用品牌预算不足');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                isAllrequired = false;
                return false;
              }
            } else if (this.model.budget_type == 2) {
              if (demandPrice > parseFloat(this.model.product_available)) {
                this.message.error('可用产品预算不足');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                isAllrequired = false;
                return false;
              }
            }

            if (!isAllrequired) {
              return;
            }

            this.http.post(submitUrl, {
              thing_id: thing_id,
              from: this.from,
              reqId: this.reqId
            }).subscribe(result => {
              this.message.isAllLoading = false;
              this.isSubmitLoading = false;
              this.isSaveLoading = false;
              if (result['code'] == 0) {
                this.router.navigateByUrl(result['jump_url']);
              } else if (result['msg']) {
                this.message.error(result['msg']);
              }
            }, (err) => {
              this.message.error('网络异常，请稍后再试');
              this.isSubmitLoading = false;
              this.isSaveLoading = false;
              this.message.isAllLoading = false;
            });
          }
        }, (err) => {
          this.message.error('网络异常，请稍后再试');
          this.isSaveLoading = false;
          this.message.isAllLoading = false;
        });
      } else {
        if (response['body']['code'] == -2) {
          this.model.story_id = response['body']['story_id'];
        } else if (response['body']['code'] == -11) {
          this.message.error('为了避免重复提单，按照风控要求，同一项目、同一品类，物件名称不可与历史单据重复请留意物件名称下方提示信息进行修改')
          this.thingNameOld = response['body']['data'].map(item => item.thing_name);
          this.formRequired(this.formFields);
        } else {
          this.message.error(response['body']['msg']);
        }

        this.isSaveLoading = false;
        this.message.isAllLoading = false;
        this.isSubmitLoading = false;
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.isSaveLoading = false;
      this.isSubmitLoading = false;
      this.message.isAllLoading = false;
    });
  }

  submit() {
    this.save(true);
  }
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  // 获取意向CP
  getSupplierByCategory(categoryId) {
    const key = this.model.project_id + '_' + categoryId;
    // 是否已有对应意向供应商列表
    if (this.supplierObj[key]) {
      return;
    }
    this.http.get('web/supplier-shortlist/get-project-category', { params: {
      project_id: this.model.project_id,
      category_id: categoryId,
      from: this.from,
      reqId: this.reqId
    }}).subscribe(result => {
      this.isSubmitLoading = false;
      if (result['code'] == 0) {
        return this.supplierObj[key] = result['data'];
      } else if (result['msg']) {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  unbindStory(hint = true) {
    if (hint) {
      this.msgHint.isShow = true;
      this.msgHint.msg = `确认要【解除绑定】吗？`;
      return;
    } else {
      this.msgHint.isShow = false;
      this.msgHint.msg = '';
    }
    this.isUnbindStoryLoading = true;
    this.http.post('web/demand/unbind-story-relation', {
      story_id: this.model.story_id,
      from: this.from,
      reqId: this.reqId
    }).subscribe(result => {
      this.isUnbindStoryLoading = false;
      this.msgHint.isShow = false;
      if (result['code'] == 0) {
        this.message.success(result['msg']);
        setTimeout(() => {
          location.href = '/thing/createDemandExtend?from=' + this.from;
        }, 2000);
      } else {
        this.message.error(result['msg']);
        this.message.isAllLoading = false;
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.msgHint.isShow = false;
    });
  }
  handleOk() {
    window.open('http://iomc.oa.com', '_black')
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.onDestroy$) {
      this.onDestroy$.next();
      this.onDestroy$.complete();
    }

  }
  containSpecial(even) {
    // var flag = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]")
    var flag = new RegExp("[`~!@#$^&*()=|':;',\\[\\].<>《》/?~！@#￥……&*（）——|‘；：”“'。，、？]")
    if(flag.test(even)){
      return true;
    }else{
      return false;
    }
  }
}
