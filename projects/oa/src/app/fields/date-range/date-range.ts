import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'formly-field-date-range',
    template: `
    <nz-range-picker [(ngModel)]="model[key]" (ngModelChange)="onChange($event)" [nzFormat]="'yyyy-MM-dd'"></nz-range-picker>
  `,
})
export class FormlyFieldDateRange extends FieldType implements OnInit {

    constructor(private datePipe: DatePipe) {
        super();
    }

    ngOnInit() {
        if (!(this.to.attributes instanceof Object)) {
            this.to.attributes = {};
        }
        Object.assign(this.to.attributes, {
            timePicker24Hour: true,
        }, this.to.attributes);
    }

    onChange(value) {
        if (Array.isArray(value) && value.length == 2) {
            this.model[this.key] = [
                this.datePipe.transform(value[0], 'yyyy-MM-dd'),
                this.datePipe.transform(value[1], 'yyyy-MM-dd'),
            ];
            if (this.to.attributes['start_key']) {
                this.model[this.to.attributes['start_key']] = this.model[this.key][0];
            }
            if (this.to.attributes['end_key']) {
                this.model[this.to.attributes['end_key']] = this.model[this.key][1];
            }
            this.formControl.setValue(this.model[this.key]);
        } else {
            this.model[this.to.attributes['start_key']] = undefined;
            this.model[this.to.attributes['end_key']] = undefined;
            this.formControl.setValue(null);
        }
    }
}
