import {Component} from '@angular/core';
import {FieldType} from "@ngx-formly/core";

@Component({
    selector: 'formly-field-nz-cascader',
    templateUrl: './component.html',
})
export class FormlyFieldCascader extends FieldType {
    onChange() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }
}
