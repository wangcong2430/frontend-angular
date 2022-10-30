import { Component } from '@angular/core';
import {FieldType} from '@ngx-formly/core';

@Component({
  selector: 'formly-field-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.css']
})
export class FormlyFieldRadio extends FieldType {
    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }
}