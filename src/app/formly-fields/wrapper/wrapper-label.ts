import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
    selector: 'formly-wrapper-label',
    template: `
        <label *ngIf="to.label" class="formly-label">
            <span [innerHTML]="to.label"></span>
            <span *ngIf="to.required" class="text-danger"> *</span>
        </label>
        <ng-container #fieldComponent></ng-container>
    `,
})
export class LabelWrapperComponent extends FieldWrapper {
    @ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent: ViewContainerRef;
}
