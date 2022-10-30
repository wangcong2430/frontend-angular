import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css']
})

export class AttributeComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService
  ) {}
  // Model 参数配置
  isAttributeVisible: Boolean = false;
  isAttributeLoading: Boolean = false;

  loading: Boolean = false;
  list = [];
  columns = [];
  queryFields = [];
  listMessage;
  listLoading: Boolean = false;
  pagination = {
    total_count: '0',
    page_size: '20',
    page_index: '1',
  };
  isOkLoading: Boolean = false;
  searchFormData;

  AttributeForm = new FormGroup({});
  attributeModel: any = {};
  attributeOptions: FormlyFormOptions = {
    formState: {
      labelCategoryList: []
    }
  };
  attributeFields: FormlyFieldConfig[]  = [
    {
      fieldGroupClassName: 'row mx-0',
      fieldGroup: [
        {
          key: 'label_category_id',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '标签分类',
            nzLayout: 'fixedwidth',
            nzRequired: true,
            nzMode: 'multiple'
          },
          expressionProperties: {
            'templateOptions.options': 'formState.labelCategoryList'
          },
          lifecycle: {
            onInit: (from, field, model, options) => {
              field.formControl.valueChanges.subscribe(ids => {
                let list = options.formState.labelCategoryList.filter(item => ids.some(id => id == item.value)).map(item => {
                  return {
                    label: item.label,
                    value: item.value,
                    checked: false
                  }
                })

                model.is_required = list
                from.root.get('is_required').patchValue(model.is_required)
              })
            }
          }
        },
        {
          key: 'title',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '标签名称',
            nzLayout: 'fixedwidth',
            nzRequired: true,
          }
        },
        {
          key: 'title_en',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '标签名称英文',
            nzLayout: 'fixedwidth',
          }
        },
        {
          key: 'form_remark',
          type: 'nz-textarea',
          className: 'ant-col-24',
          templateOptions: {
            label: '标签描述',
            nzLayout: 'fixedwidth',
          }
        },
        {
          key: 'form_remark_en',
          type: 'nz-textarea',
          className: 'ant-col-24',
          templateOptions: {
            label: '标签描述英文',
            nzLayout: 'fixedwidth',
          }
        },
        {
          key: 'category_id',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '服务品类',
            nzValue: 'value',
            nzMode: 'multiple',
            nzShowSearch: true,
            nzLayout: 'fixedwidth',
            nzRequired: true,
            options: [],
            nzPlaceholder: '请选择经办人'
          },
          expressionProperties: {
            'templateOptions.options': 'formState.categoryList'
          },
        },
        {
          key: 'is_required',
          type: 'nz-checkbox',
          className: 'ant-col-24',
          defaultValue: '1',
          templateOptions: {
            label: '是否必填',
            nzLayout: 'fixedwidth',
            type: 'checkbox-group',
          },
          expressionProperties: {
            hide: '!model.label_category_id'
          }
        },
        {
          key: 'status',
          type: 'nz-radio',
          className: 'ant-col-24',
          defaultValue: '0',
          templateOptions: {
            label: '禁用',
            nzLayout: 'fixedwidth',
            nzRequired: true,
            options: [
              {
                label: '是',
                value: '1',
              },
              {
                label: '否',
                value: '0'
              }
            ]
          },


        },
        {
          key: 'attr_type',
          type: 'nz-radio',
          className: 'ant-col-24',
          defaultValue: '2',
          templateOptions: {
            label: '表单类型',
            nzLayout: 'fixedwidth',
            options: [
              {
                value: '1',
                label: '文本输入',
              },
              {
                value: '2',
                label: '下拉选择'
              },
            ]
          },
        },
        {
          key: 'form_name',
          type: 'nz-input-array',
          className: 'ant-col-24',
          templateOptions: {
            label: '文本框',
            nzPlaceHolder: '文本框提示文字显示',
            nzEnPlaceHolder: '文本框英文提示文字显示',
            nzLayout: 'fixedwidth',
            nzRequired: true,
          },
          hideExpression: (model) => {
            return model.attr_type === '2';
          }
        },
        // {
        //   key: 'form_name_en',
        //   type: 'nz-input-array',
        //   className: 'ant-col-24',
        //   templateOptions: {
        //     label: '文本框(en)',
        //     nzPlaceHolder: '将作为文本框提示文字显示',
        //     nzLayout: 'fixedwidth',
        //   },
        //   hideExpression: (model) => {
        //     return model.attr_type === '2';
        //   }
        // },
        {
          key: 'multiple',
          type: 'nz-radio',
          className: 'ant-col-24',
          defaultValue: '0',
          templateOptions: {
            label: '下拉多选',
            nzLayout: 'fixedwidth',
            nzRequired: true,
            options: [
              {
                label: '是',
                value: '1',
              },
              {
                label: '否',
                value: '0'
              }
            ]
          },
          hideExpression: (model) => {
            return model.attr_type === '1';
          }
        },
        {
          key: 'form_value',
          type: 'nz-input-array',
          className: 'ant-col-24',
          templateOptions: {
            label: '下拉选项',
            nzPlaceHolder: '请填写该标签的下拉选项',
            nzEnPlaceHolder: '请填写该标签的英文下拉选项',
            nzLayout: 'fixedwidth',
            nzRequired: true,
          },
          hideExpression: (model) => {
            return model.attr_type === '1';
          }
        },
        // {
        //   key: 'form_value_en',
        //   type: 'nz-input-array',
        //   className: 'ant-col-24',
        //   templateOptions: {
        //     label: '下拉选项英文',
        //     nzPlaceHolder: '请填写该标签的下拉选项',
        //     nzLayout: 'fixedwidth',
        //   },
        //   hideExpression: (model) => {
        //     return model.attr_type === '1';
        //   }
        // },
        {
          key: 'form_unit',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '单位',
            nzLayout: 'fixedwidth',
            nzRequired: true,

          },
          hideExpression: (model) => {
            return model.attr_type === '2';
          }
        },
        {
          key: 'form_unit_en',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '英文单位',
            nzLayout: 'fixedwidth',
          },
          hideExpression: (model) => {
            return model.attr_type === '2';
          }
        },
        {
          key: 'form_separator',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '表单链接符',
            nzLayout: 'fixedwidth',
            nzRequired: true,
          },
          hideExpression: (model) => {
            return  model.form_name && model.form_name.len && model.form_name.len < 2 || model.attr_type === '2';
          }
        },
        // {
        //   key: 'form_remark',
        //   type: 'nz-textarea',
        //   className: 'ant-col-24',
        //   templateOptions: {
        //     label: '属性说明',
        //     nzLayout: 'fixedwidth',
        //   },

        // },
        {
          key: 'scope',
          type: 'nz-number',
          className: 'ant-col-24',
          templateOptions: {
            label: '表单限制',
            nzLayout: 'fixedwidth',
          },
          hideExpression: (model) => {
            return model.form_name && model.form_name.len !== 2 || model.attr_type !== '1';
          }
        },
        {
          key: 'scope_desc',
          type: 'nz-textarea',
          className: 'ant-col-24',
          templateOptions: {
            label: '超出限制提示',
            nzLayout: 'fixedwidth',
            nzPlaceHolder: '（最高值-最低值）/最低值不高于某个值，同时如果最小值是0，则最大值不得超过100'
          },
          hideExpression: (model) => {
            return  model.form_name && model.form_name.len !== 2 || model.attr_type !== '1';
          }
        },
        {
          key: 'scope_desc_en',
          type: 'nz-textarea',
          className: 'ant-col-24',
          templateOptions: {
            label: '超出限制英文提示',
            nzLayout: 'fixedwidth',
            nzPlaceHolder: '（最高值-最低值）/最低值不高于某个值，同时如果最小值是0，则最大值不得超过100'
          },
          hideExpression: (model) => {
            return  model.form_name && model.form_name.len !== 2 || model.attr_type !== '1';
          }
        },
      ]
    }
  ];

  // option
  category = [];

  ngOnInit() {
    this.getConfig();
    this.getList();
  }

  // 获取列表
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
    this.http.get('web/category-attribute/list', { params: params }).subscribe(result => {
      this.loading            = false;
      this.listLoading        = false;
      this.list                   = result['list'];
      if (result['pager']) {
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index  = result['pager']['page'];
        this.pagination.page_size   = result['pager']['pageSize'];
      }
    });
  }

  // 获取全局配置
  getConfig() {
    this.loading = true;
    this.http.get('web/category-attribute/config').subscribe(result => {
      if (result['code'] === 0) {
        this.loading = false;
        this.columns          = result['columns'];
        this.queryFields      = result['search_form'];
      }
    });
  }

  // 编辑属性弹窗
  editAttribute(data: object = null) {
    this.isAttributeLoading = true;
    this.http.get('/web/category-attribute/edit', { params: {
      id: data && data['id'] ? data['id'] : 0
    }}).subscribe(res => {
      if (res['code'] === 0) {
        this.attributeModel = res['data'];
        this.category = res['category'];
        this.attributeOptions.formState.labelCategoryList = res['labelCategoryList'];
        this.attributeOptions.formState.categoryList = res['category'];
        this.isAttributeLoading = false;
      }
    }, err => {
      this.message.error(err.msg);
    });
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'update') {
      this.isAttributeVisible = true;
      this.editAttribute({id: event.item.id});
    }
  }

  // 打开属性弹窗
  openAttributeModel () {
    this.isOkLoading = false;
    this.isAttributeVisible = true;
    this.editAttribute();
  }

  openAttributeClassifyModel () {
    this.modalService.open('label-classify-management');
  }

  // 关闭属性弹窗
  closeAttributeModel () {
    this.isAttributeVisible = false;
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 属性弹窗保存
  AttributeSave () {

    let error = false;
    if (!this.attributeModel['label_category_id']) {
      this.message.error('请选择标签分类');
      return false;
    }

    if (!this.attributeModel['title']) {
      this.message.error('请输入标签名称');
      return false;
    }

    if (this.attributeModel['category_id'].length === 0) {
      this.message.error('请选择服务品类');
      return false;
    }

    if (!this.attributeModel['is_required']) {
      this.message.error('请选择是否必填');
      return false;
    }

    if (!this.attributeModel['is_required']) {
      this.message.error('请选择是否必填');
      return false;
    }

    if (!this.attributeModel['status']) {
      this.message.error('请选择标签状态');
      return false;
    }


    if (this.attributeModel['attr_type'] === '1') {
      if (!this.attributeModel['form_unit']) {
        this.message.error('单位不能为空');
        error = true;
        return false;
      }

      if (this.attributeModel['form_name']) {
        if (!this.attributeModel['form_name']['zh'] || this.attributeModel['form_name']['zh'].length === 0) {
          this.message.error('文本框内容不能为空');
          error = true;
          return false;
        }

        if (this.attributeModel['form_name']['zh']) {
         if (this.attributeModel['form_name']['zh'].split('|').some(item => item === '')){
            this.message.error('文本框内容不能为空');
            error = true;
            return false;
          }
        }

        if (this.attributeModel['form_name']['len'] > 1) {
          if (!this.attributeModel['form_separator']) {
            this.message.error('连接符不能为空');
            error = true;
            return false;
          }
        }
      }
    }

    if (this.attributeModel['attr_type'] === '2') {
      if (this.attributeModel['form_value']) {
        if (!this.attributeModel['form_value']['zh'] || this.attributeModel['form_value']['zh'].length === 0) {
          this.message.error('下拉选项不能为空');
          error = true;
          return false;
        }

        if (this.attributeModel['form_value']['zh']) {
         if (this.attributeModel['form_value']['zh'].split('|').some(item => item === '')){
            this.message.error('下拉选项不能为空');
            error = true;
            return false;
          }
        }
      }
    }

    if (error) {
      return false;
    }


    this.isOkLoading = true;
    this.http.post('/web/category-attribute/save-attr', this.attributeModel).subscribe(res => {
      this.isOkLoading = false;
      if (res['code'] === 0) {
        this.message.success('保存成功');
        this.isAttributeVisible = false;
        this.getList();
      } else {
        this.message.error(res['msg']);
      }
    }, () => {
      this.isOkLoading = false;
      this.message.error(error['msg']);

    });
  }
}
