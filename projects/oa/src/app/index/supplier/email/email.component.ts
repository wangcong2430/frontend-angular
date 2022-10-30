import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, filter, debounceTime } from 'rxjs/operators';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';

@Component({
  templateUrl: './email.component.html',
  styles: [`
		::ng-deep .ql-toolbar.ql-snow {
      line-height: 15px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-color: #d9d9d9;
    }
    ::ng-deep  .ql-toolbar.ql-snow + .ql-container.ql-snow {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border-color: #d9d9d9;
    }
  `]
})

export class EmailComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private cd: ChangeDetectorRef,

  ) {}

  onDestroy$
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
      supplier_options: [],
      contents: ''
    },
  };
  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'ant-row',
      fieldGroup: [
        {
          key: 'title',
          type: 'nz-autocomplete',
          className: 'ant-col-24',
          templateOptions: {
            label: '标题',
            nzLayout: 'fixedwidth',
            nzRequired : true,
          },
          expressionProperties: {
            'templateOptions.options': 'formState.supplier_options'
          },
          lifecycle: {
            onInit: (form, field, model, option) => {
              if (field.formControl.valueChanges) {
                field.formControl.valueChanges
                .pipe(filter(item => item))
                .pipe(debounceTime(60))
                .pipe(takeUntil(this.onDestroy$)).subscribe(value => {
                  let item = option.formState.supplier_options.find(i => i.value == value)
                  if (item) {
                    this.http.get('web/message/get-send-supplier-info?id=' + item.id).subscribe(result => {
                      if (result['code'] === 0) {
                        form.root.get('rec').patchValue(result['data']['rec']);
                        form.root.get('content').patchValue(result['data']['content']);
                        form.root.get('attachment_ids').patchValue(result['data']['attachment_ids']);
                        option.formState.contents = result['data']['content'];
                      } else {
                        this.message.error(result['msg']);
                      }
                    });
                  }
                });
              }
            }
          }
          
        },
        {
          key: 'rec',
          type: 'select-supplier',
          className: 'ant-col-24',
          templateOptions: {
            label: '收件人',
            nzLayout: 'fixedwidth',
            nzRequired : true,
          },
        },
        {
          key: 'content',
          type: 'rich-text',
          className: 'ant-col-24 mb-2',
          wrappers: ['field-wrapper'],
          templateOptions: {
            label: '正文',
            nzLayout: 'fixedwidth',
            placeholder: 'Formly is terrific!',
            nzRequired : true,
          },
          expressionProperties: {
            'templateOptions.contents': 'formState.contents'
          }
        },
        {
          key: 'attachment_ids',
          type: 'nz-upload',
          className: 'ant-col-24',
          templateOptions: {
            label: '上传附件',
            nzLayout: 'fixedwidth',
            nzLimit: 1,
            key: '1410',
            nzMultiple: true,
            options: []
          },
        },
      ]
    }
  ];

  ngOnInit() {
    this.onDestroy$ = new Subject<void>();
    this.getSupplierList()
  }

  sendEmail () {
    if (this.model.title && this.model.content && this.model.rec) {
      this.http.post('web/message/send-supplier', this.model).subscribe(result => {
        if (result['code'] === 0) {
          this.message.success(result['msg']);
          this.model = {};
          this.options.formState.contents = '';
          this.options.resetModel(this.model);
          this.cd.markForCheck();
          this.getSupplierList();
        } else {
          this.message.error(result['msg']);
        }
      });
    } else {
      this.message.error('邮件标题、邮件内容、收件人不可为空');
    }
  }

  getSupplierList () {
    this.http.get('web/message/get-send-supplier-list').subscribe(result => {
      if (result['code'] === 0) {
        this.options.formState.supplier_options = result['data']
        this.model = {};
      } else {
        this.message.error(result['msg']);
      }
    });
  }


  ngOnDestroy() {
    if (this.onDestroy$) {
      this.onDestroy$.next();
      this.onDestroy$.complete();
    }
  }

}
