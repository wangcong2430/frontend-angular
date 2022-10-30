import {Component, OnInit} from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-nz-input-number',
  templateUrl: './nz-input-number.html'
})
export class FormlyFieldNzInputNumber extends FieldType {

  get labelProp(): string {
    return this.to['labelProp'] || 'label';
  }

  get valueProp(): string {
    return this.to['valueProp'] || 'value';
  }

  get mode(): string {
    return this.to['mode'] || 'default';
  }

}
