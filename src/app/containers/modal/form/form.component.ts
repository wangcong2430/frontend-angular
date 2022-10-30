import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-form',
  templateUrl: './form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FormComponent implements OnInit {

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

  title = '';
  introduce = '';
  allRequired = true;
  baseUrl = '';

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modal: ModalService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.modal.modal$.subscribe(item => {
      if (item && item['key'] === 'form') {
        if (item['data']['url']) {
          this.baseUrl = item['data']['url']
        }
        this.model = null;
        this.http.get(this.baseUrl + '-config', {
          params: item['data']['params']
        }).subscribe(results => {
          if (results['code'] === 0) {
            this.isVisible = true;
            this.fields[0].fieldGroup = results['data']['form'];
            this.title = results['data']['title'] || this.title;
            this.introduce = results['data']['introduce'] || this.introduce;

            this.model = {
              ...this.model,
              ...item['data']['params']
            }
          } else {
            this.message.error(results['msg']);
          }
          this.cd.markForCheck();
        }, err => {
          this.message.error(err.msg);
          this.cd.markForCheck();
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
    this.formRequired(this.fields);
    if (!this.allRequired) {
      return;
    }
    this.submit();
  }

  // 校验是否必填
  formRequired (fields) {
    if (fields instanceof Array) {
      fields.map(field => {
        if (field.templateOptions.nzRequired && !field.formControl.value) {
          this.allRequired = false;
          field.templateOptions.nzValidateStatus = 'error';
          field.templateOptions.nzErrorTip = field.templateOptions.requiredTip || (field.templateOptions.label + '必填');
          this.message.error(field.templateOptions.nzErrorTip)
          this.cd.markForCheck();
        } else {
          field.templateOptions.nzValidateStatus = '';
          field.templateOptions.nzValidateText = '';
        }

        if (field.fieldGroup && field.fieldGroup instanceof Array) {
          this.formRequired(field.fieldGroup)
        }
      })
    }
  }

  submit () {
    this.okLoading = true;
    this.cd.markForCheck();
    this.http.post(this.baseUrl, this.model).subscribe(result => {
      this.okLoading = false;
      if (result['code'] === 0) {
        this.message.success('提交成功');
        this.isVisible = false;
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, error => {
      this.okLoading = false;
      this.cd.markForCheck();
    });
  }
}

