
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, forkJoin, from, merge, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { ListService } from '../../../services/list.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { MenuService } from '../../../services/menu.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-modal-inquiry',
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InquiryModalComponent implements OnInit, OnDestroy {

  isOpen = false;
  isEdit = false;
  loading: Boolean = false;
  nzZIndex = 0;
  id = null;
  list: any = [];
  titleName = "";
  model = null;
  onDestroy$ = null;
  close$ = null;
  isReinquery=false;
  params = {};
  isOkLoading = null;
  isVisible = false;
  contractChange$ = new Subject();
  bulkSupplierChange$ = new Subject();
  check_msg = '';
  check_epo_msg = '';

  // 标签编辑弹窗的标题
  labelTitle = '';
  modal_ok_disable=false;
  options: FormlyFormOptions = {
    formState: {
      contractList: []
    }
  };

  fields = [
    {
      fieldGroupClassName: 'row no-gutters',
      fieldGroup: [
        {
          key: 'end_date',
          type: 'date-picker',
          className: 'w-10 pr-3 mb-1 col-2',
          templateOptions: {
            label: '报价截止日期',
            nzLayout: 'inline',
            nzFormat: 'yyyy-MM-dd'
          }
        },
        {
          className: 'pt-2',
          template: `<div class="image_hover_title">
                        <img src="assets/images/wenhao.png" width="25" height="25"/>
                        <span>如有多个品类需同时用同一家供应商提交询价，可在这里搜索选择供应商，如品类下有匹配的供应商，系统将自动选中。</span>
                      </div>`,
        },
        {
          key: 'bulk_supplier',
          type: 'nz-select',
          className: 'w-50 mb-2 col-4',
          templateOptions: {
            label: '一键选择供应商',
            nzMode: 'multiple',
            nzValue: 'option',
            nzAllowClear: true,
            options: [],
            nzShowSearch: true,
            onModelChange:($event) => {
              //对比改变触发前与改变后的数据差异
              this.bulkFunction.bulkSupplierChange(this.options.formState.pre_bulk_suppliers,$event);
            }
          },
          expressionProperties: {
            'templateOptions.options': 'formState.union_suppliers',
          },
          lifecycle: {
            onInit: (form, field, model, options) => {
              options.formState.pre_bulk_suppliers = [];
            }
          }
        },
        {
          className: 'ant-col-6 ant-col-offset-5',
          fieldGroupClassName: 'd-flex',
          fieldGroup: [
            {
              key: 'is_show_pre_workload',
              type: 'nz-checkbox',
              className: '',
              templateOptions: {
                nzLabel: '公开工作量',
                type: 'isBoolean',
                nzTooltip: '供应商报价时，系统将显示项目侧录入的数量/预估工作量及明细，供应商可进行修改。'
              },
            },
            {
              key: 'is_open_payment_date',
              type: 'nz-checkbox',
              className: '',
              templateOptions: {
                nzLabel: '公开交付日期',
                type: 'isBoolean',
                nzTooltip: '供应商报价时，系统将显示项目组期望完成日期，供应商可以修改，修改后核价时标示红色，仅适用于指定完成日期的情况。'
              }
            },
            {
              key: 'is_show_contract_remark',
              type: 'nz-checkbox',
              className: '',
              templateOptions: {
                nzLabel: '显示合同备注',
                type: 'isBoolean',
                nzTooltip: '供应商报价时，系统将显示合同备注信息，仅适用于供应商可见合同备注的情况。'
              }
            },
          ]
        },
        {
          className: 'ant-col-24',
          fieldGroupClassName: 'd-flex',
          fieldGroup: [
           {
              key: 'is_set_secrecy',
              type: 'nz-switch',
              templateOptions: {
                label: '是否要保密'
              }
            },
            {
              key: 'secrecy_codes',
              type: 'nz-select',
              className: 'w-50 col-5',
              templateOptions: {
                nzMode: 'multiple',
                nzValue: 'value',
                nzAllowClear: true,
                options: [
                  {
                    label: '附件及互动（含制作人上传的展示文件、最终作品和过程附件）',
                    value: 'upload_attach'
                  },
                  {
                    label: '需求附件（勾选后所属需求所有物件均对需求附件保密）',
                    value: 'story_attach'
                  },
                  {
                    label: '需求名称（勾选后所属需求所有物件均对需求名称保密）',
                    value: 'story_name'
                  },
                  {
                    label: '项目名称（勾选后所属需求所有物件均对项目名称保密）',
                    value: 'project_name'
                  },
                  {
                    label: '物件名称',
                    value: 'thing_name'
                  },
                ],
                nzShowSearch: true,
                nzPlaceHolder: '请选择保密范围，选择的内容供应商CP商务、供应商管理员将不可见'
              },
              hideExpression: (model) => {
                return !model.is_set_secrecy;
              },
              lifecycle: {
                onInit: (form, field, model, options) => {
                  form.get('is_set_secrecy').valueChanges.pipe(takeUntil(this.close$)).subscribe(item => {
                    if(item === false){
                      field.formControl.setValue([]);
                    }
                  })
                }
              }
            },
          ]
        },
        {
          key: 'product_list',
          type: 'nz-repeat',
          className: 'ant-col-24 border',
          templateOptions: {
            nzType: 'line',
          },
          fieldArray: {
            fieldGroupClassName: 'row no-gutters',
            fieldGroup: [
              {
                key: 'title',
                type: 'nz-label',
                className: 'w-50 bg-primary text-white px-3 fields-title',
                wrappers: [
                  'field-wrapper'
                ],
                templateOptions: {
                  type: 'span',
                  nzLayout: 'inline',
                  label: '产品名称'
                }
              },
                {
                  key: 'org_name',
                  type: 'nz-label',
                  className: 'w-50 bg-primary text-white px-3 fields-title',
                  wrappers: [
                    'field-wrapper'
                  ],
                  templateOptions: {
                    type: 'span',
                    nzLayout: 'inline',
                    label: '产品我方主体',
                    nzValidateStatus: 'error',
                  },
                  expressionProperties: {
                    'templateOptions.nzErrorTip': (model, formState) => {
                      return !model.org_name ? '没有拉取到主体信息，请联系税务添加主体信息' : '';
                    },
                  }
                },
                {
                  key: 'categories_list',
                  type: 'nz-repeat',
                  className: 'ant-col-24',
                  fieldArray: {
                    fieldGroupClassName: 'row bg-light no-gutters',
                    fieldGroup: [
                      {
                        key: 'title',
                        type: 'nz-label',
                        className: 'w-50 px-3',
                        wrappers: [
                          'field-wrapper'
                        ],
                        templateOptions: {
                          type: 'span',
                          nzLayout: 'inline'
                        }
                      },
                      {
                        key: 'select',
                        type: 'nz-select',
                        className: 'w-50 px-3',
                        templateOptions: {
                          label: '搜索',
                          nzMode: 'multiple',
                          nzValue: 'option',
                          nzAllowClear: true,
                          options: [],
                          nzShowSearch: true
                        },
                        expressionProperties: {
                          'templateOptions.options': (model, formState) => {
                            return model.supplier.map(item => {
                              return {
                                label: item.supplier_name.replace(/<[^>]+>/g, ''),
                                value: item.supplier_id,
                                id: item.supplier_id
                              };
                            });
                          }
                        }
                      },
                      {
                        key: 'supplier',
                        type: 'nz-repeat',
                        className: 'ant-col-24 px-3 py-2 bg-white',
                        fieldArray: {
                          hideExpression: (model) => {
                            return !(model.checked || model.is_default);
                          },
                          fieldGroupClassName: 'd-flex justify-content-around align-items-center mb-1 ',
                          fieldGroup: [
                            {
                              key: 'checked',
                              type: 'nz-checkbox',
                              className: 'pr-1',
                              wrappers: [
                                'empty-wrapper'
                              ],
                              templateOptions: {
                                type: 'isBoolean',
                                change: (field, $event)=>{
                                  this.initUnOnlineOkButton();
                                  return true;
                                },
                              },
                              lifecycle: {
                                onInit: (form, field, model, options) => {
                                  // this.initUnOnlineOkButton();
                                  if(!model['is_online'] || model['is_online'] == 0){
                                    field.templateOptions.nzDisabled=true;
                                    field.formControl.setValue(false);
                                  }

                                  // 监听选中和合同变更
                                  field.formControl.valueChanges.pipe(
                                    takeUntil(this.close$)
                                  ).subscribe(item => {
                                    if (form.get('contract')) {
                                      form.get('contract').setValue(form.get('contract').value)
                                    }
                                  });

                                  this.bulkSupplierChange$.pipe(debounceTime(60)).subscribe(params => {
                                    if(params['data'].indexOf(model['supplier_id']) === -1){
                                      return;
                                    }
                                    if(params['type'] == 'add'){
                                      field.formControl.setValue(true);
                                    }
                                    if(params['type'] == 'sub'){
                                      field.formControl.setValue(false);
                                    }
                                  })
                                }
                              }
                            },
                            {
                              key: 'supplier_name',
                              type: 'nz-label',
                              className: 'px-1 ant-col-5',
                              wrappers: [
                                'empty-wrapper'
                              ],
                              templateOptions: {
                                type: 'html',
                              },
                              lifecycle: {
                                onInit: (form, field, model, options) => {
                                  if(!model['is_online'] || model['is_online'] == 0){
                                    field.templateOptions.errorTip="该供应商不支持线上操作"
                                  }
                                }
                              }
                            },
                            {
                              key: 'contract',
                              type: 'nz-select',
                              className: 'px-1 ant-col-8',
                              wrappers: ['empty-wrapper'],
                              templateOptions: {
                                nzPlaceHolder: '选择合同',
                                options: [],
                                nzValue: 'option',
                                nzAllowClear: true,
                                nzDropdownMatchSelectWidth: false,
                                nzDropdownClassName: 'select-contract-inquiry',
                                nzValidateStatus: null,
                              },
                              lifecycle: {
                                onInit: (form, field, model, options) => {

                                  // 获取合同下拉参赛
                                  const contractOptions =  options.formState.contractList.filter(
                                                              item => item.supplier_id == model.supplier_id
                                                              && item.category_id === model.category_id
                                                              && item.product_code === model.product_code
                                                            );

                                  field.templateOptions.options = contractOptions
                                  field.templateOptions.nzValidateStatus = null;
                                  field.templateOptions.nzErrorTip = null;

                                  // 如果只有一个合同, 则设置为默认值
                                  if (contractOptions.length === 1) {
                                    setTimeout(() => {
                                      field.formControl.setValue(contractOptions[0]);
                                      form.get('checked').setValue(model.checked);
                                    }, 0)
                                  }

                                  // 提示
                                  if (model.checked && contractOptions === 0) {
                                    field.templateOptions.nzErrorTip = '没有拉取到主体信息，请联系税务添加主体信息';
                                    field.templateOptions.nzValidateStatus = 'error';
                                  } else
                                  if (field.templateOptions.checked && !model.org_name) {
                                    field.templateOptions.nzErrorTip = '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同';
                                    field.templateOptions.nzValidateStatus = 'error';
                                  } else {
                                    field.templateOptions.nzErrorTip = '';
                                    field.templateOptions.nzValidateStatus = '';
                                  }

                                  // 监听选中和合同变更
                                  field.formControl.valueChanges.pipe(
                                    debounceTime(60),
                                    takeUntil(this.close$)
                                  ).subscribe(item => {

                                    // 判断是否配置主体
                                    if (model.checked && model.contract && model.contract.value && !model.org_name) {
                                      field.templateOptions.nzErrorTip = '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同';
                                      field.templateOptions.nzValidateStatus = 'error';
                                    } else {
                                      field.templateOptions.nzErrorTip = '';
                                      field.templateOptions.nzValidateStatus = '';
                                    }
                                    //this.cd.markForCheck();

                                    if (model.checked && model.supplier_id &&  model.contract && model.contract.value) {
                                      this.http.post('/web/order/check-order-company', {
                                        supplier_id: model.supplier_id,
                                        product_code: model.product_code,
                                        contract_id: model.contract && model.contract.value ? model.contract.value : null,
                                      }).subscribe(result => {
                                        // 检验订单
                                        if (model.checked && model.contract && result['code'] !== 0) {
                                          field.templateOptions.nzErrorTip = result['msg'];
                                          field.templateOptions.nzValidateStatus = 'error';
                                        } else if (model.checked && !model.org_name) {
                                          field.templateOptions.nzErrorTip = '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同';
                                          field.templateOptions.nzValidateStatus = 'error';
                                        } else {
                                          field.templateOptions.nzErrorTip = '';
                                          field.templateOptions.nzValidateStatus = '';
                                        }
                                      });

                                        var products_model = this.model;
                                        let thing_ids = [];
                                        for(let product of products_model['product_list']){
                                          if(product['product_code'] != model.product_code){continue;}
                                          for(let category of product['categories_list']){
                                            if(category['category_id'] != model.category_id){continue;}
                                            thing_ids = category['thing_id'];
                                            break;
                                          }
                                          if(thing_ids.length != 0){
                                            break;
                                          }
                                        }
                                        console.log(thing_ids);
                                        console.log(item, model,field)
                                        this.http.post('/web/order/check-contract-epo', {
                                          thing_id:thing_ids,
                                          contract_id: model.contract && model.contract.value ? model.contract.value : null,
                                        }).subscribe(result => {
                                          if (result['code'] !== 0) {
                                            field.templateOptions.nzErrorTip = result['msg'];
                                            field.templateOptions.nzValidateStatus = 'error';
                                            this.check_epo_msg = result['msg'];
                                          }else{
                                            this.check_epo_msg = '';
                                          }
                                          this.contractChange$.next();
                                          this.cd.markForCheck();
                                        });

                                    }

                                  });

                                }
                              },
                            },
                            {
                              key: 'tax_rate',
                              type: 'inquiry-tax-rate',
                              className: 'px-1 ant-col-5',
                              templateOptions: {
                                labelSpan: 8,
                                nzRequired : true,
                              },
                              expressionProperties: {
                                'templateOptions.tax_list_options': 'formState.tax_rates',
                                'templateOptions.tax_rate': 'model.tax_rate?model.tax_rate:null',
                              },
                              hideExpression: (model) => {
                                return model.contract && model.contract.tax_type != "2";
                              },
                              lifecycle: {
                                onInit: (form, field, model, options) => {
                                  this.contractChange$.pipe(debounceTime(120)).subscribe(res => {
                                    let is_constract_rate = field.templateOptions.tax_list_options.some(item=>{
                                      return item['value'] == field.templateOptions.tax_rate && item['showtype'] == 'contracttemp'
                                    })
                                    field.templateOptions.tax_list_options = field.templateOptions.tax_list_options.filter(item=>{return item['showtype'] != 'contracttemp'})
                                    if(!model.contract || !model.contract.tax_rate_value){
                                      return;
                                    }
                                    let contract_tax_value = model.contract.tax_rate_value
                                    if(typeof(contract_tax_value) != 'undefined'){
                                      field.templateOptions.tax_list_options.push({
                                        label: '【合同配置税率】'+contract_tax_value,
                                        value: contract_tax_value,
                                        showtype:'contracttemp'
                                      })
                                    }
                                    //如果之前选的是合同配置，则切换合同时同时切换对应合同税率
                                    if(is_constract_rate == true || field.templateOptions.tax_rate == null){
                                      field.templateOptions.tax_rate = contract_tax_value;
                                      model.tax_rate = contract_tax_value;
                                    }
                                    this.cd.markForCheck();
                                  });
                                }
                              }
                            },
                            {
                              key: 'remark',
                              type: 'nz-input',
                              wrappers: ['empty-wrapper'],
                              className: 'px-1 flex-fill',
                              templateOptions: {
                                nzPlaceHolder: '请输入备注，供应商报价时可见'
                              },
                            },
                            {
                              key: 'is_default',
                              type: 'nz-label',
                              templateOptions: {
                                type: 'none',
                              },
                              lifecycle: {
                                onInit: (from, field, model, options) => {
                                  merge(
                                    from.parent.parent.get('isCollapse').valueChanges,
                                    from.parent.parent.get('select').valueChanges
                                  ).pipe(takeUntil(this.close$)).subscribe(item => {
                                    // 是否默认选中
                                    const isHide = field.model.is_hide;

                                    // 是否展开
                                    const isCollapse = !from.parent.parent.get('isCollapse').value;

                                    // 是否选中
                                    const selectOptions = from.parent.parent.get('select').value;

                                    // 是否搜索
                                    const is_search = selectOptions && selectOptions.length > 0 ? true : false;
                                    const isChecked = selectOptions && selectOptions.length > 0 ?
                                        selectOptions.some(val => val.id === field.model.supplier_id) : false;
                                    const is_default = isChecked || (!is_search && isCollapse) || (!is_search && !isCollapse && !isHide );

                                    field.formControl.setValue(is_default);
                                  });
                                }
                              }
                            }
                          ]
                        },
                        templateOptions: {
                          nocontent: '没有可选的供应商'
                        }
                      },
                      {
                        key: 'isCollapse',
                        type: 'is-collapse',
                        className: 'ant-col-24 bg-white d-flex pb-2 .text-primary justify-content-center',
                        defaultValue: true,
                        templateOptions: {
                          display: 'block',
                          nzSize: 'small'
                        },
                        lifecycle: {
                          onInit: (from, field, model, options) => {

                            if (model.supplier && model.supplier.length === 0) {
                              field.templateOptions.display = 'none';
                              field.formControl.setValue(true);
                            }
                            if(this.isReinquery){
                              field.templateOptions.display = 'none';
                              field.formControl.setValue(false);
                            }

                            from.get('select').valueChanges.pipe(takeUntil(this.close$)).subscribe(item => {
                              if (item && item.length > 0) {
                                field.templateOptions.display = 'none';
                                field.formControl.setValue(true);
                              } else {
                                field.templateOptions.display = 'block';
                                field.formControl.setValue(false);
                              }
                            });
                          }
                        }
                      },
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
  ];

  form = new FormGroup({});

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modal: ModalService,
    private modalService: NzModalService,
    private listService: ListService,
    private menuService: MenuService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.onDestroy$ = new Subject<any>();
    this.modal.modal$.pipe(takeUntil(this.onDestroy$)).subscribe(item => {
      // 询价生成订单
      if (item && item['key'] === 'inquiry') {
        this.nzZIndex = item['zIndex'];
        this.params = item['data'];
        this.titleName = "请选择参与报价的供应商";
        this.close$ = new Subject<any>();
        this.open();
      }
      // 询价生成订单
      if (item && item['key'] === 'reinquiry') {
        this.nzZIndex = item['zIndex'];
        this.params = item['data'];
        this.isReinquery = true;
        this.titleName = "请选择重新核价的供应商";
        this.close$ = new Subject<any>();
        this.open();
      }
    });
  }

  // 关闭页面
  modalCancel() {
    this.isOpen = false;
  }

    trackByFn(index, item) {
      return item.id ? item.id : index; // or item.id
    }

  close() {
    this.isVisible = false;
    this.model = null;
    this.isVisible = false;
    this.close$.next();
    this.close$.complete();
    this.modal.complete('inquiry')
    this.cd.markForCheck();
  }

  // 对物件询价
  open() {
    const id = this.message.loading('正在生成询价单...', { nzDuration: 0 }).messageId;
    this.cd.markForCheck();
    this.http.post('web/price/inquiry-dialog', this.params).subscribe(result => {
      this.message.remove(id);
      if (result['code'] === 0) {
        this.isVisible = true;
        this.options.formState.contractList = result['contractList'];
        this.options.formState.tax_rates = result['tax_rates'];
        this.options.formState.union_suppliers = this.bulkFunction.getUnionSuppliersByResult(result);
        this.model = result['modelData'];
        // 设置默认值
        if (this.model.product_list && this.model.product_list.length > 0) {
          this.model.product_list.forEach(product_list => {
            if (product_list.categories_list && product_list.categories_list.length > 0) {
              product_list.categories_list.forEach(categories_list => {
                if (categories_list.supplier && categories_list.supplier.length > 0) {
                  categories_list.supplier.forEach(supplier => {
                      supplier.is_default = !supplier.is_hide;
                  });
                }
              });
            }
          });
        }
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, err => {
      this.message.remove(id);
      this.message.error('网络异常, 请联系管理员');
      this.cd.markForCheck();
    });
  }


  checkSubmit(){
    let whole_secrecy = this.model.secrecy_codes.sort().join(",")
    let diff_num = 0;
    for(let i in this.model.secrecys_detail){
        if(whole_secrecy != i){
          diff_num += this.model.secrecys_detail[i].length;
        }
    }
    let warning_msg = "所选择的单据中有"+diff_num.toString()+"个物件的保密范围与当前保密范围不一致，若继续将会重新统一保密配置"
    if(diff_num != 0 && Object.keys(this.model.secrecys_detail).length != 1){
      this.modalService.confirm({
        nzTitle:"保密配置不一致提醒",
        nzContent:warning_msg,
        nzOnOk:()=>{
          this.submit()
        }
      })
    }else{
      this.submit()
    }
  }
  submit() {
    const param = [];
    let validate = true;
    let org_same = true;
    let is_org_name = true;
    let err_msg = "";
    this.model['product_list'].forEach((product, productIndex) => {
      product.categories_list.forEach((category, categoryIndex) => {
        const thingQuote = [];
        category.supplier.forEach((suppluer, supplierIndex) => {
          if (suppluer.checked && suppluer.contract) {
            //当合同不含税时获取税率，若为空或者不是数字就报错，若含税则置为0,后台判断
            let tax_rate:any = "";
            if(suppluer.contract.tax_type == "2"){
              if(!suppluer.tax_rate || suppluer.tax_rate.length == 0){
                err_msg="请输入合同税率";
                return;
              }
              tax_rate = suppluer.tax_rate;
              let rates = tax_rate.split('.');
              if(rates[1] && rates[1].length > 18){
                err_msg="税率仅支持到小数后18位";
                return;
              }
              //判断是否浮点
              if(parseFloat(tax_rate) != tax_rate || tax_rate < 0){
                err_msg="请输入正确合同税率";
                return;
              }
            }

            thingQuote.push(
              {
                supplier_id: suppluer.supplier_id,
                contract_id: suppluer.contract.value,
                remark: suppluer.remark,
                is_org_same: suppluer.contract.is_org_same,
                tax_rate: tax_rate
              }
            );

            if (!suppluer.org_name) {
              is_org_name = false;
            }

            if (!suppluer.contract.is_org_same) {
              org_same = false;
            }
          } else if (suppluer.checked && !suppluer.contract) {
            validate = false;
          }
        });
        if(err_msg != ""){
          return;
        }
        if (thingQuote.length > 0) {
          param.push(
            {
              thing_id: category.thing_id,
              thing_quote: thingQuote
            }
          );
        }

      });
      if(err_msg != ""){
        return;
      }
    });
    if(this.model['is_set_secrecy'] && this.model['secrecy_codes'].length === 0){
      err_msg = '请输入保密范围'
    }
    if(err_msg != ""){
      this.message.error(err_msg);
      return;
    }
    if (param.length === 0) {
      this.message.error('数据不完整不能提交');
      this.cd.markForCheck();
      return false;
    } else if (!validate) {
      this.message.error('勾选供应商后要勾选对应的合同号');
      this.cd.markForCheck();
      return false;
    }


    if ((!org_same || !is_org_name) && !this.check_epo_msg) {
      let msg = ''
      if (!is_org_name) {
        msg = '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同 ?'
      } else if (!org_same) {
        msg = '合同我方主体与产品我方主体不一致，是否继续询价?'
      }
      this.modalService.create({
        nzTitle: '提示',
        nzContent: msg,
        nzClosable: false,
        nzOnOk: () => {
          this.inquirySubmit(param);
        }
      });
      this.cd.markForCheck();
    } else {
      this.inquirySubmit(param);
    }
  }

  inquirySubmit (param) {
    this.isOkLoading = true;
    this.message.isAllLoading = true;
    this.cd.markForCheck();
    this.http.post('web/price/inquiry-submit', {
      deadline: this.model['end_date'],
      inquiry_list: param,
      is_open_quantity: this.model['is_open_quantity'],
      is_open_payment_date: this.model['is_open_payment_date'],
      is_show_contract_remark: this.model['is_show_contract_remark'],
      is_show_pre_workload: this.model['is_show_pre_workload'],
      is_reinquery: this.isReinquery,
      secrecy_codes:this.model.secrecy_codes
    }).subscribe(result => {

      this.isOkLoading = false;
      this.message.isAllLoading = false;
      if (result['code'] === 0) {
        this.isVisible = false;
        this.message.success(result['msg']);
        if(!this.isReinquery){
          this.listService.getList('price/inquiry');
        }
        this.menuService.getBacklog();
        this.close();
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.isOkLoading = false;
      this.cd.markForCheck();
    });
  }


  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.cd.markForCheck();
  }

  initUnOnlineOkButton():void{
    let product_list = this.model.product_list;
    let is_disable = false;
    for(let product of product_list){
      for(let category of product['categories_list']){
        for(let supplier of category['supplier']){
          if(supplier['checked'] == true && supplier['is_online'] == 0){
            is_disable = true;
          }
        }
      }
    }
    this.modal_ok_disable = is_disable;
    this.cd.markForCheck();
  }

  bulkFunction =
  {
    getUnionSuppliersByResult : (result)=>{
      let res = [];
      let seems = {};
      for(let i of result.modelData.product_list){
          for(let j of i['categories_list']){
              for(let k of j.supplier){
                  if(seems[k['supplier_id']]){
                    continue;
                  }
                  seems[k["supplier_id"]] = 1;
                  res.push({
                    label: k["supplier_name"].replace(/<[^>]+>/g, '').replace(/\(意向\)/,'').replace(/\(直选\)/,''),
                    value: k["supplier_id"],
                    id: k["supplier_id"]
                  });
              }
          }
      }
      return res;
    },
    bulkSupplierChange:(pre_suppliers,now_suppliers)=>{
      let tmp_now_suppliers = now_suppliers;
      now_suppliers = now_suppliers.map((value)=>{return value.id;})
      pre_suppliers = pre_suppliers.map((value)=>{return value.id;})
      if(now_suppliers.length > pre_suppliers.length){
        var [lot_arr, few_arr, flag] = [now_suppliers,pre_suppliers,'add']
      }else if(now_suppliers.length < pre_suppliers.length){
        var [few_arr, lot_arr, flag] = [now_suppliers,pre_suppliers,'sub']
      }else{
        return;
      }
      let extra_supplier_ids = lot_arr.filter(x=>few_arr.indexOf(x)==-1);
      this.bulkSupplierChange$.next({'type':flag,'data':extra_supplier_ids});
      this.options.formState.pre_bulk_suppliers = tmp_now_suppliers;
    }
  }
}
