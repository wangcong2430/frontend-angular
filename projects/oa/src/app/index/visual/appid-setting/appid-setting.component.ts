import { Component, OnInit, Pipe } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { MessageService } from '../../../services/message.service';
import { forkJoin } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  templateUrl: './appid-setting.component.html',
  styles: [
    `
    .block {
      display: block;
      height: 30px;
      lineHeight: 30px;
    }
    .child {
      padding-left: 25px
    }
    /deep/ .ant-checkbox-wrapper {
      display: block;
    }
    .file-download + .file-download {
      margin-left: 10px;
    }
    `
  ]
})

@Pipe({
  name: 'trustUrl'
})

export class AppidSettingComponent implements OnInit {
  constructor(
    private http: HttpClient,
    public message: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  getUrl(url: any, args?: any): any {
    // 允许通过不安全的 url
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  formDataShow = false;
  formDataTitle = '';
  formDataFoot = '';
  formData = null;
  formDataLoading = true;
  formDataType = '';

  configModalShow = false;
  configModalTitle = '';
  configModal = {};
  configModalLoading = true;
  configOrderModal = {
    is_base: false,
    is_amount: false
  };

  userList = [];
  userListpage = 1;
  userListPageSize = 20;
  searchValue = '';

  formConfig = [];

  fileList = [];

  // loading
  loading = false;
  listLoading = false;
  categorys = [];
  category_select = '';

  // 配置项
  columns = [];
  disabledButton = true;

  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  queryFields = [];

  // 数据列表
  list = [];

  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };

  formDataForm = new FormGroup({})
  formDataModel: any = {}
  formDataOptions: FormlyFormOptions = {};
  formDataFields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'row mx-0',
      fieldGroup: [
        {
          key: 'app_id',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: 'app_id',
            nzLayout: 'fixedwidth',
            nzRequired: true,
            disabled: true
          },
          hideExpression: (model) => {
            return this.formDataType === 'add';
          }
        },
        {
          key: 'name',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '名称',
            nzValue: 'value',
            nzLayout: 'fixedwidth',
          }
        },
        {
          key: 'project_power',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '产品名称',
            nzValue: 'value',
            nzMode: 'multiple',
            nzShowSearch: true,
            nzLayout: 'fixedwidth',
            nzRequired: false,
            nzAllowClear: true,
            options: []
          }
        },
        {
          key: 'auth_item_name',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '部门',
            nzLayout: 'fixedwidth',
            nzRequired: false,
            nzAllowClear: true,
            options: []
          },
          lifecycle: {
            onInit: (from, field: FormlyFieldConfig) => {
              const data = this.formConfig.find(item => item.key === field.key);
              if(data) {
                field.templateOptions.options = data.templateOptions.options
              }
            }
          },
        },
        {
          key: 'user_name',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '接口人',
            nzValue: 'value',
            nzShowSearch: true,
            nzLayout: 'fixedwidth',
            nzRequired: true,
            blur: (field, event) => {
              if(event.target.value.trim() === '') return;
              this.http.get('/web/user/info-by-username', {
                params: {
                  username: field.model.user_name
                }
              }).subscribe(res => {
                if(res['code'] !== 0) {
                  this.message.error(res['msg']);
                  event.target.value = '';
                  field.model.user_name = '';
                }
              })
            }
          }
        },
        {
          key: 'creator',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '创建人',
            nzValue: 'value',
            nzLayout: 'fixedwidth',
            disabled: true
          },
          hideExpression: (model) => {
            return this.formDataType === 'add';
          }
        },
        {
          key: 'create_time',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '创建时间',
            nzValue: 'value',
            nzLayout: 'fixedwidth',
            disabled: true
          },
          hideExpression: (model) => {
            return this.formDataType === 'add';
          }
        },
        {
          key: 'remark',
          type: 'nz-textarea',
          className: 'ant-col-24',
          templateOptions: {
            label: '说明',
            nzLayout: 'fixedwidth',
            nzRequired: false
          },
        },
        {
          key: 'ip',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: 'ip',
            nzLayout: 'fixedwidth',
            nzRequired: false,
            description: '多个ip请以逗号,隔开'
          },
        },
        {
          key: 'delivery_sources',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '交付来源',
            nzLayout: 'fixedwidth',
            nzRequired: false,
            nzAllowClear: true,
            options: []
          },
          lifecycle: {
            onInit: (from, field: FormlyFieldConfig) => {
              const data = this.formConfig.find(item => item.key === field.key);
              if(data) {
                field.templateOptions.options = data.templateOptions.options
              }
            }
          }
        },
        {
          key: 'is_all',
          type: 'nz-radio',
          className: 'ant-col-24',
          defaultValue: '0',
          templateOptions: {
            label: '品类',
            nzLayout: 'fixedwidth',
            nzRequired: true,
            options: [
              {
                label: '全量',
                value: '0',
              },
              {
                label: '指定',
                value: '1'
              }
            ]
          }
        },
        {
          key: 'category_power',
          type: 'nz-tree-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '所属品类',
            nzValue: 'value',
            nzMultiple: true,
            nzLayout: 'fixedwidth',
            nzRequired: true,
            nzAllowClear: true,
            nzShowSearch: true,
            nzShowLine: true,
            nzPlaceHolder: "...输入关键字搜索",
            nzDisplayWith: (node) => node.title
          },
          lifecycle: {
            onInit: (from, field: FormlyFieldConfig) => {
              const data = this.formConfig.find(item => item.key === field.key);
              if(data) {
                const list = data.templateOptions.options;
                const getList = (arr) => {
                  arr.map(item => {
                    item.key = item.id;
                    if(item.children && item.children.length > 0) {
                      item.children = getList(item.children);
                    }
                    return item;
                  })
                  return arr;
                }
                field.templateOptions.nzNodes = getList(list);
              }
            },
            onChanges: (val) => {
              console.log(val)
            }
          },
          hideExpression: (model) => {
            return model.is_all === '0';
          }
        }
      ]
    }
  ]

  ngOnInit() {
    // 获取列表配置api
    this.getConfig();

    // 获取数据列表
    this.getList();
  }

  // 获取列表配置api
  getConfig() {
    this.loading = true;
    this.http.get('/web/visual/get-api-sources-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.queryFields      = result['search_form'];
      this.formConfig       = result['form'];
      this.categorys        = result['form'][4].templateOptions.options;
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('/web/visual/get-api-sources-list', { params: params }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.listLoading            = false;
        this.list                   = [];
        this.pagination.total_count = '0';
        return false;
      }
      this.listLoading            = false;
      this.list                   = result['data']['list'];
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
    });
  }

  // 搜索
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 打开弹窗
  openModal(type) {
    if(type === 'add') {
      this.addAppidSetting();
    }
  }

  // 新增
  addAppidSetting() {
    this.fileList = [];
    this.formDataTitle = '新增';
    this.formDataType  = 'add';
    this.formDataFoot = '';
    this.formDataShow = true;
    this.formDataLoading = true;
    this.http.get('/web/visual/get-project-list').subscribe(res => {
      if(res['code'] === 0) {
        this.formDataFields[0].fieldGroup.find(item => item.key === 'project_power').templateOptions.options = res['data'].map(item => ({ label: item.name, value: item.id }));
      }
      this.formDataLoading = false;
    })
  }

   // 列表点击事件
  clickEvent(e) {
    if(e.key === 'update') {
      this.updateAppidSetting(e.item);
    }
    if(e.key === 'api_setting') {
      this.apiSetting(e.item);
    }
    if(e.key === 'app_id') {
      this.detailShow(e.item);
    }
  }

  getDetail(app_id, fn) {
    this.http.get('/web/visual/get-api-sources-detail', { params: { app_id } })
    .subscribe(result => {
      fn(result);
    })
  }

  // 详情显示
  detailShow(item) {
    const params = {
      app_id: item['app_id']
    }
    this.formDataTitle = '详情';
    this.formDataFoot = null;
    this.formDataType = 'detail';
    this.formDataLoading = true;
    this.formDataShow = true;
    this.getDetail(item['app_id'], result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.formDataLoading = false;
        this.handleCancel();
        return false;
      }

      this.formDataModel.app_id = item.app_id;
      this.formDataModel.name = result['data'].name;
      this.formDataModel.user_name = result['data'].user_name;
      this.formDataModel.auth_item_name = result['data'].line_power;
      this.formDataModel.creator = result['data'].creator;
      this.formDataModel.create_time = result['data'].create_time;
      this.formDataModel.remark = result['data'].remark;
      this.formDataModel.ip = result['data'].ip;
      this.formDataModel.is_all = result['data'].category_power_ids ? '1' : '0';
      this.formDataModel.category_power = result['data'].category_power;
      this.formDataModel.project_power = result['data'].project_power;
      this.formDataModel.delivery_sources = result['data'].delivery_sources;

      const fileNames = result['data'].attachment_file_name;
      const fileUrls = result['data'].attachment_url;
      const fileIds = result['data'].attachment_url_ids;
      this.fileList = fileIds.map((id, index) => {
        return {
          name: fileNames[index],
          response: {
            code: 0,
            data: id
          },
          url: fileUrls[index]
        }
      })

      this.formDataLoading = false;
    })
  }

  // 编辑
  updateAppidSetting(item) {
    this.formDataTitle = '编辑';
    this.formDataType = 'update';
    this.formDataFoot = '';
    this.formDataLoading = true;
    this.formDataShow = true;
    forkJoin([
      this.http.get('/web/visual/get-api-sources-detail', { params: { app_id: item['app_id'] } }),
      this.http.get('/web/visual/get-project-list')
    ]).subscribe(res => {
      const result = res[0];
      const result1 = res[1];
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.formDataShow   = false;
        return false;
      }
      if(result1['code'].toString() === '0') {
        this.formDataFields[0].fieldGroup.find(item => item.key === 'project_power').templateOptions.options = result1['data'].map(item => ({ label: item.name, value: item.id }));
      }
      this.formDataModel.app_id = item.app_id;
      this.formDataModel.name = result['data'].name;
      this.formDataModel.user_name = result['data'].user_name;
      this.formDataModel.auth_item_name = result['data'].line_power;
      this.formDataModel.creator = result['data'].creator;
      this.formDataModel.create_time = result['data'].create_time;
      this.formDataModel.remark = result['data'].remark;
      this.formDataModel.ip = result['data'].ip;
      this.formDataModel.is_all = result['data'].category_power_ids ? '1' : '0';
      this.formDataModel.category_power = result['data'].category_power_ids || [];
      this.formDataModel.project_power = result['data'].project_power_ids || [];
      this.formDataModel.delivery_sources = result['data'].delivery_sources;

      const fileNames = result['data'].attachment_file_name;
      const fileUrls = result['data'].attachment_url;
      const fileIds = result['data'].attachment_url_ids;
      this.fileList = fileIds.map((id, index) => {
        return {
          uid: id,
          name: fileNames[index],
          response: {
            code: 0,
            data: id
          },
          url: this.getUrl(fileUrls[index])
        }
      })
      this.formDataLoading = false;
    })
  }

  // 弹窗取消
  handleCancel() {
    this.formDataShow = false;
    this.formDataLoading = true;
    if(this.formDataType === 'detail') {
      this.formDataModel = {};
      return;
    };
    this.formDataOptions.resetModel();
    this.formDataModel = {};
  }

  getCategoryPowerId(id, list?:Array<object>) {
    if(!list) {
      list = this.formConfig.find(item => item.key === 'category_power').templateOptions.options;
    }
    let arr = [];
    for(let i = 0; i < list.length; i++) {
      if(list[i]['id'] == id) {
        if(list[i]['children'] && list[i]['children'].length > 0) {
          arr = arr.concat(this.getChildrenId(list[i]['children']));
        }
      } else if(list[i]['children'] && list[i]['children'].length > 0) {
        arr = arr.concat(this.getCategoryPowerId(id, list[i]['children']));
      }
    }
    return arr;
  }

  getChildrenId(list) {
    let arr = [];
    for(let i = 0; i < list.length; i++) {
      arr.push(list[i].id);
      if(list[i]['children'] && list[i]['children'].length > 0) {
        arr = arr.concat(this.getChildrenId(list[i]['children']))
      }
    }
    return arr;
  }

  // 弹窗提交
  handleOk() {
    let category_power_arr = [];
    this.formDataModel['category_power'].forEach(item => {
      const ids = this.getCategoryPowerId(item);
      category_power_arr = [...category_power_arr, ...ids];
    })
    category_power_arr = this.formDataModel['category_power'].concat(category_power_arr);
    const params = {
      auth_item_name: this.formDataModel.auth_item_name || '',
      user_name: this.formDataModel.user_name || '',
      remark: this.formDataModel.remark || '',
      ip: this.formDataModel.ip || '',
      name: this.formDataModel.name || '',
      delivery_sources: this.formDataModel.delivery_sources || '',
      category_power: this.formDataModel['is_all'] === '0' ? '0' : category_power_arr,
      project_power: this.formDataModel['project_power'] ? this.formDataModel['project_power'].join(',') : '',
      attachment_url: this.fileList.filter(item => item.response.code === 0).map(item => item.response.data).join(',')
    }
    if(this.formDataModel['app_id']) {
      params['app_id'] = this.formDataModel['app_id'];
    }
    // if(params['auth_item_name'] === '') {
    //   this.message.error('请填写部门');
    //   return;
    // }
    if(params['user_name'] === '') {
      this.message.error('请填写接口人');
      return;
    }
    this.formDataLoading = true;
    let url = this.formDataType === 'update' ? '/web/visual/edit-api-sources' : '/web/visual/add-api-sources';
    this.http.post(url, params).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.handleCancel();
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.handleCancel();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  // 接口配置
  apiSetting(item) {
    this.configModalTitle = '接口配置';
    this.configModalShow = true;
    this.configModalLoading = true;
    forkJoin([
      this.http.get('/web/visual/get-api-sources-setting-list'),
      this.http.get('/web/visual/get-api-sources-detail', { params: { app_id: item['app_id'] } })
    ]).subscribe(res => {
      const result = res[0];
      const result1 = res[1];
      if (result['code'] !== 0 && result1['code'].toString() !== '0' ) {
        this.message.error(result['msg']);
        this.configModalShow   = false;
        return false;
      }
      const data = result1['data'].setting_json ? JSON.parse(result1['data'].setting_json) : {}
      const {
        is_base = 0,
        is_amount = 0
      } = data;

      this.configOrderModal = {
        is_base: is_base === 1 ? true : false,
        is_amount: is_amount === 1 ? true : false
      }
      this.configModal = {
        data: result['data'].list.map(item => {
          return {
            label: item.title,
            checked: result1['data'].setting_ids.split(',').some(itemC => itemC == item.id),
            ...item
          }
        }),
        app_id: item['app_id']
      }
      this.configModalLoading        = false;
    })
  }

  apiCheckboxChange(type, data) {
    if(type === 'apiSetting' && data.label === '订单列表接口') {
      Object.keys(this.configOrderModal).forEach(key => {
        this.configOrderModal[key] = data.checked;
      })
    }
    if(type === 'orderSetting') {
      this.configModal['data'][0].checked = Object.values(data).some(item => item === true);
    }
  }

  // 配置弹窗取消
  configModalCancel() {
    this.configModalShow = false;
    this.configModalLoading = true;
  }

  // 配置弹窗提交
  configModalSubmit() {
    const setting_id = this.configModal['data'].filter(item => item.checked).map(item => item.id).join(',');
    const orderSetting = {};
    Object.keys(this.configOrderModal).forEach(key => {
      orderSetting[key] = this.configOrderModal[key] ? 1 : 0;
    })
    this.apiSettingSubmit({ app_id: this.configModal['app_id'], setting_id: setting_id, ...orderSetting });
  }

  apiSettingSubmit(data) {
    this.configModalLoading = true;
    this.http.post('/web/visual/set-app-id-api', data).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        this.configModalCancel();
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.configModalCancel();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  changeDisabledButton(e) {}
}
