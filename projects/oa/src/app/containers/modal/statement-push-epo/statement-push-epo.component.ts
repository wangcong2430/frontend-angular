import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { BehaviorSubject, of, Subject, merge } from 'rxjs';
import { filter, debounceTime, takeUntil, map, distinctUntilChanged } from 'rxjs/operators';

import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-modal-statement-push-epo',
  templateUrl: './statement-push-epo.component.html',
  styleUrls: ['./statement-push-epo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StatementPushEpoModalComponent implements OnInit, OnDestroy {
  model$;
  thingIds;
  searchOaChange$ = new BehaviorSubject('');
  skipDialog;
  isVisible;
  isOkLoading;

  index = 0;
  timer = 0;  // 成功次数

  // 页面销毁
  onDestroy$ = new Subject<void>();
  isCategoryEmpty = false;
  // 弹窗关闭
  close$ = null;

  // formly
  form = new FormGroup({});
  model: any = {
    investments: [{
      contract_category_name: 1
    }]
  };
  messageId = null;
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
      vendor_site_options: [],    // 供应商服务品类
      org_list: [],               // 我方主体
      cost_center_options: [],    // 成本中心
      mba_resources: [] ,         // 物料选择
      choose_reason: [],          // 供应商选择方法
      receiver: [],               // 验收人
      handle_department: [],      // 经办部门
      handle_center: {},          // 经办中心
      mba_has_resources: [],       // 是否有物料选择
      tax_type_options: [],       // 税率类型
      tax_list_options: [],       // 税率值
      auto_payment_options: [],    // 是否自动发起付款
      new_epo_order_code: null    // EPO 订单号
     },
  };
  fields: FormlyFieldConfig[] = [
    {
      key: 'list',
      type: 'description-repeat',
      fieldArray: {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            key: 'contract_category_name',
            type: 'nz-label',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '合同类别',
              required: true,
            },
          },
          {
            key: 'tax_type',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '税率类型',
              required: true,

            },
            // expressionProperties: {
            //   'templateOptions.options': 'formState.tax_type_options',
            //   'templateOptions.disabled': 'model.new_epo_order_code',
            // },
            hideExpression: 'model.contract_tax_type != 2 ',
            lifecycle: {
              onInit: (form, field, model, options) => {
                field.templateOptions.options = options.formState.tax_type_options;
                field.templateOptions.disabled = model.new_epo_order_code;

                field.formControl.valueChanges
                  .pipe(takeUntil(this.close$))
                  .pipe(filter(x => x))
                  .pipe(debounceTime(120)).subscribe(type => {
                    if (type === '1') {
                      model.thing_tax_total_price = (Number(model.thing_total_price) * (1 + Number(model.tax_value))).toFixed(2);
                    } else if (type === '3') {
                      model.thing_tax_total_price = ( Number(model.thing_total_price) + Number(model.tax_value)).toFixed(2);
                    }
                });
              }
            }
          },
          {
            key: 'tax_value',
            type: 'nz-input',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '税率/税金',
              required: true,
            },
            hideExpression: 'model.tax_type == 1 || model.contract_tax_type != 2',
            // expressionProperties: {
            //   'templateOptions.disabled': 'model.new_epo_order_code',
            // },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;

                field.formControl.valueChanges
                  .pipe(takeUntil(this.close$))
                  .pipe(filter(x => x))
                  .pipe(debounceTime(120)).subscribe(value => {
                    if (model.tax_type === '3') {
                      model.thing_tax_total_price = ( Number(model.thing_total_price) + Number(value)).toFixed(2);
                    }
                });
              }
            }
          },
          {
            key: 'tax_value',
            type: 'nz-autocomplete',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '税率/税金',
              required: true,
            },
            // expressionProperties: {
            //   'templateOptions.disabled': 'model.new_epo_order_code',
            //   'templateOptions.options': 'model.tax_list_options',
            // },
            hideExpression: 'model.tax_type != 1 || model.contract_tax_type != 2',
            lifecycle: {
              onInit: (form, field, model, options) => {
                field.templateOptions.disabled = model.new_epo_order_code;
                field.templateOptions.options = model.tax_list_options;

                field.formControl.valueChanges
                  .pipe(takeUntil(this.close$))
                  .pipe(filter(x => x))
                  .pipe(debounceTime(120)).subscribe(value => {
                    if (model.tax_type === '1') {
                      model.thing_tax_total_price = (Number(model.thing_total_price) * (1 + Number(value))).toFixed(2);
                    }
                  });
              }
            }
          },
          {
            key: 'prepayments_status',
            type: 'nz-radio',
            className: 'ant-col-16 mr-3',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '是否有预付款',
              labelSpan: 8,
              nzRequired: true,
              nzValue: 'value',
              options: [
                {
                  label: '是',
                  value: '1'
                },
                {
                  label: '否',
                  value: '0'
                },
              ],
            },
          },
          {
            key: 'prepayments_amount',
            type: 'nz-input',
            className: 'ant-col-16 mr-3',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '预付款金额',
              labelSpan: 8,
              nzRequired: true,
              suffixTemplate: 'CNY',
              // placeholder: '预付款金额不可超过订单金额的30%'
            },
            expressionProperties: {
              'templateOptions.suffixTemplate': 'model.currency_symbol || "CNY"',
            },
            hideExpression: 'model.prepayments_status != "1"',
            lifecycle: {
              onInit: (form, field, model, options) => {
                field.templateOptions.suffixTemplate = model.currency_symbol || 'CNY'
                field.formControl.valueChanges.subscribe(value => {
                  let allPrice = model.thing_total_price;
                  // if (field.formControl.value > Number((Number(allPrice)  * 0.3).toFixed(3))) {
                  //   const currency_symbol = model.currency_symbol || 'CNY'
                  //   model.errMsg  = `预付款金额不可超过订单金额的30% (${(Number(allPrice)  * 0.3).toFixed(3)})${currency_symbol}`;
                  // } else {
                  //   model.errMsg = '';
                  // }
                  if(field.formControl.value && !Number(field.formControl.value)){
                    this.message.error("预付款请输入数字")
                    return;
                  }
                })
              }
            }
          },
          {
            key: 'org_id',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '我方主体',
              option: 'value',
              required: true,

            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;
                if(model.product_orgList){
                  field.templateOptions.options = model.product_orgList;
                }else{
                  field.templateOptions.options = options.formState.org_list;
                }
                /*if (!model.is_org_same) {
                  model.errMsg = '合同' + model.contract_number + '的我方主体与选择的我方主体不一致，如核实无误请继续推送EPO';
                }*/

                field.formControl.valueChanges
                  .pipe(takeUntil(this.close$))
                  .pipe(filter(x => x))
                  .pipe(distinctUntilChanged())
                  .pipe(debounceTime(120)).subscribe(id => {

                    if (model.is_overseas) {
                      if (id !== model.contract_org_id) {
                        //model.errMsg = '合同' + model.contract_number + '的我方主体与选择的我方主体不一致，如核实无误请继续推送EPO';
                      } else {
                        model.errMsg = '';
                      }
                    }



                    if (id) {
                      this.http.post('/web/order/check-order-company', {
                        supplier_id: model.supplier_id,
                        contract_id: model.contract_id,
                        thing_id: model.thing_id,
                        org_id: id,
                      }).subscribe(result => {
                        if (result['code'] === -1) {
                          model.orgIdMsg = result['msg']
                        } else {
                          model.orgIdMsg = ''
                        }
                        field.formControl.setValue(field.formControl.value);
                        this.cd.markForCheck();
                      })
                    }

                    this.cd.markForCheck();
                  });
              }
            }
          },
          {
            key: 'vendor_category_id',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              disable: true,
              label: '供应商服务品类',
              required: true,
              nzErrorTip: '',
              nzValidateStatus: '',
            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                field.templateOptions.disabled = model.new_epo_order_code || model.contract_type === 2;
                // 默认值
                if (model.vendor_site_list) {
                  const category_obj = {};
                  model.vendor_site_list
                    .filter(item => item.org_id === model.org_id)
                    .sort((a, b) => (a.is_default - b.is_default))
                    .map(item => {
                      return {
                        ...item,
                        value: item.category_id,
                        label: item.category_name
                      };
                    })
                    .map(item => { category_obj[item.category_id] = item; return item; });
                  if (Object.keys(category_obj).length == 0) {
                    this.isCategoryEmpty = true;
                  } else {
                    this.isCategoryEmpty = false;
                  }
                  field.templateOptions.options = Object.values(category_obj);
                }

                if (model.org_id && this.isCategoryEmpty) {
                  field.templateOptions.nzValidateStatus = 'error';
                  field.templateOptions.nzErrorTip = '未准入该主体或供应商品类被冻结，请到供应商管理系统核实。';
                } else {
                  field.templateOptions.nzValidateStatus = '';
                  field.templateOptions.nzErrorTip = '';
                }

                // 设置默认值
                form.parent.get('org_id').valueChanges
                  .pipe(filter(org_id => org_id))
                  .pipe(takeUntil(this.close$))
                  .pipe(distinctUntilChanged())
                  .subscribe(org_id => {
                    const category_obj = {};

                    if (model.vendor_site_list && model.vendor_site_list instanceof Array) {
                      model.vendor_site_list
                        .filter(item => item.org_id === org_id)
                        .sort((a, b) => (a.is_default - b.is_default))
                        .map(item => {
                          return {
                            ...item,
                            value: item.category_id,
                            label: item.category_name
                          };
                        })
                        .map(item => {
                          category_obj[item.category_id] = item;
                          return item;
                        });
                      field.templateOptions.options = Object.values(category_obj);
                    }

                    if (Object.keys(category_obj).length == 0) {
                      this.isCategoryEmpty = true;
                    } else {
                      this.isCategoryEmpty = false;
                    }

                    if ( field.templateOptions.options instanceof Array ) {
                      const vendor_category = field.templateOptions.options
                        .sort((a, b) => (b.vendor_site_state - a.vendor_site_state))
                        .find(item => item.is_default === '1' );

                      let vendor_category_id = org_id && vendor_category && vendor_category.category_id
                        ? vendor_category.category_id : null;

                      if (!vendor_category_id && field.templateOptions.options.length === 1) {
                        vendor_category_id = field.templateOptions.options[0].category_id;
                      }

                      field.formControl.patchValue(vendor_category_id);
                    }
                    if (this.isCategoryEmpty) {
                      field.templateOptions.nzValidateStatus = 'error';
                      field.templateOptions.nzErrorTip = '未准入该主体或供应商品类被冻结，请到供应商管理系统核实。';
                    } else {
                      field.templateOptions.nzValidateStatus = '';
                      field.templateOptions.nzErrorTip = '';
                    }
                  });
              }
            }
          },

          {
            key: 'vendor_site_id',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              disable: true,
              label: '供应商银行账号',
              required: true,
            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                field.templateOptions.disabled = model.new_epo_order_code || model.contract_type === 2;

                // 设置默认值
                if (model.vendor_site_list && model.vendor_site_list instanceof Array) {
                  field.templateOptions.options = model.vendor_site_list.filter(item => item.org_id === model.org_id
                    && item.category_id === model.vendor_category_id).map(item => {
                    return {
                      ...item,
                      label: item.account_number + item.account_name + item.account_bank,
                      value: item.vendor_site_id
                    };
                  });
                }

                form.parent.get('vendor_category_id').valueChanges
                  .pipe(takeUntil(this.close$))
                  .pipe(distinctUntilChanged())
                  .subscribe(category_id => {

                    if (model.vendor_site_list && model.vendor_site_list instanceof Array) {
                      field.templateOptions.options = model.vendor_site_list.filter(item => item.org_id === model.org_id
                        && item.category_id === category_id).map(item => {
                        return {
                          ...item,
                          label: item.account_number + item.account_name + item.account_bank,
                          value: item.vendor_site_id
                        };
                      });
                    }

                    if (field.templateOptions.options instanceof Array) {
                      const account  = field.templateOptions.options.find(item => item.vendor_site_state === '1');
                      let vendor_site_id = category_id && account && account.vendor_site_id ? account.vendor_site_id : null;

                      if (!vendor_site_id && field.templateOptions.options.length === 1) {
                        vendor_site_id = field.templateOptions.options[0].vendor_site_id;
                      }
                      field.formControl.patchValue(vendor_site_id);
                    }
                });
              }
            }
          },
          {
            key: 'mba_item_name',
            type: 'nz-label',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '物料选择',
            },
            hideExpression: '!model.mba_has_resources',
          },
          {
            key: 'cost_center_code',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '成本中心',
              required: true,
            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code || model.contract_type === 2;
                field.templateOptions.options = model.cost_center_options;
                let center = model.cost_center_options.find(item=>item.value==model.cost_center_code)
                if(center['disabled'] == true){
                  field.templateOptions.nzDisabled = true;
                }
              }
            }
          },
          {
            key: 'agent_id',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '经办人',
              required: true,
            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                field.templateOptions.disabled = model.new_epo_order_code;
                field.templateOptions.options = model.agent_options;
              }
            }
          },
          {
            key: 'handle_department',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '经办部门',
              required: true,

            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                field.templateOptions.disabled = model.new_epo_order_code;
                field.templateOptions.options = options.formState.handle_department;
              }
            }
          },
          {
            key: 'handle_center',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '经办中心',
              required: true,

            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;
                if (model.handle_department) {
                  field.templateOptions.options = options.formState.handle_center[model.handle_department];
                }
                form.parent.get('handle_department').valueChanges
                  .pipe(takeUntil(this.close$))
                  .pipe(distinctUntilChanged())
                  .pipe(filter(x => x))
                  .subscribe(department_id => {
                    field.templateOptions.options = options.formState.handle_center[department_id];
                    if (field.templateOptions.options instanceof Array
                        && !field.templateOptions.options.some(item => item.value === field.formControl.value)) {
                      field.formControl.patchValue(null);
                    }
                });
              }
            }
          },
          {
            key: 'select_supplier_reason',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '供应商选择方法',
              required: true,

            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;
                field.templateOptions.options = options.formState.choose_reason;
              }
            }
          },
          {
            key: 'epo_term_name',
            type: 'nz-label',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '付款类型',
            },
          },
          {
            key: 'receiver',
            type: 'nz-select',
            className: 'ant-col-16 mr-3',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '验收人',
              labelSpan: 8,
              autoSearch: false,
              nzRequired: true,
              nzServerSearch: true,
              // callback: (name: string) => this.http.get('web/user/search-names', {
              //     params: {enName: name}
              //   }).pipe(map((res: any) => {
              //     return res.data;
              //   })),
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
              // nzValue: 'option'
            },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;

                if (field.formControl.value) {
                  field.templateOptions.options = model.receiver_options;
                }

                if (form.parent.get('agent_id')) {
                  form.parent.get('agent_id').valueChanges
                  .pipe(takeUntil(this.close$))
                  .pipe(distinctUntilChanged())
                  .pipe(filter(x => x))
                  .subscribe(id => {

                    field.formControl.patchValue([])
                    field.templateOptions.options = []
                    this.http.get('web/user/get-handle-people', {
                      params: {
                        id: id
                      }
                    }).subscribe(result => {
                      if (result['code'] === 0) {

                        if (field.formControl.value.length === result['receiver'].length) {
                          result['receiver'] = [...result['receiver'], '-1']
                        }
                        // model. = result['handle_department'];+
                        field.formControl.setValue(result['receiver']);
                        if (form.parent.get('handle_department')) {
                          form.parent.get('handle_department').patchValue(result['handle_department']);
                        }
                        if (form.parent.get('handle_center')) {
                          form.parent.get('handle_center').patchValue(result['handle_center']);
                        }
                        field.templateOptions.options = result['receiver_options'];
                      } else {
                        this.message.error(result['msg']);
                      }
                      this.cd.markForCheck();
                    });
                  });
                }

              }
            }
          },
          {
            key: 'is_auto_payment',
            type: 'nz-radio',
            className: 'ant-col-12 mr-3',
            wrappers: ['empty-wrapper'],

            templateOptions: {
              label: '是否自动发起付款',

              require: true,
            },
            // expressionProperties: {
            //   'templateOptions.options': 'formState.auto_payment_options',
            //   'templateOptions.disabled': 'model.new_epo_order_code',
            // },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;
                field.templateOptions.options = options.formState.auto_payment_options;
              }
            }
          },
          {
            key: 'is_finish_check',
            type: 'nz-radio',
            className: 'ant-col-16 mr-3',
            wrappers: ['empty-wrapper'],
            defaultValue: false,
            templateOptions: {
              label: '最后一次验收',
              nzRequired : true,
              nzValue: 'value',
              labelSpan: 8,
              disabled: true,
              options: [
                {
                  value: true,
                  label: '是',
                },
                {
                  value: false,
                  label: '否'
                }
              ]
            }
          },
          {
            key: 'notice_crowd_id',
            type: 'nz-checkbox',
            className: 'ant-col-12 mr-3',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: '知会人',
              options: [
                {
                  label: '供应商商务',
                  value: 'cp',
                  checked: true
                },
                {
                  label: '采购经理',
                  value: 'spm',
                  checked: true
                },
                {
                  label: '采购助理',
                  value: 'spma',
                  checked: true
                }
              ]
            },
            // expressionProperties: {
            //   'templateOptions.disabled': 'model.new_epo_order_code',
            // },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;
              }
            }
          },
          {
            key: 'notice_crowd_ids',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            className: 'ant-col-12 mr-3',
            templateOptions: {
              label: '其他知会人',
              autoSearch: false,
              nzServerSearch: true,
              callback: (name: string) => this.http.get('web/user/search-names', {
                params: {enName: name}
              }).pipe(map((res: any) => {
                return res.data;
              })),
              nzShowSearch: true,
              nzMode: 'multiple',
              nzValue: 'option',
              nzPlaceHolder: 'NA',
              options: [],
            },
            // expressionProperties: {
            //   'templateOptions.options': 'formState.receiver',
            //   'templateOptions.disabled': 'model.new_epo_order_code',
            // },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;
                field.templateOptions.options = options.formState.receiver;
              }
            }
          },

          {
            key: 'memo',
            type: 'nz-textarea',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              require: true,
              disabled: true,
              nzPlaceHolder: '请输入不超过200字的订单说明，将只有采购经理和订单审批人可见',
              label: '合同/订单说明'
            },
            // expressionProperties: {
            //   'templateOptions.disabled': 'model.new_epo_order_code',
            // },
            lifecycle: {
              onInit: (form, field, model, options) => {
                // 初始化
                field.templateOptions.disabled = model.new_epo_order_code;
              }
            }
          },
        ],
        hideExpression: (model) => {
          return model.hide;
        }
      },
    },
  ];

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private  modalService: ModalService,
    private cd: ChangeDetectorRef,
    private modalServiceNz: NzModalService

  ) {}

  ngOnInit() {
    // 弹窗
    this.model$ = this.modalService.modal$
      .pipe(takeUntil(this.onDestroy$))
      .pipe(filter(item => item && item['key'] === 'statement-push-epo'))
      .subscribe((item: any) => {
        this.close$ = new Subject<void>();
        this.thingIds = item.data.thingIds;
        this.getConfig();
    });

    // 搜索
    this.searchOaChange$.asObservable()
      .pipe(debounceTime(200))
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((val) => {
        let options;
        options = {
          params: {
            'enName': val ? val : '',
          }
        };
    });


  }

  getConfig () {
    const loadingId = this.message.loading('正在生成待推送epo订单', { nzDuration: 0 }).messageId;
    this.http.post('web/acceptance-approval/wait-generate-dialog-new', {thing_id: this.thingIds}).subscribe(result => {
      this.message.remove(loadingId);
      if (result['code'] === 0) {
        this.isVisible = true;
        this.model = {
          list: result['data_list'].map((item, index) => {
            return {
              ...item,
              id: index + 1
            };
          })
        };

        this.options.formState.choose_reason        = result['config_data']['choose_reason'];
        this.options.formState.auto_payment_options = result['config_data']['auto_payment_options'];
        this.options.formState.cost_center_options  = result['config_data']['cost_center_options'];
        this.options.formState.mba_resources        = result['config_data']['mba_resources'];
        this.options.formState.org_options          = result['config_data']['org_options'];
        this.options.formState.vendor_site_list     = result['config_data']['vendor_site_list'];
        this.options.formState.receiver             = result['config_data']['receiver'];
        this.options.formState.mba_has_resources    = result['config_data']['mba_has_resources'];
        this.options.formState.org_list             = result['config_data']['org_list'];
        this.options.formState.tax_type_options     = result['config_data']['tax_type_options'];
        this.options.formState.handle_department    = result['config_data']['department_tree'].map(item => {
          return {
            label: item.name, value: item.id
          };
        });

        const obj = {};
        result['config_data']['department_tree'].map(item => {
          obj[item.id] = item.children ? item.children.map(item => {
            return {
              label: item.name,
              value: item.id
            };
          }) : [];
        });
        this.options.formState.handle_center = obj;
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, (err) => {
      this.message.remove(loadingId);
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }

  // 同步生成epo推送
  syncCreateEpoPushEpo () {
    this.http.post('/web/acceptance-approval/sync-create-epo-push-epo', {
      thing_id: this.thingIds,
    }).subscribe(result => {
      this.isVisible = false;
      if (result['code'] === 0) {
        this.message.success(result['msg']);
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.isVisible = false;
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  close () {
    this.isVisible = false;
    if (this.index) {
      this.modalService.complete('statement-push-epo');
    }
    this.close$.next();
    this.close$.complete();
    this.cd.markForCheck();
  }

  submit () {
    let valid = true;
    let errorShow = '';
    if (this.model.list && this.model.list instanceof Array) {
      this.model.list.filter(item => !item.new_epo_order_code).forEach(item => {
        if (!item.tax_type && item.contract_tax_type == 2) {
          this.message.error(item.project_name + ': 税率类型不能为空');
          item.errMsg = '税率类型不能为空';
          valid = false;
          return false;
        }
        if (!item.tax_value && item.tax_value !== '0' && item.contract_tax_type == 2) {
          this.message.error(item.project_name + ': 税率值不能为空');
          item.errMsg = '税率值不能为空';
          valid = false;
          return false;
        }
        if (!item.org_id) {
          this.message.error(item.project_name + ': 我方主体不能为空');
          item.errMsg = '我方主体不能为空';
          valid = false;
          return false;
        }
        if (!item.cost_center_code) {
          this.message.error(item.project_name + ': 成本中心不能为空');
          item.errMsg = '成本中心不能为空';
          valid = false;
          return false;
        }
        if (!item.handle_department) {
          this.message.error(item.project_name + ': 经办部门不能为空');
          item.errMsg = '经办部门不能为空';
          valid = false;
          return false;
        }
        if (!item.handle_center) {
          this.message.error(item.project_name + ': 经办中心不能为空');
          item.errMsg = '经办中心不能为空';
          valid = false;
          return false;
        }

        if (!item.select_supplier_reason) {
          this.message.error(item.project_name + ': 供应商选择方法不能为空');
          item.errMsg = '供应商选择方法不能为空';
          valid = false;
          return false;
        }

        if (!item.receiver) {
          this.message.error(item.project_name + ': 验收人不能为空');
          item.errMsg = '验收人不能为空';
          valid = false;
          return false;
        }

        if ( item.is_overseas && item.contract_org_id !== item.org_id && item.orgIdMsg) {
          errorShow += item.orgIdMsg;
        }
      });

      if (!valid) {
        return;
      }

      let warnInfo = ''
      if (errorShow) {
        warnInfo = errorShow;
      } else {
        if (this.model.list.some(item => item.orgIdMsg)) {
          warnInfo = this.model.list.find(item => item.orgIdMsg).orgIdMsg
        }
      }

      if (warnInfo) {
        this.modalServiceNz.create({
          nzTitle: '请确认信息',
          nzContent: warnInfo,
          nzClosable: false,
          nzOnOk: () => {
            if (!valid) {
              return;
            }

            // 提交
            this.index = 0;
            this.isOkLoading = true;
            this.messageId = this.message.loading('正在推送epo订单...', { nzDuration: 0 }).messageId;
            this.orderSubmit();
          }
        });

        return false;
      }
      // 提交
      this.index = 0;
      this.isOkLoading = true;
      this.messageId = this.message.loading('正在推送epo订单...', { nzDuration: 0 }).messageId;

      this.orderSubmit();
    } else {
      return;
    }
  }
  orderSubmit () {
    if (this.index < this.model.list.length) {
      if (this.model.list[this.index].hide) {
        this.index = this.index + 1;
        this.orderSubmit();
      } else {
        this.http.post('/web/acceptance-approval/generate-v2', {
          params: this.model.list[this.index],
        }).subscribe(results => {
          if (results['code'] === 0) {
            this.model.list[this.index]['hide'] = true;
            this.message.success(results['msg']);
            this.model = JSON.parse(JSON.stringify(this.model));
          } else {
            this.model.list[this.index]['errMsg'] = results['msg'];
            this.model.list[this.index]['hide'] = false;
            //this.model = JSON.parse(JSON.stringify(this.model));
            this.message.error(results['msg']);
          }

          this.index = this.index + 1;
          this.orderSubmit();
          this.cd.markForCheck();
        }, (err) => {
          this.message.error(err['msg'] || err['message']);
          this.model.list[this.index]['errMsg'] = err['msg'] || err['message'];

          this.index = this.index + 1;
          this.orderSubmit();
          this.cd.markForCheck();
        });
      }

    } else {
      this.isOkLoading = false;
      this.message.remove(this.messageId);
      // 全部推送成功, 则关闭弹窗
      if (this.model.list.every(item => item.hide)) {
        this.close();
      }
    }
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements close' to the class.
    if (this.onDestroy$) {
      this.onDestroy$.next();
      this.onDestroy$.complete();
    }
  }
}
