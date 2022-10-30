import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';

@Component({
    selector: 'formly-field-month-select',
    templateUrl: './month-select.component.html',
    styleUrls: ['./month-select.component.css']
})
export class FormlyFieldMonthSelect extends FieldType implements OnInit{
    yearList = [];
    monthList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    query = {
        year: '',
        month: ''
    };

    ngOnInit() {
        let year = new Date().getFullYear();
        for (let i = 2018; i <= year; i++) {
            this.yearList.push(i + '');
        }
        if(this.model[this.key]){
            let value = this.model[this.key];
            this.query.year = value.slice(0, 4);
            this.query.month = value.slice(4, 6);
        }
    }

    valueChange() {
        if(this.query.year && this.query.month){
            this.model[this.key] = this.query.year + this.query.month;
        } else {
            this.model[this.key] = '';
        }
        this.updateForm();
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }
}
