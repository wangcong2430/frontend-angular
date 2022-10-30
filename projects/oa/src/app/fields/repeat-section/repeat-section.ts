import { Component } from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-section',
  template: `
    <label>{{to.label}}</label>
    <div *ngFor="let field of field.fieldGroup; let i = index;trackBy: trackByFn">
      <formly-group
        [field]="field"
        [options]="options"
        [form]="formControl">
      </formly-group>
    </div>
  `,
})

export class RepeatSectionComponent extends FieldArrayType {
  constructor(builder: FormlyFormBuilder) {
    super(builder);
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
