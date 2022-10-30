import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'formly-field-multi-select',
    templateUrl: './multi-select.html'
})
export class FormlyFieldMultiSelect extends FieldType implements OnInit{
    get labelProp(): string { return this.to['labelProp'] || 'label'; }
    get valueProp(): string { return this.to['valueProp'] || 'value'; }

    data;
    constructor(private util: UtilsService){
        super();
    }
    ngOnInit() {
        this.data = [];
      if (Array.isArray(this.to.options) && this.to.options.length && this.to.multiple && Array.isArray(this.model[this.key])) {
            for (let item of this.model[this.key]) {
                let index = this.util.findIndexByKeyValue(this.to.options, this.valueProp, item)
                let val = {}
                if (index > -1) {
                    val = this.to.options[index];
                } else if(this.to.addTag){
                    val[this.labelProp] = item;
                }
                this.data.push(val);
            }
        } else if(!this.to.multiple){
            let index = this.util.findIndexByKeyValue(this.to.options, this.valueProp, this.model[this.key]);
            let val = {};
            if (index > -1) {
                val = this.to.options[index];
            } else if(this.to.addTag){
                val[this.labelProp] = this.model[this.key];
            }
            this.data = val;
        }
    }
    change(){
        if (Array.isArray(this.data)) {
            this.model[this.key] = [];
            for (let item of this.data) {
                if (item[this.valueProp] || item[this.labelProp]) {
                    this.model[this.key].push(item[this.valueProp] || item[this.labelProp]);
                }
            }
        } else {
            this.model[this.key] = this.data[this.valueProp] || this.data[this.labelProp];
        }
        this.updateForm();
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }
}
