import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import {UploadXHRArgs} from 'ng-zorro-antd';
import { CosService} from '../../../services/cos.service';
import {DownloadService} from "../../../services/download.service";

@Component({
  templateUrl: './thing.component.html',
})

export class ThingComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    private cos: CosService,
   private _downloadService: DownloadService,
  ) {}
  // loading
  loading = false;
  listLoading = false;
  FileUploading = '';
  fileSuccess = '';
  fileFails = '';
  objtype = 2200;
  uploadEvent = '';
  epo_file_name = '';
  epo_file_id;
  // 配置项
  columns = [];
  childrenColumns = [];
  disabledButton = true;
  fileName = '数据统计.csv';
  // 筛选
  searchFormData = {
    ...getUrlParams()
  };
  queryFields = [];
  can = false;
  admin = false;
  admin1 = false;
  is_not_only_needrole = false;
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
    this.getList();
  }


  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/thing/thing-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.queryFields      = result['search_form'];
      this.admin            = result['admin'];
      this.admin1            = result['admin1'];
      this.is_not_only_needrole    = result['is_not_only_needrole'];
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
    this.http.get('web/thing/thing-list', { params: params }).subscribe(result => {
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

  //到处物件耗时
  exportOrderNew(){
    this.modalService.open('export', {
      url: 'web/thing/special-export',
      params: {
        type: '1000'
      }
    })
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

  beforeUploadImg = (file: File) => {
    const isJPG = (file.type === 'application/vnd.ms-excel');
    if (!isJPG) {
      this.message.error(file.name + '格式不对，格式要求：只能导入csv文件');
    }
    const isLt2M = file.size  < 104857600;
    if (!isLt2M) {
      this.message.error(file.name + '超出大小限制，文件大小：100M以内');
    }
    return isJPG && isLt2M;
  }

  beforeUploadFile = (file: File) => {

    const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');

    const  isLt2M = file.size  < 1024 * 1024 * 24;
    if (isJPG && !isLt2M) {
      this.message.error('JPG/PNG 等预览图片大小不超过32MB、宽高不超过30000像素且总像素不超过2.5亿像素!');
      return false;
    }

    const fileTypes = ['csv'];
    const fileNames = file.name.split('.');
    const isFILE = fileTypes.some(type => fileNames[fileNames.length - 1] == type);
    if (!isFILE) {
      this.message.error(file.name + `格式不对，格式要求：只能导入csv文件`);
    }
    return isFILE ;
  }

  uploadChange() {
    // if ( event.type === 'success') {
      // this.epo_file_id = this.uploadEvent.file.originFileObj.file_id;
      // this.epo_file_name = this.uploadEvent.file.originFileObj.name;

    // }
  }

  customReqs = (item: UploadXHRArgs) => {
    this.listLoading = true;
    const uploading = this.message.loading('数据上传中...', { nzDuration: 0 }).messageId;
    return this.cos.uploadFile(item).subscribe(
      (event) => {
        this.message.remove(uploading);
        const loading = this.message.loading('数据处理中...', { nzDuration: 0 }).messageId;
        let file_id = event['file_id'];
        this.http.get('web/thing/upload-excel?id=' + file_id)
          .subscribe(results => {
            this.listLoading = false;
            this.message.remove(loading);

            if (results['code'] == 0) {
              if (results['data'].length > 0) {
                this.fileName = decodeURI(results['download_load_name']);
                // this.message.success('下载成功');
                this._downloadService.loaded({
                  data: {
                    msg: '下载成功',
                    name: this.fileName,
                    link: results['data']
                  }
                });
              } else {
                this.message.success(results['msg']);
              }
            } else {
              this.message.error(results['msg']);
            }
        }, err => {
            this.listLoading = false;
            this.message.remove(loading);
            this.message.error(err['msg']);
        });
      }, err => {
        this.message.remove(uploading);
        this.listLoading = false;
        this.message.remove(uploading);
      }
    );
  }

  delayremind () {
    console.log('推迟提醒')
    this.modalService.open('delay-remind', {
      current_workflow: '2111',
      thing_id: [111]
    })
  }
}
