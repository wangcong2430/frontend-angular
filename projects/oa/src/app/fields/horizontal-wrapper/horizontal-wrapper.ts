import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
    selector: 'formly-horizontal-wrapper',
    template: `
    <div class="form-group row">
      <label [attr.for]="id" class="col-form-label text-right" *ngIf="to.label" [ngClass]="to['labelClass'] || 'col-sm-2'">
      <ng-container *ngIf="to.required && to['hideRequiredMarker'] !== true">*</ng-container>
        {{ to.label }}:
      </label>
      <div [ngClass]="to['controlClass'] || 'col-sm-10'">
        <ng-template #fieldComponent></ng-template>
      </div>
    </div>
  `,
})
export class FormlyHorizontalWrapper extends FieldWrapper {
    @ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent: ViewContainerRef;
}
