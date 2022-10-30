import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { formatDate } from '@angular/common';
import { map } from 'rxjs/operators';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { DownloadService } from '../../../services/download.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-modal-order-export',
  templateUrl: './order-export.component.html',
  styles: [
    `
    ::ng-deep .ant-select{
        width: 100%;
      }
    `
  ]
})

export class OrderExportComponent implements OnInit {

  @ViewChild('downloadTip') template: TemplateRef<{}>;

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
            label: '部门',
            nzRequired: false,
            nzLayout: 'fixedwidth',
            nzPlaceHolder: '请输入关键字搜索',
            nzDisplayWith: (node) => node.title
          }
        },
        {
          key: 'project_id',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '项目名称',
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
            label: '立项名称/单号',
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
            nzMode: 'multiple',

            callback: (name: string) => this.http.get('web/supplier/like-supplier', {
                                          params: {name: name}
                                        }).pipe(map(res => res['data'])),
            nzServerSearch: true,
            nzShowSearch: true,
            options: [],
          }
        },
        {
          key: 'first_category_id',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '服务品类',
            nzLayout: 'fixedwidth',
            nzMode: 'multiple',
            nzValue: 'option'
          }
        },
        {
          key: 'stay_time',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '停留时间>=(天)',
            nzLayout: 'fixedwidth',
            nzType: 'number',
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
                label: '物件单号',
                value: '12'
              },
              {
                label: '订单生成时间',
                value: '4'
              },
              {
                label: '订单审批时间',
                value: '1'
              },
              {
                label: '需求审核时间',
                value: '2'
              },
              {
                // label: '验收审核时间',
                label: '验收终审时间',
                value: '3'
              },
              {
                label: '预算使用时间',
                value: '10'
              },
              {
                label: '申请验收时间',
                value: '11'
              },
            ]
          }
        },
        {
          key: 'range_date',
          type: 'nz-date-range-picker',
          className: 'ant-col-24',
          hideExpression: '!model.thing_type || model.thing_type == "12"',
          templateOptions: {
            label: '导出时段',
            nzRequired: true,
            nzLayout: 'fixedwidth',
            nzValue: 'value',
          }
        },
        {
          key: 'thing_code_textarea',
          type: 'nz-textarea',
          className: 'ant-col-24',
          hideExpression: '!(model.thing_type && model.thing_type == "12")',
          templateOptions: {
            label: '物件单号',
            nzRequired: true,
            nzLayout: 'fixedwidth',
            nzValue: 'value',
            nzAutosize: {minRows: 3, maxRows: 1000},
            nzPlaceHolder:'请输入物件单号（输入多个物件单号请用回车键隔开）'
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
            label: '导出字段'
          }
        }
      ]
    }
  ];

  downloadFile = {
    url: null,
    status: 'loading',
    msg: '',
    name: '导出文件.cvs'
  };

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modal: ModalService,
    private _downloadService: DownloadService,
    private modalService: NzModalService,
  ) {}

  ngOnInit() {
    this.modal.modal$.subscribe(item => {
      if (item && item['key'] === 'order-export') {

        this.modalService.create({
          nzTitle: '用户保密协议和隐私政策',
          nzContent: 'WBP平台的所有内容仅供内部有权限人员使用，您的导出操作及内容将被系统记录，对于未经授权私自泄露行为，公司将有权追究法律责任!',
          nzOkText: '同意并继续',
          nzOnOk: () => new Promise(resolve => {

            this.http.get('web/thing/export-list-config').subscribe(results => {
              if (results['code'] === 0) {
                resolve();
                this.fields[0].fieldGroup.find(field => field.key === 'project_id').templateOptions.options = results['data']['project_list'];
                this.fields[0].fieldGroup.find(field => field.key === 'name').templateOptions.options = results['data']['supplier'];
                this.fields[0].fieldGroup.find(field => field.key === 'pr_name').templateOptions.options = results['data']['pr_name'];
                this.fields[0].fieldGroup.find(field => field.key === 'department').templateOptions.nzNodes = results['data']['department'];
                this.fields[0].fieldGroup.find(field => field.key === 'columns').templateOptions.options = results['data']['columns'];
                this.fields[0].fieldGroup.find(field => field.key === 'first_category_id').templateOptions.options
                  = results['data']['category'];
                this.isVisible = true;
              } else {
                this.message.error(results['msg']);
              }
            }, err => {
              this.message.error('网络异常，请稍后再试');
            });
          })
        })
      }
    });
  }

  // 关闭导出订单
  handleCancel () {
    this.isVisible = false;
  }

  okLoading = false;

  handleOk () {
    if (!this.model.range_date && !this.model.thing_code_textarea) {
      this.message.error('请填写导出范围');
      return;
    }

    if (!this.model.columns) {
      this.message.error('请选择导出字段');
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


    this.model.download = true;
    const now = formatDate (new Date (), 'yyyyMMddhhmmss', 'zh-ch');
    if(this.model.range_date){  
      const start =  formatDate (this.model.range_date[0], 'yyyy-MM-dd', 'zh-ch');
      const end =  formatDate (this.model.range_date[1], 'yyyy-MM-dd', 'zh-ch');
      
      var fileName = `物件__审批时间_${start}_${end}__导出时间${now}.csv`;
    }else{
      var fileName = `物件__物件单号范围_导出时间${now}.csv`;
    }

    // this._downloadService.loading({
    //   data: {
    //     msg: '下载中',
    //     name: fileName
    //   }
    // });
    // this.okLoading = true;

    this.getExportFile();

    return;

    this.http.post('/web/thing/export', this.model).subscribe(result => {
        this.okLoading = false;
        if (result['code'] == 0) {
          this.message.success('下载成功');
          // this._downloadService.loaded({
          //   data: {
          //     msg: '下载成功',
          //     name: fileName,
          //     link: result['data']
          //   }
          // });
          this.isVisible = false;
        } else {
          this.message.error(result['msg'] ? result['msg'] : '下载失败');
          this._downloadService.error({
            data: {
              name: fileName,
              msg: result['msg'] ? result['msg'] : '下载失败',
            }
          });
        }
    }, (error) => {
      this.okLoading = false;
      if (error.status === 200) {
        this.getExportFile();
      } else {
        this.message.error('下载失败');
        this._downloadService.error({
          data: {
            msg: '下载失败',
            name: fileName
          }
        });
      }
    });
  }

  getExportFile () {
    const now = formatDate (new Date (), 'yyyyMMddhhmmss', 'zh-ch');
    if(this.model.range_date){  
      const start =  formatDate (this.model.range_date[0], 'yyyy-MM-dd', 'zh-ch');
      const end =  formatDate (this.model.range_date[1], 'yyyy-MM-dd', 'zh-ch');
  
      var fileName = `物件__审批时间_${start}_${end}__导出时间${now}.csv`;
    }else{
      var fileName = `物件__物件单号范围_导出时间${now}.csv`;
    }
    

    // this._downloadService.loading({
    //   data: {
    //     msg: '文件下载中...',
    //     name: fileName
    //   }
    // });

    this.okLoading = true;
    const messageId = this.message.loading('文件正在下载中...', { nzDuration: 0 }).messageId;

    this.http.post('/web/thing/export', this.model, {responseType: 'blob', observe: 'response'}).subscribe(result => {
      this.okLoading = false;
      if (!result['code']) {
        this.download(result.body, fileName);
        this.message.remove(messageId);
        this.message.success('下载成功');
      } else {
        this.message.remove(messageId);
        this.message.error(result['msg']);
      }

      // this.isVisible = false;
      // this.model = null;
      // this.downloadFile.status = 'success';
      //
      // this._downloadService.loaded({
      //   data: {
      //     msg: '下载成功',
      //     name: fileName
      //   }
      // });
    }, error => {
      this.okLoading = false;
      this.message.remove(messageId);
      this.message.error('下载失败');
    });
  }

  download (blob, name) {
    const eleLink = document.createElement('a');
    eleLink.download = name;
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

