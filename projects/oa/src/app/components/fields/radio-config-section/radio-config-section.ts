import { Component, ChangeDetectorRef,  ChangeDetectionStrategy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-radio-config-section',
  templateUrl: './radio-config-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RadioConfigComponent extends FieldArrayType implements OnInit {
  constructor(
    builder: FormlyFormBuilder,
    private http: HttpClient,
    private cd: ChangeDetectorRef,

  ) {
    super(builder);
  }

  isRenderForm: Boolean = false;
  isVisible: Boolean = false;
  title: String = '标题';

  radioModel = {
    large_config: {},
    small_config: [{
      id: 1,
      label: '标题',
      value: [],
      checked: true
    }]
  };

  formlyField: FormlyFieldConfig[] = [
    {
      key: 'small_config',
      type: 'table-section',
      templateOptions: {
        // nzTitleTemplate: true,
        // nzTitle: 'nzAddTemplate'
      },
      fieldArray: {
        fieldGroup: [
          {
            key: 'checked',
            type: 'nz-checkbox',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: 'checked',
              type: 'isBoolean'
            }
          },
          {
            key: 'label',
            type: 'nz-label',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              label: 'label',
            }
          },
          {
            key: 'value',
            type: 'nz-select',
            wrappers: ['empty-wrapper'],
            templateOptions: {
              callback: (name: string) => this.http.get('web/user/search-names', {
                params: {enName: name}}).pipe(map(res => res['data'])),
              label: 'category_type',
              labelEdit: true,
              nzServerSearch: true,
              nzShowSearch: true,
              nzMode: 'multiple',
              options: [],
            }
          }
        ]
      }
    }
  ];

  selectFormlyField: FormlyFieldConfig[] = [
    {
      key: 'large_config',
      type: 'nz-select',
      defaultValue: '1',
      wrappers: ['empty-wrapper'],
      templateOptions: {
        callback: (name: string) => this.http.get('web/user/search-names',
          {params: {enName: name}}).pipe(map(res => res['data'])),
        nzServerSearch: true,
        nzShowSearch: true,
        nzMode: 'multiple',
        options: [],
      }
    }
  ];

  ngOnInit () {
    if (this.model.need_approver) {
      // this.radioModel.small_config = this.model.need_approver.small_config
      // this.radioModel.large_config = this.model.need_approver.large_config
    }
    this.isRenderForm = true;
    this.cd.markForCheck();
  }

  onChange($event) {
    if ($event === 'large') {
      this.isVisible = false;
    } else {
      this.isVisible = true;
    }
    this.cd.markForCheck();
  }

  modelChange (event) {
    this.model.need_approver.large_config = this.radioModel.large_config;
    this.cd.markForCheck();
  }

  edit () {
    if (this.model[this.key]['need_approver_config'] === 'large') {
      this.isVisible = false;
    } else {
      this.isVisible = true;
    }
    this.cd.markForCheck();
  }

  closeModel () {
    this.isVisible = false;
    this.cd.markForCheck();
  }

  submit () {
    this.isVisible = false;
    this.cd.markForCheck();
  }
}
