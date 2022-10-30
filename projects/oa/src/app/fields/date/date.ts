import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'formly-field-date',
    template: `
    <nz-date-picker [(ngModel)]="model[key]" (ngModelChange)="onChange($event)" nzShowTime></nz-date-picker>
  `,
})
export class FormlyFieldDate extends FieldType  implements OnInit {

    constructor(private datePipe: DatePipe) {
        super();
    }

    ngOnInit() {
        if (!(this.to.attributes instanceof Object)) {
            this.to.attributes = {};
        }
        Object.assign(this.to.attributes, {
            singleDatePicker: true,
        }, this.to.attributes);
    }

    onChange(date) {
        this.model[this.key] = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
        this.formControl.setValue(this.model[this.key]);
    }
}
