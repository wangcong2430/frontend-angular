import {Component} from '@angular/core';
import {FieldType} from "@ngx-formly/core";

@Component({
    selector: 'formly-field-text',
    template: `
        <div class="formly-field-text" *ngIf="model[key]" [innerHTML]="model[key]"></div>
    `
})
export class FormlyFieldText extends FieldType {
}
