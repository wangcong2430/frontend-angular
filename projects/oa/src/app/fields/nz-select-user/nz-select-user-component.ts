import { Component, OnInit} from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { ScriptService } from '../../services/script.service';
import { MessageService } from '../../services/message.service'

@Component({
  selector: 'nz-select-user',
  templateUrl: './nz-select-user-component.html',
  styles: [
    `
    ::ng-deep .need-approver-modal .ant-modal-body{
      padding: 0;
    }

    ::ng-deep .need-approver-modal .ant-table-thead > tr > th, .ant-table-tbody > tr > td {
      padding: 8px 16px;

    }

    ::ng-deep .search-user-body {
      line-height:32px;
    }

    ::ng-deep .content-modal .search-user-body .search-user-ul {
        min-width: 200px;
        width: 100%;
        max-width: 300px;
    }

    `
  ]
})
export class NzSelectUserComponent extends FieldType implements OnInit {

  constructor(
    private message: MessageService
  ) {
    super();
  }

  isVisible = false

  form = new FormGroup({});

  model = {
    lastName: 'Smith',
  };


  options: FormlyFormOptions = {};

  fields: FormlyFieldConfig[] = []

  get listOfData () {
    return this.model[this.key]['subcategory_need_approver'] || []
  };

  get isConfig () {
    let state = this.model[this.key]['subcategory_need_approver'].some(item => item.need_approver != '')

    state ? (this.model[this.key]['need_approver'] = null) : null
    return state
  }

  onChange ($event) {
    this.formControl.patchValue({
      need_approver: this.model[this.key]['need_approver'],
      subcategory_need_approver: this.model[this.key]['subcategory_need_approver']
    })
  }

  handleCancel () {
    this.isVisible = false
  }

  handleOk () {
    this.isVisible = false
  }

  openConfigModal () {
    this.isVisible = true
  }

  clear () {
    this.model[this.key]['subcategory_need_approver'].forEach(item => {
      item.need_approver = ''
    });
    this.message.success('清除成功')
  }

  change ($event) {
    this.formControl.patchValue({
      need_approver: this.model[this.key]['need_approver'],
      subcategory_need_approver: this.model[this.key]['subcategory_need_approver']
    })
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
