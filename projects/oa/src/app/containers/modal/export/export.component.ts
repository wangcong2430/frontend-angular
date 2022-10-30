import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { DownloadService } from '../../../services/download.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-modal-export',
  templateUrl: './export.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ExportComponent implements OnInit {

  isVisible: Boolean = false;
  model: any = {};
  form = new FormGroup({});
  options: FormlyFormOptions = {};

  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'ant-row',
      fieldGroup: [
      ]
    }
  ];

  title = '导出'
  allRequired = true;
  baseUrl = '';

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modal: ModalService,
    private download: DownloadService,
    private cd: ChangeDetectorRef,
    private modalService: NzModalService,

  ) {}

  ngOnInit() {
    this.modal.modal$.subscribe(item => {
      if (item && item['key'] === 'export') {
        this.model = null
        this.modalService.create({
          nzTitle: '用户保密协议和隐私政策',
          nzContent: 'WBP平台的所有内容仅供内部有权限人员使用，您的导出操作及内容将被系统记录，对于未经授权私自泄露行为，公司将有权追究法律责任!',
          nzOkText: '同意并继续',
          nzOnOk: () => new Promise(resolve => {
            if (item['data']['url']) {
              this.baseUrl = item['data']['url']
            }
            this.http.get(this.baseUrl + '-config', {
              params: item['data']['params']
            }).subscribe(results => {
              resolve();
              if (results['code'] === 0) {
                this.isVisible = true;
                this.fields[0].fieldGroup = results['data']['form'];
                this.title = results['data']['title'] || this.title;
                this.model = {
                  ...this.model,
                  ...item['data']['params']
                }
              } else {
                this.message.error(results['msg']);
              }
              resolve;
              this.cd.markForCheck();
            }, err => {
              this.message.error(err.msg);
              this.cd.markForCheck();
            });
          })
        });
      }
    });
  }

  // 关闭导出
  handleCancel () {
    this.isVisible = false;
    this.cd.markForCheck();
  }

  okLoading = false;

  handleOk () {

    this.allRequired = true;
    this.formRequired(this.fields, this.model);
    if (!this.allRequired) {
      return;
    }
    this.getExportFile();
  }

  // 校验是否必填
  formRequired (fields, model) {
    fields.map(field => {
      if (field.templateOptions.required && !model[field.key]) {
        this.allRequired = false;
        this.message.error(field.templateOptions.label + '必填')
        this.cd.markForCheck();
      }
    })

    if (fields.fieldGroup) {
      this.formRequired(fields.fieldGroup, model[fields.key])
    }
  }

  getExportFile () {
    const fileName = `WBP物件数据.csv`;
    this.okLoading = true;
    const messageId = this.message.loading('文件正在下载中...', { nzDuration: 0 }).messageId;
    this.cd.markForCheck();
    this.http.post(this.baseUrl, this.model).subscribe(result => {
      this.okLoading = false;
      this.message.remove(messageId);
      if (result['code'] === 0) {
        this.message.success('下载成功');
        this.download.loaded({
          data: {
            msg: '下载成功',
            name: result['data']['name'] || fileName,
            link: result['data']['url']
          }
        });
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, error => {
      this.okLoading = false;
      this.message.remove(messageId);
      this.message.error('下载失败');
      this.cd.markForCheck();
    });
  }

  // download (blob, name) {
  //   const eleLink = document.createElement('a');
  //   eleLink.download = name;
  //   eleLink.style.display = 'none';
  //   // 字符内容转变成blob地址
  //   eleLink.href = URL.createObjectURL(blob);
  //   // 触发点击
  //   document.body.appendChild(eleLink);
  //   eleLink.click();
  //   // 然后移除
  //   document.body.removeChild(eleLink);
  // }

  // downloadByUrl (url, name = null) {
  //   const eleLink = document.createElement('a');
  //   eleLink.download = name;
  //   eleLink.style.display = 'none';
  //   // 字符内容转变成blob地址
  //   eleLink.href = url;
  //   // 触发点击
  //   document.body.appendChild(eleLink);
  //   eleLink.click();
  //   // 然后移除
  //   document.body.removeChild(eleLink);
  // }
}

