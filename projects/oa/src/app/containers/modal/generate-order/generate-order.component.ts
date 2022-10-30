import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Field, FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { forkJoin, Subject, of, combineLatest, merge,  } from 'rxjs';
import { takeUntil, debounceTime, map, tap, filter, delay } from 'rxjs/operators';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { ListService } from '../../../services/list.service';
import { CommonFunctionService } from '../../../services/common-function.service';

@Component({
  selector: 'app-generate-order',
  templateUrl: './generate-order.component.html',
  styleUrls: ['./generate-order.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GenerateOrderModalComponent implements OnInit, OnDestroy {

  @ViewChild('generateOrderRef') generateOrderRef: ElementRef;

  // Model 参数配置
  isModelVisible = false;
  isOkLoading = false;
  isCategoryEmpty = false;
  // loading
  loading = true;
  modalLoading = true;

  // 弹窗接口配置
  currencyObj = {};

  // 汇率相关
  contract_tax_type = 1;
  contract_tax_rate_value = '';

  checkListsId = null;

  close$ =  null;
  onDestroy$ = null;

  createOrderConfig = null;

  vendorSiteOptions = [];

  isVisible = false;
  isLoading = false;
  isLoaded = false;
  errMsg =  '';
  check_epo_msg = '';

  nzZIndex = 800

  // 供应商和合同改变
  contractChange$ = new Subject<any>();
  exchangerRateChange$ = new Subject<any>();

  priceChange$ = new Subject<any>();
  completeDateChange$ = new Subject<any>();

  // 生成订单的Formly配置信息
  form = new FormGroup({});
  model: any = {};

  thing_ids = '';
  check_msg = '';

  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
      contract_options: [],
      is_org_same: null,
      is_test: 0,  // 0 正式单, 1 测试单
      org_list: [],
      vendor_site_list: [],
      contract_tax_type: 1,
      tax_list_options: [],
      tax_type_options: [],
      account_bank_list: [],
      category_name_list: [],
      mba_resources: [],
      mba_has_resources: null
    },
  };

  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'row mx-0',
      fieldGroup: [
        {
          key: 'attachment_id',
          type: 'create-demand-upload-component',
          className: 'ant-col-16 mr-2',
          templateOptions: {
            label: '上传议价过程附件',
            labelSpan: 8,
            nzLimit: 1,
            nzMultiple: false,
            nzErrorTip: '如有线下议价，请务必上传议价过程附件!',
            nzValidateStatus: 'error',
          },
          expressionProperties: {
            'templateOptions.nzErrorTip': '!model.attachment_id ? "如有线下议价，请务必上传议价过程附件!" : null',
          }
        },
        {
          key: 'product_name',
          type: 'nz-label',
          className: 'ant-col-16 mr-3',
          wrappers: ['field-wrapper'],
          templateOptions: {
            label: '产品名称',
            type: 'span',
            labelSpan: 8,
            nzPlaceholder: '请输入订单名称'
          }
        },
        {
          key: 'project_org_name',
          type: 'nz-label',
          className: 'ant-col-16 mr-3',
          wrappers: ['field-wrapper'],
          templateOptions: {
            label: '产品我方主体',
            type: 'span',
            nzErrorTip: '',
            nzValidateStatus: 'error',
            labelSpan: 8,
          },
          expressionProperties: {
            'templateOptions.nzErrorTip': '!model.project_org_name ? "没有拉取到主体信息，请联系税务添加主体信息!" : null',
          }
        },
        {
          key: 'is_set_secrecy',
          type: 'nz-radio',
          className: 'ant-col-16 mr-3',
          templateOptions: {
            label: '是否要保密',
            labelSpan: 8,
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
          key: 'secrecy_codes',
          type: 'nz-select',
          className: 'ant-col-16 mr-3',
          templateOptions: {
            label: '保密范围',
            nzMode: 'multiple',
            nzValue: 'value',
            nzShowSearch: true,
            nzAllowClear: true,
            options:[
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
            labelSpan: 8,

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
        {
          key: 'order_name',
          type: 'nz-input',
          className: 'ant-col-16 mr-3',
          templateOptions: {
            label: '订单名称',
            labelSpan: 8,
            nzPlaceholder: '请输入订单名称'
          }
        },
        {
          key: 'supplier_id',
          type: 'nz-select',
          templateOptions: {
            label: '选择供应商',
            nzValue: 'value',
            options: [],
            nzPlaceholder: '请选择供应商',
            nzShowSearch: true,
          },
          hide: true,
        },
        {
          key: 'contract_id',
          type: 'nz-select',
          templateOptions: {
            label: '',
            nzValue: 'value',
            options: [],
            nzSize: 'small',
            nzPlaceholder: '请选择合同'
          },
          hide: true
        },
        {
          key: 'select_supplier_and_contract',
          type: 'nz-cascader',
          className: 'ant-col-16 mr-3',
          templateOptions: {
            label: '选择供应商/合同',
            labelSpan: 8,
            nzMenuClassName: 'supperlier-and-contract-cascader',
            nzShowSearch: true,
            nzRequired : true,
            options: [],
            nzOptions: [],
            nzPlaceholder: '请选择供应商/合同',
            nzErrorTip: '',
            nzValidateStatus: '',
          },

          lifecycle: {
            onInit: (from, field, model, options) => {
              field.templateOptions.nzValidateStatus = '';
              field.templateOptions.nzErrorTip = '';

              field.formControl.valueChanges
                .pipe(takeUntil(this.close$))
                .pipe(filter(x => x))
                .pipe(debounceTime(60)).subscribe(item => {
                const [supplier_id, contract_id] = item;
                console.log(item)
                if (supplier_id && contract_id) {
                  model.supplier_id = supplier_id;
                  model.contract_id = contract_id;
                }

                const contractInfo = options.formState.contract_options.find(i => i.value === contract_id);
                const supplierInfo = options.formState.supplier_options.find(i => i.value === supplier_id);
                options.formState.is_org_same = contractInfo ? contractInfo.is_org_same : '';
                options.formState.is_online_operator = supplierInfo ? supplierInfo.is_online : '';

                if (contractInfo.select_reason) {
                  from.root.get('select_reason').setValue(contractInfo.select_reason);
                }

                this.cd.markForCheck();
                if (item && item.length > 0) {
                  const id = this.message.loading('正在请求物件合同详情....', { nzDuration: 0 }).messageId;
                  //this.cd.markForCheck();
                  this.http.get('/web/order/direct-order-thing', { params: {
                    contract_id: contract_id,
                    thing_ids: this.thing_ids
                  }}).pipe(takeUntil(this.close$)).pipe(tap(() => {
                    this.message.remove(id);
                  }))
                  .pipe(tap(result => {
                    this.createOrderConfig = {
                      ...this.createOrderConfig,
                      thing_price_obj: result['thing_price_obj'],
                      thing_list: result['thing_list'],
                      thing_project_breakdown_obj: result['thing_project_breakdown_obj'],
                      all_contract_price_remark: result['all_contract_price_remark']
                    };
                    this.vendorSiteOptions = result['vendor_site_list'] ? result['vendor_site_list'] : [];
                    this.currencyObj = result['currency_obj'] || {};
                    this.options.formState.currency_symbol = this.currencyObj['symbol']

                    this.options.formState.tax_list_options = result['tax_list_options'];
                    this.options.formState.tax_type_options = result['tax_type_options'];
                    this.options.formState.disable_sync_gen_epo_order = result['disable_sync_gen_epo_order'];

                    this.options.formState.auto_payment_options = result['auto_payment_options'];
                    this.options.formState.contract_tax_type = result['contract_tax_type'];
                    this.contract_tax_rate_value = result['tax_rate_value'];
                    this.cd.markForCheck();
                  }))
                  .pipe(delay(60))
                  .subscribe(result => {
                    if (result['code'] === 0) {
                      if (result['check_msg']) {
                        field.templateOptions.nzValidateStatus = 'error';
                        field.templateOptions.nzErrorTip = result['check_msg'];
                        this.check_msg = result['check_msg'];
                      }else{
                        this.check_msg = '';
                      }
                      if (result['contract_epo_msg']) {
                        field.templateOptions.nzValidateStatus = 'error';
                        field.templateOptions.nzErrorTip = result['contract_epo_msg'];
                        this.check_epo_msg = result['contract_epo_msg'];
                        this.check_msg = '';
                      }else{
                        this.check_epo_msg = '';
                      }

                      if (this.contract_tax_rate_value && result['contract_tax_type'] !== 1) {
                        from.root.get('exchange_rate').setValue({
                          tax_type: '1',
                          tax_value: this.contract_tax_rate_value
                        });
                      }
                      model.supplier_id = supplier_id;
                      model.contract_id = contract_id;

                      console.log(result)


                      from.root.get('sync_gen_epo_order').setValue(result['sync_gen_epo_order']);
                      let thing_list = result['thing_list'].map(item => {
                        return {
                          story_name:         item['story_name'],
                          story_code:         item['story_code'],
                          thing_name:         item['thing_name'],
                          thing_code:         item['thing_code'],
                          category:           item['category'],
                          contract_id:        item['contract_id'],
                          expected_expenditure: item['expected_expenditure'],
                          not_pass_percent:    item['not_pass_percent'],
                          attribute:          item['attribute'],
                          complete_date:      item['expected_complete_date'] || '',
                          expected_complete_date: item['expected_complete_date'],
                          pre_workload:       item['pre_workload'],
                          pre_produce_grade_name: item['pre_produce_grade_name'],
                          quote:              item['quote'],
                        }
                      })

                      from.root.get('thing_list').patchValue(thing_list);
                      this.contractChange$.next(1);
                    } else {
                      model.supplier_id = supplier_id;
                      model.contract_id = contract_id;
                      from.root.get('sync_gen_epo_order').setValue(null);
                      this.priceChange$.next();
                      this.message.error(result['msg']);
                    }
                    if(!field.templateOptions.nzErrorTip){
                      if (!model.project_org_name) {
                        field.templateOptions.nzErrorTip = '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同';
                        field.templateOptions.nzValidateStatus = 'error';
                      }
                    }
                    this.cd.markForCheck();
                  }, err => {
                    this.message.error('网络错误, 请联系管理员');
                    this.cd.markForCheck();
                  });
                }else{
                  if (!model.project_org_name) {
                    field.templateOptions.nzErrorTip = '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同';
                    field.templateOptions.nzValidateStatus = 'error';
                  }else {
                    field.templateOptions.nzValidateStatus = '';
                    field.templateOptions.nzErrorTip = '';
                  }
                  this.cd.markForCheck();
                }
              });
            }
          },
        },
        {
          key: 'handling_department',
          type: 'nz-select',
          templateOptions: {
            label: '经办部门',
            nzValue: 'value',
            nzShowSearch: true,
            nzRequired: true,
            options: [],
            nzPlaceholder: '请选择经办部门'
          },
          hide: true,
        },
        {
          key: 'handling_center',
          type: 'nz-select',
          templateOptions: {
            label: '经办中心',
            nzValue: 'value',
            nzRequired: true,
            options: [],
            nzPlaceholder: '请选择经办中心'
          },
          hide: true
        },
        {
          key: 'agent',
          type: 'nz-select',
          className: 'ant-col-16 mr-3',
          templateOptions: {
            label: '经办人',
            nzValue: 'value',
            nzShowSearch: true,
            nzRequired: true,
            options: [],
            labelSpan: 8,

            nzPlaceholder: '请选择经办人'
          }
        },
        {
          key: 'handling_department_and_center',
          type: 'nz-cascader',
          className: 'ant-col-16 mr-3',
          templateOptions: {
            label: '经办部门/经办中心',
            nzShowSearch: true,
            nzRequired : true,
            labelSpan: 8,
            options: [],
            nzOptions: [],
            nzPlaceholder: '请选择经办部门/经办中心',
          },
          lifecycle: {
            onInit: (from, field: FormlyFieldConfig) => {
              if (from.root.get('agent').value) {
                const id = from.root.get('agent').value;
                this.cd.markForCheck();
                this.http.get('web/ajax-check/user-department', {params: {user_id: id}}).subscribe(result => {
                  if (result['code'] === 0) {
                    if (result['data'].centerId && result['data'].deptId) {
                      field.formControl.setValue([result['data'].deptId, result['data'].centerId]);
                      this.cd.markForCheck();
                    } else {
                      field.formControl.setValue(null);
                      this.cd.markForCheck();
                    }
                  }
                });
              }
              from.root.get('agent').valueChanges
                .pipe(takeUntil(this.close$))
                .pipe(debounceTime(120))
                .pipe(filter(id => id)).subscribe(id => {
                  this.cd.markForCheck();
                this.http.get('web/ajax-check/user-department', {params: {user_id: id}}).subscribe(result => {
                  if (result['code'] === 0) {
                    if (result['data'].centerId && result['data'].deptId) {
                      this.cd.markForCheck();
                      field.formControl.setValue([result['data'].deptId, result['data'].centerId]);
                    } else {
                      this.cd.markForCheck();
                      field.formControl.setValue(null);
                    }
                  }
                });
              });
              field.formControl.valueChanges.pipe(takeUntil(this.close$)).pipe(debounceTime(120)).subscribe(item => {
                if (item) {
                  const [handling_department, handling_center] = item;
                  from.root.get('handling_department').setValue(handling_department);
                  from.root.get('handling_center').setValue(handling_center);
                  this.cd.markForCheck();
                }
              });
            }
          },
        },
        {
          key: 'exchange_rate',
          type: 'inquiry-exchange-rate',
          className: 'ant-col-16 mr-3',
          wrappers: ['field-wrapper'],
          templateOptions: {
            label: '税率',
            labelSpan: 8,
            nzRequired : true,
          },
          hideExpression: (model, formState) => {
            return formState.contract_tax_type === 1;
          },
          expressionProperties: {
            'templateOptions.tax_list_options': 'formState.tax_list_options',
            'templateOptions.tax_type_options': 'formState.tax_type_options',
          },
          lifecycle: {
            onInit: (from, field) => {
              field.formControl.valueChanges.pipe(takeUntil(this.close$)).subscribe(value => {
                this.priceChange$.next();
              });
            }
          }
        },
        {
          key: 'select_reason',
          type: 'nz-select',
          className: 'ant-col-16 mr-3',
          templateOptions: {
            label: '供应商选择方法',
            nzRequired : true,
            nzValue: 'value',
            labelSpan: 8,
            options: []
          }
        },
        {
          template: '<div class="text-center d-block">该供应商不支持线上操作，无法配置线上操作选项</div>',
          className: 'ant-col-16 ant-col-offset-5 red m-2 ',
          hideExpression:'formState.is_online_operator != "0"'
       },
       {
        key: 'online_commit_price',
        type: 'nz-radio',
        className: 'ant-col-16 mr-3',
        templateOptions: {
          label: '线上确认价格',
          nzRequired : true,
          nzValue: 'value',
          labelSpan: 8,
          options: [
           {
             value: '1',
             label: '是',
           },
           {
             value: '0',
             label: '否'
           }
          ]
        },
        expressionProperties: {
          'templateOptions.nzDisabled': 'formState.is_online_operator == "0"',
        },
        lifecycle:{
          onInit: (form, field, model, options) => {
            this.contractChange$.pipe(debounceTime(50)).subscribe(res => {
              if(options.formState.is_online_operator == "0"){
                field.formControl.setValue('0');
              }
            });
          }
        }
      },
      {
        key: 'online_make_order',
        type: 'nz-radio',
        className: 'ant-col-16 mr-3',
        templateOptions: {
          label: '线上交付作品及订单变更',
          nzRequired : true,
          nzValue: 'value',
          labelSpan: 8,

          options: [
           {
             value: '1',
             label: '是',
           },
           {
             value: '0',
             label: '否'
           }
          ]
        },
        expressionProperties: {
          'templateOptions.nzDisabled': 'formState.is_online_operator == "0"',
        },
        lifecycle:{
          onInit: (form, field, model, options) => {
            this.contractChange$.pipe(debounceTime(50)).subscribe(res => {
              if(options.formState.is_online_operator == "0"){
                field.formControl.setValue('0');
              }
            });
          }
        }
      },
      {
        key: 'online_accept_order',
        type: 'nz-radio',
        className: 'ant-col-16 mr-3',
        templateOptions: {
          label: '线上接收订单',
          nzRequired: true,
          nzValue: 'value',
          labelSpan: 8,

          options: [
           {
             value: '1',
             label: '是',
           },
           {
             value: '0',
             label: '否'
           }
          ]
        },
        expressionProperties: {
          'templateOptions.nzDisabled': 'formState.is_online_operator == "0"',
        },
        lifecycle:{
          onInit: (form, field, model, options) => {
            this.contractChange$.pipe(debounceTime(50)).subscribe(res => {
              if(options.formState.is_online_operator == "0"){
                field.formControl.setValue('0');
              }
            });
          }
        }
      },
        {
          type: 'nz-input',
          key: 'receive_date',
          className: 'ant-col-16 mr-3',
          defaultValue: 3,
          templateOptions: {
            label: '接收订单天数',
            nzRequired: true,
            labelSpan: 8,
            nzLayout: 'inline',
            nzType: 'number',
            nzPlaceholder: '接收订单天数'
          },
          hideExpression: mode => mode.online_accept_order == '0'
        },
        {
          key: 'is_send_cp',
          type: 'nz-radio',
          className: 'ant-col-16',
          defaultValue: '1',
          templateOptions: {
            labelSpan: 8,
            label: '推送邮件给供应商',
            options: [
              {
                value: '1',
                label: '是',
              },
              {
                value: '0',
                label: '否'
              }
            ]
          },
        },

        {
          key: 'remark1',
          type: 'nz-textarea',
          className: 'ant-col-16',
          templateOptions: {
            label: '订单备注',
            nzPlaceHolder: '请输入备注，供应商接收订单时可见，200字以内',
            labelSpan: 8,
          }
        },
        {
          key: 'sync_gen_epo_order',
          type: 'nz-radio',
          className: 'ant-col-16',
          wrappers: ['field-wrapper'],
          defaultValue: false,
          templateOptions: {
            disabled : true,
            labelSpan: 8,
            label: '是否推送EPO订单',
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
          },
          expressionProperties: {
            'templateOptions.disabled': 'formState.disable_sync_gen_epo_order',
          },
          lifecycle: {
            onInit: (from, field, model, options) => {
              field.formControl.valueChanges.pipe(filter(item => item)).pipe(takeUntil(this.close$)).subscribe(res => {
                if (!model.supplier_id || !model.contract_id) {
                  this.message.error('请选择供应商/合同');
                  field.formControl.setValue(false);
                  this.cd.markForCheck();
                } else {
                  this.cd.markForCheck();
                  this.http.post('web/acceptance-approval/sync-create-po-order', {
                    thing_id: this.thing_ids,
                    supplier_id: model.supplier_id,
                    contract_id: model.contract_id,
                    type: 'pushEpo'
                  }).subscribe(result => {
                    if (result['code'] !== -1 ) {
                      options.formState.org_list = result['org_list'];
                      options.formState.vendor_site_list = result['vendor_site_list'];
                      options.formState.receivers = result['receiver'];
                      options.formState.cost_center_options = result['cost_center_options'];
                      options.formState.mba_resources = result['mba_resources'].map(item => {
                        return {
                          value: item.itemId, label: item.itemName
                        }; });
                      options.formState.mba_has_resources = result['mba_has_resources'];
                      options.formState.contract_number = result['contract']['contract_number'];

                      from.root.get('notice_crowd_id').setValue(['cp', 'spm', 'spma']);
                      from.root.get('receivers').setValue(result['receiver']);
                      from.root.get('memo').setValue(result['memo']);
                      from.root.get('cost_center_code').setValue(result['cost_center_code']);

                      from.root.get('is_auto_payment').setValue(result['is_auto_payment']);
                      from.root.get('org_id').setValue(result['org_id']);
                      from.root.get('category_name').setValue(result['category_name']);
                      from.root.get('account_bank').setValue(result['account_bank']);
                      model.is_to_bfc = result['is_to_bfc'];
                    } else {
                      this.message.error(result['msg']);
                      field.formControl.setValue(false);
                    }
                    this.cd.markForCheck();
                  });
                }
              });
            }
          }
        },
        {
          fieldGroupClassName: 'bg-light round ant-row p-3 bordre-round mx-n3',
          templateOptions: {
            hidden: true
          },
          hideExpression: '!model.sync_gen_epo_order',
          fieldGroup: [
            {
              key: 'prepayments_status',
              type: 'nz-radio',
              className: 'ant-col-16 mr-3',
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
              templateOptions: {
                label: '预付款金额',
                labelSpan: 8,
                nzRequired: true,
                suffixTemplate: 'CNY',
                // placeholder: '预付款金额不可超过订单金额的30%'
              },
              hideExpression: 'model.prepayments_status != "1"',
              expressionProperties: {
                'templateOptions.suffixTemplate': 'formState.currency_symbol || "CNY"',
              },
              lifecycle: {
                onInit: (form, field, model, options) => {

                  field.templateOptions.suffixTemplate = this.currencyObj['symbol'] || 'CNY'
                  merge(
                    form.get('order_all_price').valueChanges,
                    field.formControl.valueChanges
                  ).subscribe(value => {
                    let allPrice = form.get('order_all_price').value;
                    if(field.formControl.value && !Number(field.formControl.value)){
                      this.message.error("预付款请输入数字")
                      return;
                    }
                    if (Number(field.formControl.value) >  Number((Number(allPrice)  * 0.3).toFixed(3))) {
                      // field.templateOptions.nzValidateStatus = 'error'
                      // field.templateOptions.nzErrorTip = `预付款金额不可超过订单金额的30% (${(Number(allPrice)  * 0.3).toFixed(3)}) ${field.templateOptions.suffixTemplate}`
                    } else {
                      field.templateOptions.nzValidateStatus = ''
                      field.templateOptions.nzErrorTip = ''
                    }
                  })
                }
              }
            },


            {
              key: 'org_id',
              type: 'nz-select',
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '我方主体',
                labelSpan: 8,
                nzRequired: true,
                nzValue: 'value'
              },
              expressionProperties: {
                'templateOptions.options': 'formState.org_list',
                // 'templateOptions.nzErrorTip': '!model.project_org_name ? "没有拉取到主体信息，请联系税务添加主体信息!" : null',
              },
              lifecycle: {
                onInit: (from, field, model, options) => {
                  field.formControl.valueChanges
                       .pipe(filter(org_id => org_id))
                       .pipe(takeUntil(this.close$))
                       .subscribe(org_id => {

                    const category_obj = {};
                    const list = options.formState.vendor_site_list
                      .filter(item => item.org_id === org_id)
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
                    options.formState.category_name_list = Object.values(category_obj);

                    const vendor_category = options.formState.category_name_list
                      .sort((a, b) => (b.vendor_site_state - a.vendor_site_state))
                      .find(item => item.is_default === '1' );

                    const vendor_category_id = org_id && vendor_category && vendor_category.category_id
                                                      ? vendor_category.category_id : null;

                    from.root.get('category_name').setValue(vendor_category_id);

                    field.templateOptions.nzValidateStatus = '';
                    field.templateOptions.nzErrorTip = '';
                    options.formState.orgIdValidateInfo = '';
                    if (org_id) {
                      this.http.post('/web/order/check-order-company', {
                        supplier_id: model.supplier_id,
                        contract_id: model.contract_id,
                        org_id: model.org_id,
                      }).subscribe(result => {
                        if (result['code'] === -1) {
                          field.templateOptions.nzValidateStatus = 'error';
                          field.templateOptions.nzErrorTip = result['msg'];
                          options.formState.orgIdValidateInfo = result['msg'];
                          this.check_msg = result['msg'];
                        } else if (result['code'] === 0) {
                          field.templateOptions.nzValidateStatus = '';
                          field.templateOptions.nzErrorTip = '';
                          options.formState.orgIdValidateInfo = '';
                          this.check_msg = 'pass';
                        }
                        this.cd.markForCheck();
                      })
                    }

                    this.cd.markForCheck();
                  });
                }
              }
            },
            {
              key: 'category_name',
              type: 'nz-select',
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '供应商服务品类',
                labelSpan: 8,
                nzRequired: true,
                nzValue: 'value',
                buttonLabel: '拉取',
                nzErrorTip: '',
                nzValidateStatus: '',
                buttonClick: (model, options, _this) => {
                  const messageId = this.message.loading('正在同步供应商品类....', { nzDuration: 0 }).messageId;
                  this.http.post('web/acceptance-approval/pull-supplier-site', {
                    contract_number: options.formState.contract_number,
                    org_id: model.org_id
                  }).pipe(takeUntil(this.close$)).subscribe(result => {
                    this.message.remove(messageId);
                    if (result['code'] === 0) {
                      // 设置供应商服务品类下俩参数
                      let vendor_site_list = [...options.formState.vendor_site_list, ...result['data']];
                      const vendor_site_obj = {};
                      vendor_site_list.map(item => {
                        vendor_site_obj[item.vendor_site_id] = item;
                      }).sort((a, b) => b['is_default'] - a['is_default']);

                      vendor_site_list = Object.values(vendor_site_obj);
                      options.formState.vendor_site_list = vendor_site_list;
                    }
                    this.cd.markForCheck();
                  }, err => {
                    this.message.remove(messageId);
                  });
                }
              },

              expressionProperties: {
                'templateOptions.options': 'formState.category_name_list',
              },
              lifecycle: {
                onInit: (from, field, model, options) => {
                  field.formControl.valueChanges.pipe(takeUntil(this.close$)).pipe(debounceTime(60)).subscribe(category_id => {

                    const account_bank_list = options.formState.vendor_site_list
                      .filter(item => item.category_id === category_id && item.org_id === model.org_id)
                      .map(item => {
                        return {
                          value: item.vendor_site_id,
                          label: item.account_number + item.account_name + item.account_bank,
                          org_id: item.org_id,
                          is_default: item.is_default,
                          category_id: item.category_id,
                          vendor_site_id: item.vendor_site_id,
                          vendor_site_state: item.vendor_site_state
                        };
                      });
                    options.formState.account_bank_list = account_bank_list;
                    const account  = account_bank_list.find(item => item.vendor_site_state === '1');
                    const vendor_site_id = category_id && account && account.vendor_site_id ? account.vendor_site_id : null;

                    from.root.get('account_bank').setValue(vendor_site_id);
                    model.vendor_site_id = vendor_site_id;
                    if (this.isCategoryEmpty) {
                       field.templateOptions.nzValidateStatus = 'error';
                       field.templateOptions.nzErrorTip = '未准入该主体或供应商品类被冻结，请到供应商管理系统核实。';
                    } else {
                       field.templateOptions.nzValidateStatus = '';
                       field.templateOptions.nzErrorTip = '';
                    };
                    this.cd.markForCheck();
                  });
                }
              }
            },
            {
              key: 'account_bank',
              type: 'nz-select',
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '供应商银行账号',
                labelSpan: 8,
                nzRequired: true,
                nzValue: 'value'
              },
              expressionProperties: {
                'templateOptions.options': 'formState.account_bank_list',
              },
            },
            {
              key: 'mba_item_id',
              type: 'nz-select',
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '物料选择',
                labelSpan: 8,
                nzRequired: true,
                nzValue: 'value'
              },
              expressionProperties: {
                'templateOptions.options': 'formState.mba_resources',
              },
              hideExpression: 'formState.mba_has_resources == 0'
            },
            {
              key: 'cost_center_code',
              type: 'nz-select',
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '成本中心',
                labelSpan: 8,
                nzRequired: true,
                nzValue: 'value'
              },
              expressionProperties: {
                'templateOptions.options': 'formState.cost_center_options',
              },
              lifecycle: {
                onInit: (from, field, model, options) => {
                  field.formControl.valueChanges.pipe(takeUntil(this.close$)).subscribe(id => {
                    let center = options.formState.cost_center_options.find(item=>item.value==id)
                    if(center['disabled'] == true){
                      field.templateOptions.nzDisabled = true;
                    }
                    const vendor_site = options.formState.vendor_site_list.find(item => item.category_id === id);
                    if (vendor_site &&  from.root.get('account_bank') ) {
                      const account_bank = vendor_site.account_number + vendor_site.account_name + vendor_site.account_bank;
                      from.root.get('account_bank').setValue(account_bank);
                      model.vendor_site_id = vendor_site.vendor_site_id;
                      this.cd.markForCheck();
                    }
                  });
                }
              }
            },
            {
              key: 'receivers',
              type: 'nz-select',
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '验收人',
                labelSpan: 8,
                autoSearch: false,
                nzRequired: true,
                nzServerSearch: true,
                callback: (name: string) => this.http.get('web/user/search-names', {
                    params: {enName: name}
                  }).pipe(map((res: any) => {
                    return res.data;
                  })),
                nzShowSearch: true,
                nzMode: 'multiple',
                options: [],
                nzValue: 'option'
              },
              expressionProperties: {
                'templateOptions.options': 'formState.receivers',
              },
            },

            {
              key: 'is_auto_payment',
              type: 'nz-radio',
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '是否自动发起付款',
                labelSpan: 8,
              },
              expressionProperties: {
                'templateOptions.options': 'formState.auto_payment_options',
              },
            },
            {
              key: 'is_finish_check',
              type: 'nz-radio',
              className: 'ant-col-16 mr-3',
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
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '知会人',
                labelSpan: 8,
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
              }
            },
            {
              key: 'notice_crowd_ids',
              type: 'nz-select',
              wrappers: ['field-wrapper'],
              className: 'ant-col-16 mr-3',
              templateOptions: {
                label: '其他知会人',
                // nzRequired: true,
                autoSearch: false,
                labelSpan: 8,
                nzServerSearch: true,
                callback: (name: string) => this.http.get('web/user/search-names', {
                    params: {enName: name}}).pipe(map((res: any) => {
                      return res.data;
                    })),
                nzShowSearch: true,
                nzMode: 'multiple',
                nzValue: 'value',
                options: [],
              },
              expressionProperties: {
                'templateOptions.options': 'formState.receivers',
              },
            },
            {
              key: 'memo',
              type: 'nz-textarea',
              className: 'ant-col-16',
              templateOptions: {
                label: '合同/订单说明',
                labelSpan: 8,
                placeholder: '请输入不超过200字的订单说明，将只有采购经理和订单审批人可见'
              }
            },
          ]
        },
        {
          type: 'nz-divider',
          className: 'ant-col-24',
          templateOptions: {
            nzText: '订单',
            nzDashed: true
          }
        },
        {
          className: 'ant-col-24',
          fieldGroupClassName: 'd-flex align-items-center mb-2 ',
          fieldGroup: [
            {
              type: 'nz-button',
              key: 'is_show_complete',
              className: 'mr-1 ml-auto',
              templateOptions: {
                label: '',
                nzSize: 'small',
                text: '使用期望交付日期',
                nzType: 'primary',
                type: 'isBoolean',
                onClick: (value) => {
                  return of(!value);
                }
              },
              lifecycle: {
                onInit: (from, field) => {
                  from.get('is_show_complete').valueChanges.pipe(takeUntil(this.close$)).pipe(debounceTime(200)).subscribe(item => {
                    this.completeDateChange$.next(item)
                    if (item) {
                      field.templateOptions.text = '重置期望交付日期';
                      field.templateOptions.nzType = '';
                    } else {
                      field.templateOptions.text = '使用期望交付日期';
                      field.templateOptions.nzType = 'primary';
                    }
                    this.cd.markForCheck();
                  });
                }
              }
            },
            {
              key: 'is_show_workload',
              type: 'nz-button',
              className: 'mr-1',
              templateOptions: {
                label: '',
                nzSize: 'small',
                nzType: 'primary',
                text: '使用预估工作量',
                onClick: (value) => of(!value)
              },
              lifecycle: {
                onInit: (from, field) => {
                  from.get('is_show_workload').valueChanges.pipe(takeUntil(this.close$)).pipe(debounceTime(100)).subscribe(item => {
                    if (!item) {
                      field.templateOptions.text = '使用预估工作量';
                      field.templateOptions.nzType = 'primary';
                    } else {
                      field.templateOptions.text = '重置预估工作量';
                      field.templateOptions.nzType = '';
                    }
                    this.cd.markForCheck();
                  });
                }
              }
            }
          ]
        },

        {
          key: 'thing_list',
          type: 'table-section',
          className: 'ant-col-24',
          fieldArray: {
            fieldGroup: [
              {
                key: 'story_name',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '需求名称',
                }
              },
              {
                key: 'contract_id',
                type: 'nz-label',
                hide: true,
              },
              {
                key: 'story_code',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '需求单号'
                }
              },
              {
                key: 'thing_name',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '物件名称'
                }
              },
              {
                key: 'thing_code',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '物件单号'
                }
              },
              {
                key: 'category',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '类别'
                }
              },
              {
                key: 'expected_expenditure',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '预计花费'
                },
                hideExpression: 'formState.category_type == 1'
              },
              {
                key: 'attribute',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '属性'
                },
                hide: true
              },
              {
                key: 'complete_date',
                type: 'date-picker',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '承诺交付日期',
                  nzRequired : true,
                  nzSize: 'small'
                },
                lifecycle: {
                  onInit: (from, field, model, options) => {
                    this.completeDateChange$.pipe(debounceTime(60)).subscribe(res => {
                      if(res == true){
                        field.formControl.setValue(model.expected_complete_date);
                      }else{
                        field.formControl.setValue("");
                      }
                      this.cd.markForCheck();
                    })
                  }
                }
              },
              {
                key: 'not_pass_percent',
                type: 'nz-number',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '不通过结算比例(%)',
                  nzRequired : true,
                  min: 0,
                  max: 100,
                },
                expressionProperties: {
                  hide: 'formState.is_test != 1'
                }
              },
              {
                key: 'expected_complete_date',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '期望交付日期'
                }
              },
              {
                key: 'pre_workload',
                type: 'inquiry-breakdown-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '预估工作量'
                }
              },
              {
                key: 'pre_produce_grade_name',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '等级'
                }
              },
              {
                key: 'production_staff',
                type: 'nz-label',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '制作人员'
                }
              },
              {
                key: 'quote',
                type: 'inquiry-quote',
                wrappers: ['empty-wrapper'],
                templateOptions: {
                  label: '报价',
                  options: [],
                  nzRequired: true,
                  workload_unit_list: [],
                  thing_project_breakdown_list: [],
                  currencyObj: [],
                  workload_unit_data: [],

                },
                lifecycle: {
                  onInit: (from, field, model, options) => {
                    if (field.model.id) {

                      // 工作量单位
                      model.quote.workload_unit_id = model.pre_workload_unit_id
                      if (this.createOrderConfig
                            && this.createOrderConfig.thing_price_obj
                            && this.createOrderConfig.thing_price_obj[field.model.id]
                            && this.createOrderConfig.thing_price_obj[field.model.id]['workload_unit_list']) {

                        let workload_unit_list = this.createOrderConfig.thing_price_obj[field.model.id]['workload_unit_list'];
                        field.templateOptions.workload_unit_data = this.createOrderConfig.thing_price_obj[field.model.id]['workload_unit_data'];

                        const categoryInfo =  this.createOrderConfig.contract_options.find(item => item.value === model.contract_id)
                        if (categoryInfo) {
                          const workload_unit_obj = categoryInfo.workload_unit_id_list

                          if (workload_unit_obj[model.category_id] && workload_unit_obj[model.category_id].length > 0) {//Number(workload_unit_obj[model.category_id])
                            // workload_unit_list = workload_unit_list.filter(item => item.value === workload_unit_obj[model.category_id])
                            // model.quote.workload_unit_id = workload_unit_obj[model.category_id]
                            workload_unit_list = workload_unit_list.filter(item => workload_unit_obj[model.category_id].some(value => item.value == value))
                            model.quote.workload_unit_id = workload_unit_obj[model.category_id].find(item => item === model.pre_workload_unit_id)
                          }
                        }
                        field.templateOptions.workload_unit_list = workload_unit_list
                      }

                      // 明细列表
                      if (this.createOrderConfig && this.createOrderConfig.thing_project_breakdown_obj && this.createOrderConfig.thing_project_breakdown_obj[field.model.id]) {
                        field.templateOptions.thing_project_breakdown_list = this.createOrderConfig.thing_project_breakdown_obj[field.model.id];
                      }

                      field.templateOptions.all_contract_price_remark = this.createOrderConfig['all_contract_price_remark'];
                    }

                    this.cd.markForCheck();

                    this.contractChange$.pipe(debounceTime(60)).subscribe(res => {
                      console.log(field, this.createOrderConfig)
                      if (field.model.id) {
                        // 工作量单位

                        model.quote.workload_unit_id = model.pre_workload_unit_id

                        if (this.createOrderConfig
                          && this.createOrderConfig.thing_price_obj
                          && this.createOrderConfig.thing_price_obj[field.model.id]
                          && this.createOrderConfig.thing_price_obj[field.model.id]['workload_unit_list']) {

                          let workload_unit_list = this.createOrderConfig.thing_price_obj[field.model.id]['workload_unit_list'];
                          field.templateOptions.workload_unit_data = this.createOrderConfig.thing_price_obj[field.model.id]['workload_unit_data'];
                          // 设置工作量单位下拉
                          const categoryInfo =  this.createOrderConfig.contract_options.find(item => item.value === model.contract_id)
                          if (categoryInfo) {
                           const workload_unit_obj = categoryInfo.workload_unit_id_list

                            if (workload_unit_obj[model.category_id] && workload_unit_obj[model.category_id].length > 0) {//Number(workload_unit_obj[model.category_id])
                                // workload_unit_list = workload_unit_list.filter(item => item.value === workload_unit_obj[model.category_id])
                                // model.quote.workload_unit_id = workload_unit_obj[model.category_id]
                                workload_unit_list = workload_unit_list.filter(item => workload_unit_obj[model.category_id].some(value => item.value == value))
                                model.quote.workload_unit_id = workload_unit_obj[model.category_id].find(item => item === model.pre_workload_unit_id)
                            }
                          }
                          field.templateOptions.workload_unit_list = workload_unit_list
                        }

                        // 明细列表
                        if (this.createOrderConfig && this.createOrderConfig.thing_project_breakdown_obj && this.createOrderConfig.thing_project_breakdown_obj[field.model.id]) {
                          field.templateOptions.thing_project_breakdown_list = this.createOrderConfig.thing_project_breakdown_obj[field.model.id];
                        }

                        if (this.currencyObj) {
                          field.templateOptions.currencyObj = this.currencyObj;
                          this.options.formState.currency_symbol = this.currencyObj['symbol']
                        }
                        field.templateOptions.all_contract_price_remark = this.createOrderConfig['all_contract_price_remark'];
                        this.cd.markForCheck();
                      }
                    });

                    field.formControl.valueChanges.pipe(takeUntil(this.close$)).subscribe(item => {
                      this.priceChange$.next();
                      this.cd.markForCheck();
                    });
                    this.cd.markForCheck();
                  }
                },
              },
            ]
          },
        },
        {
          key: 'order_all_price',
          type: 'nz-template',
          className: 'ant-col-6 ant-col-offset-18 text-red text-right mt-3',
          templateOptions: {
            innerHtml: of(`<div >订单金额: 0 CNY</div>`),
          },
          lifecycle: {
            onInit: (form, field, model, options) => {
              this.priceChange$.pipe(takeUntil(this.close$)).pipe(debounceTime(60)).subscribe(item => {
                let order_all_price = 0;
                let order_tax_amount = 0;
                let tax_value;

                const thingList = model.thing_list;

                if (thingList && thingList.length > 0) {
                  order_all_price = thingList.map(res => res && res.quote && res.quote.total_price ? res.quote.total_price : 0)
                                             .reduce((total, num) => Number(total) + Number(num));
                }

                if (model['exchange_rate'] && model['exchange_rate']['tax_value'] && model['exchange_rate']['tax_type']) {
                  if (!model['exchange_rate']['tax_value'] || model['exchange_rate']['tax_value'] === '') {
                    tax_value = 0;
                  } else {
                    tax_value = Number(model['exchange_rate']['tax_value']);
                  }

                  if (model['exchange_rate']['tax_type'] === '1' || model['exchange_rate']['tax_type'] === '2') {
                    order_tax_amount = Number(order_all_price) + Number(order_all_price) * tax_value;
                  } else if (model['exchange_rate']['tax_type'] === '3') {
                    order_tax_amount = Number(order_all_price) + Number(tax_value);
                  }
                }

                let innerHtml = `<div >订单金额: ${ this.commonFunctionService.numberFormat(order_all_price) } ${this.currencyObj['symbol'] || ''}</div>`;
                field.formControl.patchValue(order_all_price);

                if (options.formState.contract_tax_type === 2) {
                  innerHtml += `<div>订单含税金额: ${  this.commonFunctionService.numberFormat(order_tax_amount) } ${this.currencyObj['symbol'] || ''}</div>`;
                  field.formControl.patchValue(order_tax_amount);
                }

                field.templateOptions.innerHtml = of(innerHtml);
                this.cd.markForCheck();
              }, err => {
                // console.log(err);
              });
            }
          },
        }
      ]
    }
  ];

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modal: ModalService,
    private listService: ListService,
    private modalService: NzModalService,
    private cd: ChangeDetectorRef,
    private commonFunctionService: CommonFunctionService,
  ) {}

  ngOnInit() {
    this.onDestroy$ = new Subject<any>();
    this.modal.modal$.pipe(takeUntil(this.onDestroy$)).subscribe(item => {
      // 询价生成订单
      if (item && item['key'] === 'generate-order') {
        if (item['data']['thing_id']) {
          this.nzZIndex = item['zIndex'];
          this.generateOrderRef['container']['overlayElement'].style.zIndex = this.nzZIndex;
          this.thing_ids = item['data']['thing_id'];
          this.generateOrder(item['data']['thing_id'], item['data']['category_type']);
        } else {
          this.message.error('请选择物件单号');
        }
      }
      this.cd.markForCheck();
    });
  }

  // 生成订单
  generateOrder (thing_id, category_type) {

    this.options.formState.org_list = [];
    this.options.formState.vendor_site_list = [];
    this.options.formState.contract_tax_type = 1;
    this.options.formState.tax_list_options = [];
    this.options.formState.tax_type_options = [];
    this.options.formState.account_bank_list = [];
    this.options.formState.category_name_list = [];
    this.close$ = new Subject<any>();
    const id = this.message.loading('正在生成订单中...', { nzDuration: 0 }).messageId;
    this.cd.markForCheck();
    forkJoin([
      this.http.get('web/order/direct-create-order-config', {params: {thing_id: thing_id}}),
      this.http.get('web/department/department-options'),
      this.http.get('/web/department/sync-epo-order-config')
    ]).subscribe(res => {
      this.message.remove(id);
      this.isLoading = false;

      const result = res[0];
      const options: Array<any> = JSON.parse(JSON.stringify(res[1]['data']));

      if (result['code'] === 0 ) {
        this.isVisible = true;
        this.createOrderConfig = result;
        this.model = result['data'];

        this.options.formState.is_test = this.model['is_test'];
        //设置默认订单名
        this.options.formState.order_name = this.model['order_name'];
        // 设置供应商的下拉参数
        const supplier_id                   = this.fields[0].fieldGroup.find(item => item.key === 'supplier_id');
        supplier_id.templateOptions.options = result['supplier_options'];

        // 设置供应商合同号的默认值
        if (this.model['supplier_id'] && this.model['contract_id']) {
          this.model.select_supplier_and_contract = [this.model['supplier_id'], this.model['contract_id']];
        } else {
          this.model.select_supplier_and_contract = null;
        }

        this.contract_tax_type = 1;
        this.options.formState.contract_tax_type = 1;

        this.options.formState.contract_options = result['contract_options'];
        this.options.formState.supplier_options = result['supplier_options'];

        // 设置供应商和合同
        const select_supplier_and_contract  = this.fields[0].fieldGroup.find(item => item.key === 'select_supplier_and_contract');

        select_supplier_and_contract.templateOptions.nzOptions = result['supplier_options'].map(item => {
          const children = result['contract_options'].filter(res => res.supplier_id === item.value).map(r => {
            return {...r, value: r.value, label: r.label, isLeaf: true };
          });
          return { value: item.value, label: item.label, children: children ? children : null };
        });

        // 代理人
        const agent                         = this.fields[0].fieldGroup.find(item => item.key === 'agent');
        agent.templateOptions.options       = result['agent_options'];

        // 经办人和经办中心
        const handling_department_and_center = this.fields[0].fieldGroup.find(item => item.key === 'handling_department_and_center');
        const departmentOptions = options.map(items => {
          const children = items.children ? items.children.map(item => {
            return { label: item.name, value: item.id, dept_id: item.dept_id, parent_id: item.parent_id, isLeaf: true};
          }) : null;

          return {
            label: items.name,
            value: items.id,
            dept_id: items.dept_id,
            parent_id: items.parent_id,
            isLeaf: children ? false : true,
            children: children ? children : null
          };
        });

        handling_department_and_center.templateOptions.nzOptions = JSON.parse(JSON.stringify(departmentOptions));

        // 设置供应商选择的方法
        const select_reason = this.fields[0].fieldGroup.find(item => item.key === 'select_reason');
        select_reason.templateOptions.options = result['select_reason_options'];

        // 设置供应商选择的方法
        const pushEpo = this.fields[0].fieldGroup.find(item => item.key === 'sync_gen_epo_order');
        pushEpo.templateOptions.ids = this.checkListsId;


        this.isLoaded = true;
        this.cd.markForCheck();
      } else {
        this.errMsg = result['msg'];
        this.message.error(result['msg']);
        this.cd.markForCheck();
      }
      // 设置
    }, (err) => {
      this.message.remove(id);
      this.message.error('网络异常，请稍后再试');
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
          this.save()
        }
      })
    }else{
      this.save()
    }
  }
  // 点击生成订单的保存按钮
  save () {
    if(this.model['is_set_secrecy'] && this.model['secrecy_codes'].length === 0){
      this.message.error('请输入保密范围');
      return false;
    }
    if (this.model.select_supplier_and_contract === null
        || this.model.select_supplier_and_contract.length === 0
        || this.model.supplier === null
        || this.model.contract === null) {
      this.message.error('请选择供应商/合同');
      this.cd.markForCheck();
      return false;
    }

    if (!this.model.select_reason) {
      this.message.error('请选择供应商选择方法');
      this.cd.markForCheck();
      return false;
    }

    if (!(this.model['receive_date'] || this.model['receive_date'] === '0' || this.model['receive_date'] === 0)) {
      this.message.error(`接收订单天数不能为空`);
      this.cd.markForCheck();
      return false;
    }

    if (!this.model.online_commit_price) {
      this.message.error('请选择是否线上确认价格');
      this.cd.markForCheck();
      return false;
    }

    if (!this.model.online_make_order) {
      this.message.error('请选择是否线上交付作品及订单变更');
      this.cd.markForCheck();
      return false;
    }

    if (!this.model.online_accept_order) {
      this.message.error('请选择是否线上接收订单');
      this.cd.markForCheck();
      return false;
    }

    if (this.model.sync_gen_epo_order) {
      if (!this.model['org_id'] || this.model['org_id'] == '0') {
        this.message.error(`我方主体不能为空`);
        this.cd.markForCheck();
        return false;
      }
      if (!this.model['mba_item_id'] && this.options.formState.mba_has_resources == 1) {
        this.message.error(`请选择物料`);
        this.cd.markForCheck();
        return false;
      }
    }


    if (this.model.thing_list && this.model.is_test === 1
        && this.model.thing_list.some(item => item.not_pass_percent == null)) {
      const thing = this.model.thing_list.find(item => item.not_pass_percent == null);
      this.message.error('需求名称：' + thing.story_name + '不通过结算比例不能为空');
      this.cd.markForCheck();
      return false;
    }

    // if ( Number(this.model['prepayments_amount']) > Number((Number(this.model['order_all_price'])  * 0.3).toFixed(3))) {
    //   this.message.warning(`预付款金额不可超过订单金额的30% (${(Number(this.model['order_all_price'])  * 0.3).toFixed(3)})${this.currencyObj['symbol']}`);
    //   this.cd.markForCheck();
    // }

    let flag = false;

    if (this.model.thing_list && this.model.thing_list.length > 0) {
      this.model.thing_list.forEach((item, index) => {
        if (item.price_type == 3 || item.price_type == 4) {
          if (item.quote && (!item.quote.workload_unit_id || item.quote.workload_unit_id == 0)) {
            flag = true;
            this.message.error(item.thing_code + '的单位未填写');
            this.cd.markForCheck();
            return;
          }
          if (item.quote && !item.quote.unit_price) {
            flag = true;
            this.message.error(item.thing_code + '的单价未填写');
            this.cd.markForCheck();
            return;
          }
          if (item.quote && !item.quote.workload) {
            flag = true;
            this.message.error(item.thing_code + '的数量未填写');
            this.cd.markForCheck();
            return;
          }
        }
      });
    }

    if (flag) {
      return;
    }

   if ((!this.model.project_org_name && this.check_msg == '' && this.check_epo_msg == '') || this.options.formState.orgIdValidateInfo || (this.check_msg && this.check_msg!= 'pass')) {
      let msg = '';
      if (!this.model.project_org_name) {
        msg = '该产品税务未配置对应主体，请与税务及财管确认主体信息后再使用合同';
      } else if (this.options.formState.orgIdValidateInfo) {
        msg = this.options.formState.orgIdValidateInfo;
      }

      console.log(this.check_msg);
      if(this.check_msg){
        msg = this.check_msg;
      }

      this.modalService.create({
        nzTitle: '提示',
        nzContent: msg,
        nzClosable: false,
        nzOnOk: () => {
          this.submit();
        }
      });
      this.cd.markForCheck();
    } else {
      this.submit();
    }
  }


  submit () {
    this.isOkLoading = true;
    this.cd.markForCheck();
    this.http.post('/web/order/direct-create-order-submit', {...this.model}).subscribe(result => {
      this.isOkLoading = false;
      if (result['code'] === 0) {
        this.message.success('生成订单成功，订单号：' + result['data']);
        this.menuService.getBacklog();
        this.listService.getList('price/inquiry');
        this.close();
        this.cd.markForCheck();
      } else {
        this.message.error(result['msg']);
        this.cd.markForCheck();
      }
    }, () => {
      this.isOkLoading = false;
      this.cd.markForCheck();
    });
  }

  close () {
    this.model = null;
    this.isVisible = false;
    this.close$.next();
    this.close$.complete();
    this.cd.markForCheck();
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
