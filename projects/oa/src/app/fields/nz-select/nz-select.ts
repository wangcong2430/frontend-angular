import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
    selector: 'formly-field-nz-select',
    templateUrl: './nz-select.html'
})
export class FormlyFieldNzSelect extends FieldType {
    get labelProp(): string {
        return this.to['labelProp'] || 'label';
    }

    get valueProp(): string {
        return this.to['valueProp'] || 'value';
    }

    get mode(): string {
        return this.to['mode'] || 'default';
    }
    trackByFn(index, item) {
        return item && item.id ? item.id : index; // or item.id
    }
}
