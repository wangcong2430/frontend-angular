import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { DatePipe } from "@angular/common";

@Component({
    selector: 'formly-field-date',
    template: `
<nz-date-picker [(ngModel)]="value" (ngModelChange)="onChange($event)"></nz-date-picker>
  `,
    styleUrls: ['./date.css']
})
export class FormlyFieldDate extends FieldType {
    type: string;
    result_name;
    value;
    datePipe = new DatePipe('zh-Hans');

    ngOnInit() {
        this.value = this.model[this.key];
    }

    onChange(date) {
        this.model[this.key] = this.datePipe.transform(date,'yyyy-MM-dd');
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }

}