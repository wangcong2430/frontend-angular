import { Component, ElementRef, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-nz-group-select-number',
  templateUrl: './nz-group-select-number.html'
})
export class FormlyFieldNzGroupSelectNumber extends FieldType implements OnInit{
  constructor(
  ) {
    super();
  }

  ngOnInit() {
    if (this.field.defaultValue) {
      if (typeof(this.model[this.keys[0]]) === 'undefined' && typeof(this.model[this.keys[1]]) === 'undefined') {
        let defaultValue = this.field.defaultValue || ',';
        defaultValue = defaultValue.split(',');
        this.model[this.keys[0]] = defaultValue[0];
        this.model[this.keys[1]] = defaultValue[1];
      }
    }
  }

  get labelProp(): string {
    return this.to['labelProp'] || 'label';
  }

  get valueProp(): string {
    return this.to['valueProp'] || 'value';
  }

  get mode(): string {
    return this.to['mode'] || 'default';
  }

  get keys(): {} {
    const keys = this.key || ',';
    return keys.split(',');
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
