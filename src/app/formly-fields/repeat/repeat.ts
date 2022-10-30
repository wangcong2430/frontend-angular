import { Component } from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';

@Component({
    selector: 'formly-repeat-section',
    template: `
    <div *ngFor="let sub_field of field.fieldGroup; let i = index;" [ngClass]="field.fieldArray.templateOptions.filedGroupClassName">
      <formly-group
        [ngClass]="field.fieldArray.templateOptions.filedGroupItemClassName"
        [model]="model[i]"
        [field]="sub_field"
        [options]="options"
        [form]="formControl">
        <div class="align-items-center">
            <i class="anticon anticon-close" (click)="remove(i)"></i>
        </div>
      </formly-group>
    </div>
    <div class="repeat-section-creator">
      <button class="btn" type="button" (click)="add()">
          <i class="anticon anticon-plus-square-o"></i>
          {{ field.fieldArray.templateOptions.btnText }}
      </button>
    </div>
  `,
})
export class RepeatTypeComponent extends FieldArrayType {
    constructor(builder: FormlyFormBuilder) {
        super(builder);
    }
}