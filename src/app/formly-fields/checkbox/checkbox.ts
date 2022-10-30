import {Component, OnInit} from '@angular/core';
import {FieldType} from "@ngx-formly/core";

@Component({
    selector: 'formly-field-checkbox',
    templateUrl: './checkbox.html'
})
export class FormlyFieldCheckbox extends FieldType implements OnInit{
    ngOnInit(){
        this.init();
    }

    init(){
        if(this.to.options instanceof Array){
            let other = [...this.model[this.key]];
            let otherIndex = 0;
            this.to.options.forEach((item, key) => {
                let index = other.indexOf(item[this.to.valueProp || 'value']);
                if(index > -1){
                    other.splice(index, 1);
                    item[this.to.checkedProp || 'checked'] = true;
                }
                if(item[this.to.valueProp || 'value'] === this.to.otherKey){
                    otherIndex = key;
                }
            });
            if(other.length){
                this.to.options[otherIndex]['otherVal'] = other[0];
                this.to.options[otherIndex][this.to.checkedProp || 'checked'] = true;
            }
        }
    }

    checkedStatus(option) {
        if (this.model[this.key] instanceof Array) {
            return this.model[this.key].indexOf(option[this.to.valueProp || 'value']) > -1
        }
    }

    toggle(option?) {
        if(option){
            option.checked = !option.checked;
        }
        if(this.to.options instanceof Array){
            let res = [];
            this.to.options.forEach(item => {
                if(item.checked && item[this.to.valueProp || 'value'] !== this.to.otherKey){
                    res.push(item[this.to.valueProp || 'value']);
                } else if(item.checked && item[this.to.valueProp || 'value'] === this.to.otherKey && item.otherVal){
                    res.push(item.otherVal);
                }
            });
            this.model[this.key] = res;
            this.updateForm();
        }
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }

    trackByFn(index, item) {
        return item && item.id ? item.id : index; // or item.id
    }
}

