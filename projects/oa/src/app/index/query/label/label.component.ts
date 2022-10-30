import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './label.component.html',
})

export class LabelComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService
  ) {}
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
  can = false;
  // 数据列表
  list = [];

  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  searchLoading = false;

  // 导出订单
  productName = null;

  isVisible: Boolean = false;
  model: any = {};
  form = new FormGroup({});
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'ant-row',
      fieldGroup: [
        {
          key: 'department',
          type: 'nz-tree-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '工作室',
            nzRequired: false,
            nzLayout: 'fixedwidth',
            nzPlaceHolder: '请输入关键字搜索',
            nzDisplayWith: (node) => node.title
          }
        },
        {
          key: 'product_name',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '产品名称',
            nzLayout: 'fixedwidth',
            nzRequired: false,
            nzValue: 'value',
            nzMode: 'multiple'
          }
        },
        {
          key: 'pr_name',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '立项名称',
            nzRequired: false,
            nzLayout: 'fixedwidth',
            nzValue: 'value',
            nzMode: 'multiple'
          }
        },
        {
          key: 'name',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '供应商名称',
            nzRequired: false,
            nzLayout: 'fixedwidth',
            nzValue: 'value',
            nzMode: 'multiple'
          }
        },
        {
          key: 'category_type',
          type: 'nz-select',
          className: 'ant-col-24',
          defaultValue: '0',
          templateOptions: {
            label: '费用类型',
            nzRequired: true,
            nzLayout: 'fixedwidth',
            nzValue: 'value',
            options: [
              {
                label: '全部',
                value: '0'
              },
              {
                label: '内容制作费',
                value: '1'
              },
              {
                label: '营销推广费',
                value: '2'
              },
            ]
          }
        },
        {
          key: 'thing_type',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '筛选类型',
            nzRequired: true,
            nzLayout: 'fixedwidth',
            nzValue: 'value',
            options: [
              {
                label: '订单审批时间',
                value: '1'
              }
            ]
          }
        },
        {
          key: 'range_date',
          type: 'nz-date-range-picker',
          className: 'ant-col-24',
          hideExpression: '!model.thing_type',
          templateOptions: {
            label: '导出时段',
            nzRequired: true,
            nzLayout: 'fixedwidth',
            nzValue: 'value',
          }
        },
        {
          key: 'columns',
          type: 'field-name-checkbox',
          className: 'ant-col-24',
          wrappers: ['field-wrapper'],
          templateOptions: {
            nzRequired: true,
            nzLayout: 'fixedwidth',
            label: '字段'
          }
        }
      ]
    }
  ];

  ngOnInit() {
    // 获取列表配置
    this.getConfig();
  }


  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/thing/label-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.queryFields      = result['search_form'];
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.searchLoading = true;
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
    this.http.post('web/thing/label-list',  params ).subscribe(result => {
      this.searchLoading = false;
      this.listLoading            = false;
      this.list                   = result['list'];
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.searchLoading = false;
      this.listLoading            = false;
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
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

  // 导出订单
  exportOrder () {
    this.modalService.open('order-export', {});
  }

  // 关闭导出订单
  handleCancel () {
    this.isVisible = false;
    this.model = null;
  }

  handleOk () {

    if (!(this.model.range_date && this.model.columns)) {
      this.message.error('请填写必填字段');
      return;
    }

    if (this.model.department) {
      const options = this.fields[0].fieldGroup.find(item => item.key === 'department').templateOptions.nzNodes;
      const department = this.model.department;
      const depart =  department.map(item => {
        if (options.some(s => s.key === item)) {
         return options.find(s => s.key === item).children.map(res => res.key).toString();
        } else {
          return item.toString();
        }
      }).toString();
      this.model.depart = depart;
    }

    this.model.sleep = 10;

    this.http.post('/web/thing/export', this.model, {responseType: 'blob'}).subscribe(result => {
      this.download(result);
    });
  }

  download (blob) {
    const eleLink = document.createElement('a');
    eleLink.download = '导出文件.csv';
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址

    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  }
}
