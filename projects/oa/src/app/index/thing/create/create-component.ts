import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router} from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { merge } from 'rxjs';
import { MessageService} from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { differenceInCalendarDays, addDays } from 'date-fns';
import { ModalService } from '../../../services/modal.service';


@Component({
  templateUrl: './create-component.html',
  styles: [`
    :host ::ng-deep .ant-form-item-label label {
      margin-bottom: 0;
    }
  `]
})

export class CreateComponent  implements OnInit {
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private message: MessageService,
    public uploadService: UploadService,
    private modalService: ModalService
  ) {}

  // 项目名称的下拉选项
  projectSelectedOptions = [];
  project_id = '';
  story_id = '';
  story_code = '';
  is_demand_edit = '';

  // Formly表单的字段
  formGroup = new FormGroup({});
  form = new FormGroup({});
  model: any = {
    is_demand_edit: false,
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
    cost_center_code: ''
  };
  options: FormlyFormOptions = {};

  // 项目对应意向CP
  supplierObj = {};

  // 是否渲染表单
  isRenderForm = false;
  isSaveLoading = false;
  isSubmitLoading = false;

  isAuth = false;
  isAuthErrorMsg: '';

  // 保存服务器获取的信息
  getdemandinfo: {};

  today = new Date();

  formFields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          key: 'is_demand_edit',
          type: 'nz-label',
          hide: true
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
            options: []
          },
          lifecycle: {
            onInit: (from, field: FormlyFieldConfig) => {
              from.get('project_product_id').valueChanges.subscribe(id => {
                if (this.getdemandinfo['project_budget'] &&  this.getdemandinfo['project_budget'][id]) {
                  from.get('brand_available').setValue(this.getdemandinfo['project_budget'][id]['brand_available']);
                  from.get('brand_budget').setValue(this.getdemandinfo['project_budget'][id]['brand_budget']);
                  from.get('product_available').setValue(this.getdemandinfo['project_budget'][id]['product_available']);
                  from.get('product_budget').setValue(this.getdemandinfo['project_budget'][id]['product_budget']);
                }
              });
            }
          },
          hide: false,
        },
        {
          key: 'project_id',
          type: 'nz-select',
          className: 'ant-col-6',
          templateOptions: {
            label: '项目名称',
            nzLayout: 'fixedwidth',
            nzValue: 'value',
            nzPlaceHolder: '请选择',
            nzRequired: true,
            options: []
          },
          hide: true,
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
          hide: true,
          expressionProperties: {
            'templateOptions.disabled': 'true',
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
          hide: true,
          expressionProperties: {
            'templateOptions.disabled': 'true',
          },
        },
        {
          type: 'nz-input',
          key: 'brand_principal',
          className: 'ant-col-6',
          expressionProperties: {
            'templateOptions.disabled': 'true',
          },
          hide: true,
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
          }
        },
        {
          key: 'story_code',
          type: 'nz-input',
          className: 'ant-col-6',
          expressionProperties: {
            'templateOptions.disabled': 'true',
          },
          templateOptions: {
            label: '需求编号',
            nzLayout: 'fixedwidth',
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
          expressionProperties: {
            'templateOptions.disabled': '!model.is_demand_edit',
          },
        },
        {
          key: 'creator',
          type: 'nz-select',
          className: 'ant-col-6',
          templateOptions: {
            label: '录入人',
            nzLayout: 'fixedwidth',
            options: [],
            nzValue: 'option',
            nzPlaceHolder: '请选择',
          },
          expressionProperties: {
            'templateOptions.disabled': 'true',
          },
          hide: true,
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
          expressionProperties: {
            'templateOptions.disabled': '!model.is_demand_edit',
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
          }
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
          }
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
          type: 'nz-template',
          className: 'ant-col-6',
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
          expressionProperties: {
            'templateOptions.template': () => `
              <div class="media ant-form-item-label" >
                <label class="text-right pl-1">可用/总产品费用</label>
                <p class="media-body text-left mb-0"><a class="text-primary">
                  ${this.model.product_available}</a>/<a class="text-primary">${this.model.product_budget}</a></p>
              </div >
            `
          }
        },
        {
          type: 'nz-template',
          className: 'ant-col-6',
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
          expressionProperties: {
            'templateOptions.template': () => `
            <div class="media ant-form-item-label" >
              <label class="text-right pl-1">可用/总品牌费用</label>
              <p class="media-body text-left mb-0"><a class="text-primary">
                ${this.model['brand_available']}</a>/<a class="text-primary">${this.model['brand_budget']}</a></p>
            </div >
            `
          }
        },
        {
          key: 'budget_price',
          type: 'nz-input',
          className: 'ant-col-6',
          templateOptions: {
            nzType: 'number',
            label: '预计花费合计',
            nzPlaceHolder: '请输入',
            nzLayout: 'fixedwidth',
            disabled: true
          }
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
          hide: true,
          expressionProperties: {
            'templateOptions.disabled': '!model.is_demand_edit',
          }
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
          expressionProperties: {
            'templateOptions.disabled': '!model.is_demand_edit',
          }
        },
        {
          key: 'attachment_id',
          type: 'create-demand-upload-component',
          className: 'ant-col-24',
          templateOptions: {
            label: '需求附件',
            nzLayout: 'fixedwidth',
            key: '1025',
            options: []
          },
          expressionProperties: {
            'templateOptions.nzDisabled': '!model.is_demand_edit',
          },
        },
        {
          key: 'story_remark',
          type: 'nz-textarea',
          className: 'ant-col-24',
          templateOptions: {
            label: '需求说明',
            nzPlaceHolder: '不超过1000个字符',
            nzRow: 3,
            nzLayout: 'fixedwidth',
          },
          expressionProperties: {
            'templateOptions.disabled': '!model.is_demand_edit',
          },
        },
        {
          type: 'create-demand-tabs',
          key: 'first_category_list',
          className: 'ant-col-24',
          templateOptions: {
            label: '分类',
            nzLayout: 'fixedwidth',
            price_library_list: [],
            options: []
          },
          fieldArray: {
            fieldGroupClassName: 'row',
            fieldGroup: [
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
                key: 'thing_list',
                type: 'table-section',
                className: 'ant-col-24 p-3',
                templateOptions: {
                  nzTitleTemplate: true,
                  nzTitle: 'nzAddTemplate',
                  label: '操作',
                  type: 'action',
                  nzWidthConfig: ['180px', '180px', '460px', '140px', '140px', '140px', '200px', '180px', '100px', '140px'],
                  options: [ {
                    type: 'copy',
                    label: '复制',
                  }, {
                    type: 'remove',
                    label: '删除'
                  }]
                },
                lifecycle: {
                  onInit: (from, field: FormlyFieldConfig) => {
                    // 物件类别
                    const category_id = field.fieldArray.fieldGroup.find(res => res.key === 'category_id');
                    const id = field.formControl.parent.value.id;
                    const category = this.getdemandinfo['category_list'].find(res => res.id === id);
                    if (category && category.child_category) {
                      category_id.templateOptions.options = category.child_category.map(item => {
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
                      key: 'thing_name',
                      type: 'nz-input',
                      wrappers: ['empty-wrapper'],
                      templateOptions: {
                        label: '物件名称',
                        nzRequired: true
                      }
                    },
                    {
                      key: 'category_id',
                      type: 'nz-select',
                      wrappers: ['empty-wrapper'],
                      templateOptions: {
                        label: '类别',
                        nzPlaceHolder: '请选择',
                        nzRequired: true,
                        options: [],
                        nzValue: 'value'
                      },
                      lifecycle: {
                        onInit: (from, field: FormlyFieldConfig) => {
                          // 物件类别
                          const category_id = field.formControl.parent.parent.parent.value.id;
                          const category = this.getdemandinfo['category_list'].find(res => res.id === category_id);
                          if (category && category.child_category) {
                            field.templateOptions.options = category.child_category.map(item => {
                              return {
                                label: item.name,
                                value: item.id
                              };
                            });
                          }
                        }
                      },
                    },
                    {
                      key: 'produce_breakdowns',
                      type: 'create-demand-breakdowns',
                      wrappers: ['empty-wrapper'],
                      templateOptions: {
                        label: '数量',
                        nzRequired: true,
                        price_template_library_list: [],
                        is_breakdown: 0,
                        produceBreakdowns: []
                      },
                      lifecycle: {
                        onInit: (from, field: FormlyFieldConfig) => {
                          // 获取类别, 动态改变等级的下拉选项
                          from.parent.get('category_id').valueChanges.subscribe(id => {
                            field.templateOptions.produceBreakdowns = this.getdemandinfo['produce_breakdown_grade_list']
                                  .find(res => res.id + '' === id + '')
                                  ? this.getdemandinfo['produce_breakdown_grade_list']
                                      .find(res => res.id + '' === id + '').produceBreakdowns : [];

                            field.templateOptions.is_breakdown = this.getdemandinfo['produce_breakdown_grade_list']
                                  .find(res => res.id + '' === id + '')
                                  ? this.getdemandinfo['produce_breakdown_grade_list']
                                      .find(res => res.id + '' === id + '').is_breakdown : [];
                            field.templateOptions.price_template_library_list = this.getdemandinfo['price_template_library_list'];
                            field.templateOptions.price_library_list = this.getdemandinfo['price_library_list'];
                          });

                          if (from.parent.get('category_id').value) {
                            const id = from.parent.get('category_id').value + '';
                            field.templateOptions.produceBreakdowns = this.getdemandinfo['produce_breakdown_grade_list']
                                .find(res => res.id + '' === id + '')
                                  ? this.getdemandinfo['produce_breakdown_grade_list']
                                    .find(res => res.id + '' === id + '').produceBreakdowns : [];
                            field.templateOptions.is_breakdown = this.getdemandinfo['produce_breakdown_grade_list']
                                .find(res => res.id + '' === id + '')
                                ? this.getdemandinfo['produce_breakdown_grade_list'].find(res => res.id + '' === id + '').is_breakdown : [];
                            field.templateOptions.price_template_library_list = this.getdemandinfo['price_template_library_list'];
                            field.templateOptions.price_library_list = this.getdemandinfo['price_library_list'];
                          }
                        }
                      },
                    },
                    {
                      key: 'is_lock_breakdown_number',
                      type: 'nz-checkbox',
                      wrappers: ['empty-wrapper'],
                      templateOptions: {
                        label: '禁止CP修改明细 ',
                        type: 'isBoolean',
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
                        options: [],
                        nzValue: 'value',
                        nzRequired: true
                      },
                      lifecycle: {
                        onInit: (from, field: FormlyFieldConfig) => {
                          // 工作量单位
                          const options = this.getdemandinfo['workload_unit_list'].map(res => {
                            return {
                              label: res.label,
                              value: res.value + ''
                            };
                          });
                          field.templateOptions.options = options;

                          if (!from.parent.get('pre_workload_unit_id').value) {
                            field.formControl.setValue(options[0].value);
                          }

                          // 获取类别, 动态改变等级的下拉选项*
                          from.parent.get('category_id').valueChanges.subscribe(id => {
                            if (!from.parent.get('pre_workload_unit_id').value) {
                              field.formControl.setValue(options[0].value);
                            }
                          });
                        }
                      },
                    },
                    {
                      key: 'pre_produce_grade_id',
                      type: 'nz-select',
                      wrappers: ['empty-wrapper'],
                      templateOptions: {
                        label: '制作等级',
                        nzPlaceHolder: '请选择',
                        options: [],
                        nzValue: 'value',
                      },
                      lifecycle: {
                        onInit: (from, field: FormlyFieldConfig) => {
                          const id = from.parent.get('category_id').value + '';
                          const option = this.getdemandinfo['produce_breakdown_grade_list']
                                             .find(res => res.id + '' === id + '') ?
                                                this.getdemandinfo['produce_breakdown_grade_list']
                                                    .find(res => res.id + '' === id + '')
                                                    .produceGrades.map(res => ({label: res.title, value: res.id + ''}))
                                                : [];

                          field.templateOptions.options = option;
                          if (from.parent.get('category_id').value) {
                            if ( option.length < 1 ) {
                              field.formControl.setValue(null);
                              field.templateOptions.nzPlaceHolder = 'NA';
                              field.templateOptions.nzDisabled = true;
                            }

                            if (option.length > 0) {
                              field.templateOptions.nzPlaceHolder = '请选择';
                              field.templateOptions.nzDisabled = false;
                            }
                          }
                          // 获取类别, 动态改变等级的下拉选项*
                          from.parent.get('category_id').valueChanges.subscribe(id => {
                            const options = this.getdemandinfo['produce_breakdown_grade_list'].find(res => res.id + '' === id + '') ?
                                              this.getdemandinfo['produce_breakdown_grade_list']
                                                  .find(res => res.id + '' === id + '')
                                                  .produceGrades
                                                  .map(res => ({label: res.title, value: res.id + ''}))
                                              : [];
                            //  参数
                            if ( options.length < 1 ) {
                              field.formControl.setValue(null);
                              field.templateOptions.nzPlaceHolder = 'NA';
                              field.templateOptions.nzDisabled = true;
                            }

                            if (options.length > 0) {
                              field.formControl.setValue(options[0].value);
                              field.templateOptions.nzPlaceHolder = '请选择';
                              field.templateOptions.nzDisabled = false;
                            }

                            field.templateOptions.options = options;
                          });
                        }
                      },
                    },
                    {
                      key: 'expected_expenditure',
                      type: 'nz-number',
                      wrappers: ['empty-wrapper'],
                      defaultValue: 0,
                      templateOptions: {
                        label: '预计花费',
                        nzRequired: true,
                      },
                      lifecycle: {
                        onInit: (from, field: FormlyFieldConfig) => {
                          merge(
                            from.parent.get('category_id').valueChanges,
                            from.parent.get('produce_breakdowns').valueChanges,
                            from.parent.get('pre_workload_unit_id').valueChanges,
                            from.parent.get('pre_produce_grade_id').valueChanges,
                          ).subscribe(data => {
                            let thing_price = 0;
                            let model = JSON.parse(JSON.stringify(field.model));
                            model.pre_produce_grade_id = from.parent.get('pre_produce_grade_id').value;
                            model.pre_workload_unit_id = from.parent.get('pre_workload_unit_id').value;

                            if (model.price_type === '1') {
                              thing_price = model.unit_price;
                            } else if (model.price_type === '2') {
                              thing_price =
                                  model.pre_produce_breakdown ?
                                      model.pre_produce_breakdown.map(res => {
                                        let unit_price =
                                            this.getdemandinfo['price_library_list'].find(value =>
                                                value.category_id === model.category_id + ''
                                                && value.produce_breakdown_id === res.id + ''
                                                && (value.produce_grade_id === model.pre_produce_grade_id + '' || value.produce_grade_id === '0' )
                                                && value.workload_unit_id === model.pre_workload_unit_id + '' )
                                                return unit_price && res.value ? Number(unit_price.unit_price) * Number(res.value) : 0;
                                            }).reduce((total, num) => {
                                                return Number(total) + Number(num);
                                            })  : 0;
                            } else if (model.price_type === '3') {
                              let total_price =
                                  model.pre_produce_breakdown ?
                                      model.pre_produce_breakdown.map(res => {
                                          let unit_price =
                                              this.getdemandinfo['price_library_list']
                                                  .find(value =>
                                                    value.category_id === model.category_id + ''
                                                    && value.produce_breakdown_id === res.id + ''
                                                    &&( value.produce_grade_id === model.pre_produce_grade_id + '' || value.produce_grade_id === '0')
                                                    && value.workload_unit_id === model.pre_workload_unit_id + '' );

                                          return unit_price && res.value ? Number(unit_price.unit_price) * Number(res.value) : 0;
                                      }).reduce((total, num) => {
                                        return Number(total) + Number(num);
                                      }) : 0;

                                      let number = model.pre_workload ? Number(model.pre_workload) : 1;
                                      thing_price = Number(total_price) * Number(number);
                            } else {
                              thing_price = 0;
                            }

                            field.formControl.patchValue(thing_price);
                          });
                        }
                      }
                    },
                    {
                      key: 'expected_complete_date',
                      type: 'date-picker',
                      wrappers: ['empty-wrapper'],
                      defaultValue: addDays(this.today, 7) ,
                      templateOptions: {
                        label: '期望完成日期',
                        nzRequired: true,
                        nzDisabledDate: (current: Date) => {
                          return differenceInCalendarDays(current, this.today) < 0;
                        }
                      }
                    },
                    {
                      key: 'pre_supplier_id',
                      type: 'nz-select',
                      wrappers: ['empty-wrapper'],
                      templateOptions: {
                        label: '意向供应商',
                        nzPlaceHolder: '可选供应商',
                        nzShowSearch: true,
                        nzAllowClear: true,
                        options: [],
                        nzValue: 'value'
                      },
                      lifecycle: {
                        onInit: (from, field: FormlyFieldConfig) => {
                          // 获取类别, 动态改变等级的下拉选项
                          from.parent.get('category_id').valueChanges.subscribe(id => {
                            if (from.parent.get('pre_supplier_id').value) {
                              field.formControl.setValue('');
                            }
                            const key = this.model.project_id + '_' + id;
                            // 是否已有对应意向供应商列表
                            if (this.supplierObj[key]) {
                              field.templateOptions.options = this.supplierObj[key];
                              return;
                            }
                            this.http.get('web/supplier-shortlist/get-project-category', {
                              params: {
                                project_id: this.model.project_id,
                                category_id: id
                              }
                            }).subscribe(result => {
                              if (result['code'] == 0) {
                                this.supplierObj[key] = result['data'];
                                field.templateOptions.options = this.supplierObj[key];
                              } else {
                                this.message.error(result['msg']);
                              }
                            }, (err) => {
                              this.message.error('网络异常，请稍后再试');
                            });

                          });

                          if (from.parent.get('category_id').value) {
                            const id = from.parent.get('category_id').value;
                            const key = this.model.project_id + '_' + id;
                            if (this.supplierObj[key]) {
                              field.templateOptions.options = this.supplierObj[key];
                              return;
                            } else {
                              this.http.get('web/supplier-shortlist/get-project-category', {
                                params: {
                                  project_id: this.model.project_id,
                                  category_id: id
                                }
                              }).subscribe(result => {
                                if (result['code'] == 0) {

                                  this.supplierObj[key] = result['data'];
                                  field.templateOptions.options = this.supplierObj[key];
                                } else {
                                  this.message.error(result['msg']);
                                }
                              }, (err) => {
                                this.message.error('网络异常，请稍后再试');
                              });
                            }
                          }
                        }
                      },
                    },
                    {
                      key: 'remark',
                      type: 'nz-input',
                      wrappers: ['empty-wrapper'],
                      templateOptions: {
                        label: '备注',
                        nzPlaceholder: '采购经理及审核人可见',
                      }
                    },

                  ]
                }
              }
            ]
          }
        },
      ]
    }

];


  ngOnInit() {
    this.route.params.subscribe(params => {
      let data = {};
      if (params && params['storyId']) {
        data = {
          params: {
            story_id: params['storyId'] || 0
          }
        };
        this.story_id =  params['storyId'];
      }
      this.http.get('web/demand/create-demand', data).subscribe( response => {
        if (response['code'] === 0) {
          this.project_id =  response['data']['demand']['project_id'] + '';
          this.projectSelectedOptions = response['data']['project_list'];

          this.story_code = response['data']['demand']['story_code'];
          this.is_demand_edit = response['data']['demand']['is_demand_edit'];
          this.isAuth = true;
          this.onModelChange(this.project_id);
        } else {
          this.isAuth = false;
          this.isAuthErrorMsg = response['msg'];
        }
      });
    });
  }

  // 项目选择下拉发生改变
  onModelChange (id) {
    this.isRenderForm = false;
    this.model = {
      is_demand_edit: false,
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
      brand_group_leader: ''
    };
    // this.formFields = null
    this.options = {};
    this.form = new FormGroup({});
    // this.options.resetModel(null)
    this.http.get('/web/demand/get-demand-info', {
      params: {
        'story_id': this.story_id,
        'project_id': id + ''
      },
      observe: 'response'
    }).subscribe(res => {
      if (res.body['code'] === -1) {
        this.isAuth = false;
        this.isAuthErrorMsg = res.body['msg'];
        return;
      }

      if (res['body']['code'] === -1) {
        this.message.error(res['body']['msg']);
        return false;
      }

      this.getdemandinfo = res['body']['data'];
      this.model.project_role = this.getdemandinfo['project_id'];

      // 立项信息
      const project_product_id = this.formFields[0].fieldGroup.find(item => item.key === 'project_product_id');
      project_product_id.templateOptions.options = this.getdemandinfo['project_product'];

      // 下拉参数
      const cost_center_code = this.formFields[0].fieldGroup.find(item => item.key === 'cost_center_code');
      cost_center_code.templateOptions.options = this.getdemandinfo['project_cost_center']
          ? this.getdemandinfo['project_cost_center'].map(item => {
              return {value: item.cost_center_code, label: item.cost_center_name, id: item.id };
            }) : [];

      // 下拉参数
      const manager_id = this.formFields[0].fieldGroup.find(item => item.key === 'manager_id');
      manager_id.templateOptions.options = this.getdemandinfo['manager_list'];

      manager_id.lifecycle = {
        onInit: (from, field: FormlyFieldConfig) => {
          from.get('budget_type').valueChanges.subscribe(id => {
            const options = this.getdemandinfo['manager_list'].filter(res => res.budget_type === id);
            field.templateOptions.options = options;
            field.formControl.setValue(null);
          });
          if (from.get('budget_type').value) {
            const options = this.getdemandinfo['manager_list'].filter(res => res.budget_type === from.get('budget_type').value);
            field.templateOptions.options = options;
          }
        }
      };

      const brand_manager = this.formFields[0].fieldGroup.find(item => item.key === 'brand_manager');
      brand_manager.lifecycle = {
        onInit: (from, field: FormlyFieldConfig) => {
          field.templateOptions.options = this.getdemandinfo['brand_manager_list'];
          field.hide = true;
          if (this.getdemandinfo['brand_manager_list'].length > 0) {
            from.get('budget_type').valueChanges.subscribe(id => {
              if (id === 2) {
                field.hide = false;
              } else {
                field.hide = true;
              }
            });
            if (from.get('budget_type').value) {
              if (from.get('budget_type').value === 2) {
                field.hide = false;
              } else {
                field.hide = true;
              }
            }
          }
        }
      };
      // brand_manager.templateOptions.options = this.getdemandinfo['brand_manager_list'];

      const attachment_id = this.formFields[0].fieldGroup.find(item => item.key === 'attachment_id');
      attachment_id.templateOptions.options = this.getdemandinfo['demand']['attachment_list'];

      const first_category_list = this.formFields[0].fieldGroup.find(item => item.key === 'first_category_list');
      first_category_list.templateOptions.options = this.getdemandinfo['first_category_list'].map(res => {
        return { label: res.title, value: res.id};
      });

      first_category_list.templateOptions.price_library_list = this.getdemandinfo['price_library_list'];

      const budget_type = this.formFields[0].fieldGroup.find(item => item.key === 'budget_type');
      const budget_type_options = this.getdemandinfo['budget_type'].map(item => {
        return {
          value: item.budget_type,
          label: item.budget_type_name
        };
      });
      budget_type.templateOptions.options =  budget_type_options;

      const brand_group_leader = this.formFields[0].fieldGroup.find(item => item.key === 'brand_group_leader');
      brand_group_leader.templateOptions.options = this.getdemandinfo['brand_group_leader_option']
          ? this.getdemandinfo['brand_group_leader_option'] : [];

      // 如果是编辑
      if (this.story_id) {
        this.http.post('/web/demand/thing-list', {
          'story_id': this.story_id,
          'project_id' : id,
          'first_category_id':  this.getdemandinfo['first_category_id']
        }).subscribe(res => {
          this.model = {
            is_demand_edit:       this.is_demand_edit,
            project_id:           id,
            story_id:             this.story_id + '',
            story_code:           this.story_code,
            project_product_id:   this.getdemandinfo['project_product_id'],
            product_name:         this.getdemandinfo['product_name'],
            budget_price:         this.getdemandinfo['demand']['budget_price'] ?  this.getdemandinfo['demand']['budget_price']  : null,
            project_group_name:   this.getdemandinfo['project_group_name'],
            brand_principal:      this.getdemandinfo['brand_principal']['label'],
            story_name:           this.getdemandinfo['demand']['story_name'],
            manager_id:           this.getdemandinfo['demand']['manager_id'] + '',
            budget_type:          this.getdemandinfo['demand']['budget_type'],
            attachment_id:        this.getdemandinfo['demand']['attachment_id'],
            brand_available:      this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']] && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_available'] ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_available'] : 0,
            brand_budget:         this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']] && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_budget'] ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_budget'] : 0,
            product_available:    this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']] && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_available'] ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_available'] : 0,
            product_budget:       this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']] && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_budget'] ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_budget'] : 0,
            story_remark:         this.getdemandinfo['demand']['remark'],
            brand_manager:        this.getdemandinfo['demand']['brand_manager'],
            project_role:         this.getdemandinfo['project_role'],
            cost_center_code:     this.getdemandinfo['demand']['cost_center_code'],
            brand_group_leader:     this.getdemandinfo['demand']['brand_group_leader'].toString(),
          };

          this.model.first_category_list = JSON.parse(JSON.stringify(res['data']));
          this.isRenderForm = true;
        });
      } else {
          const newModel = {
            is_demand_edit:         this.is_demand_edit,
            project_id:             id,
            product_name:           this.getdemandinfo['product_name'],
            story_code:             this.story_code,
            project_product_id:     this.getdemandinfo['project_product_id'],
            project_group_name:     this.getdemandinfo['project_group_name'],
            budget_price:           this.getdemandinfo['demand']['budget_price'] ?  this.getdemandinfo['demand']['budget_price']  : null,
            brand_principal:        this.getdemandinfo['brand_principal']['label'],
            story_name:             this.getdemandinfo['demand']['story_name'],
            brand_available:        this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']] && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_available'] ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_available'] : 0,
            brand_budget:           this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']] &&  this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_budget'] ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['brand_budget'] : 0,
            product_available:      this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']] && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_available'] ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_available'] : 0,
            product_budget:         this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']] && this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_budget'] ? this.getdemandinfo['project_budget'][this.getdemandinfo['project_product_id']]['product_budget'] : 0,
            brand_manager:          this.getdemandinfo['demand']['brand_manager'],
            project_role:         this.getdemandinfo['project_role'],
            cost_center_code:     this.getdemandinfo['demand']['cost_center_code'],
            brand_group_leader:     this.getdemandinfo['demand']['brand_group_leader'],
          };
          newModel['first_category_list'] = [];
          this.model = newModel;
          if (budget_type_options.length === 1) {
            this.model.budget_type = budget_type_options[0].value;
          }
          this.isRenderForm = true;
      }
    });
  }

  save(isSubmit = false) {
    this.isSaveLoading = true;
    this.message.isAllLoading = true;
    if (this.model.story_remark && this.model.story_remark.length > 1000) {
      this.isSaveLoading = false;
      this.message.isAllLoading = false;
      this.message.error('需求说明不能超过1000个字符');
    }
    if (!this.model.brand_group_leader || this.model.brand_group_leader === '0') {
      this.isSaveLoading = false;
      this.message.isAllLoading = false;
      this.message.error('品牌组长不能为空');
    }
    this.http.post('web/demand/save', this.model, {
      observe: 'response'
    }).subscribe(response => {
      this.isSaveLoading = false;
      if (response['body']['code'] === 0) {
        this.model.story_id =  response['body']['story_id'];
        if (!isSubmit) {
          this.message.isAllLoading = false;
          if (!this.model.first_category_list) {
            this.message.error('物件数据为空，不能提交');
            this.isSubmitLoading = false;
            return false;
          }
          if (this.model.first_category_list.length === 0) {
            this.message.error('物件数据为空，不能提交');
            this.isSubmitLoading = false;
            return false;
          }
          this.message.success('保存成功');
        }
        // this.isRenderForm = false;
        this.story_id =  response['body']['story_id'];
        this.http.post('/web/demand/thing-list', {
          'story_id': this.model.story_id,
          'project_id': this.model['project_id'],
          'first_category_id':  this.getdemandinfo['first_category_id']
        }).subscribe(res => {
          this.isRenderForm = false;
          this.options.resetModel({...this.model, first_category_list: JSON.parse(JSON.stringify(res['data']))});
          this.isRenderForm = true;
          if (isSubmit) {
            this.message.isAllLoading = true;
            // 判断预算是否够用
            if (this.model.budget_type == 1) {
              if (parseFloat(this.model.budget_price) > parseFloat(this.model.brand_available)) {
                this.message.error('可用品牌预算不足');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                return false;
              }
            } else if (this.model.budget_type == 2) {
              if (parseFloat(this.model.budget_price) > parseFloat(this.model.product_available)) {
                this.message.error('可用产品预算不足');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                return false;
              }
            } else {
              this.message.error('请选择预算类型');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            if (!this.model.first_category_list) {
              this.message.error('物件数据为空，不能提交');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            if (!this.model.project_product_id || this.model.project_product_id.toString() === '0') {
              this.message.error('立项信息为空，不能提交，没有立项信息请联系品牌负责人配置');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            if (!this.model.story_name) {
              this.message.error('需求名称为空，不能提交');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            if (!this.model.cost_center_code) {
              this.message.error('成本中心为空，不能提交');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            if (!this.model.manager_id) {
              this.message.error('经办人为空，不能提交');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            if (!this.model.budget_type) {
              this.message.error('使用预算为空，不能提交');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            // 用户是产品经理或者同时是品牌经理选择的是产品预算时，判断品牌经理是否选择
            if ((this.model.project_role === 2 || this.model.project_role === 3)
                  && this.model.budget_type == 2
                  && this.getdemandinfo['brand_manager_list'].length > 0) {
              if (this.model.brand_manager == '' || this.model.brand_manager.length === 0) {
                this.message.error('请选择品牌经理');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                return false;
              }
            }
            if (!this.model.budget_price) {
              this.message.error('需求预算不能为空');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            const thing_id = [];
            if (this.model.first_category_list.length == 0) {
              this.message.error('物件数据为空，不能提交');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            let demandPrice = 0;
            let thing_error = '';
            this.model.first_category_list.forEach((item, index) => {
              if (item['category_price']) {
                demandPrice += parseFloat(item['category_price']);
              }
              item['thing_list'].forEach((thing, thingIndex) => {
                thing_id.push(thing['id']);
                if(thing['expected_expenditure'] === '0.00'){
                  let thingErrorIndex = thingIndex;
                  thingErrorIndex++;
                  thing_error += item['title'] + '第' + thingErrorIndex + '个物件预算不能为0<br />';
                }
              });
            });
            if (thing_error !== ''){
              this.message.error(thing_error);
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            if (thing_id.length == 0) {
              this.message.error('物件数据为空，不能提交');
              this.isSubmitLoading = false;
              this.message.isAllLoading = false;
              return false;
            }
            if (this.model.budget_type == 1) {
              if (demandPrice > parseFloat(this.model.brand_available)) {
                this.message.error('可用品牌预算不足');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                return false;
              }
            } else if (this.model.budget_type == 2) {
              if (demandPrice > parseFloat(this.model.product_available)) {
                this.message.error('可用产品预算不足');
                this.isSubmitLoading = false;
                this.message.isAllLoading = false;
                return false;
              }
            }
            this.http.post('web/demand/submit', {thing_id: thing_id}).subscribe(result => {
              this.message.isAllLoading = false;
              this.isSubmitLoading = false;
              this.isSaveLoading = false;
              if (result['code'] == 0) {
                this.router.navigate(['/thing/draft']);
              } else {
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
        this.message.error(response['body']['msg']);
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
    this.isSubmitLoading = true;
    this.message.isAllLoading = true;
    this.save(true);
  }

  // 获取意向CP
  getSupplierByCategory(categoryId) {
    const key = this.model.project_id + '_' + categoryId;
    // 是否已有对应意向供应商列表
    if (this.supplierObj[key]) {
      return;
    }
    this.http.get('web/supplier-shortlist/get-project-category', {
      params: {
        project_id: this.model.project_id,
        category_id: categoryId
      }
    }).subscribe(result => {
      this.isSubmitLoading = false;
      if (result['code'] == 0) {
        return this.supplierObj[key] = result['data'];
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
