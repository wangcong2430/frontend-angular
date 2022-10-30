import { Component } from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';

@Component({
    selector: 'formly-repeat-section',
    template: `
    <div *ngFor="let sub_field of field.fieldGroup; trackBy: trackByFn let i = index;" [ngClass]="field.fieldArray.templateOptions['filedGroupClassName']">
      <formly-group
        [ngClass]="field.fieldArray.templateOptions['filedGroupItemClassName']"
        [model]="model[i]"
        [field]="sub_field"
        [options]="options"
        [form]="formControl">
        <div class="col-sm-2 d-flex align-items-center" *ngIf="sub_field.templateOptions['showRemoveButton']">
          <button class="btn btn-danger" type="button" (click)="remove(i)">Remove</button>
        </div>
      </formly-group>
    </div>
    <div class="repeat-section-creator" *ngIf="field.fieldArray.templateOptions['showAddButton']">
      <button class="btn btn-primary" type="button" (click)="add()">{{ field.fieldArray.templateOptions['btnText'] }}</button>
    </div>
  `,
})
export class RepeatTypeComponent extends FieldArrayType  {
    constructor(builder: FormlyFormBuilder) {
        super(builder);
    }

    add(){
        super.add();
    }
      trackByFn(index, item) {
        return item && item.id ? item.id : index; // or item.id
      }
}
