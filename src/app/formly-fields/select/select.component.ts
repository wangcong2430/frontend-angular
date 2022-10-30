import {Component, OnInit} from '@angular/core';
import {FieldType} from "@ngx-formly/core";
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'formly-field-select',
    templateUrl: './select.component.html'
})
export class FormlyFieldSelect extends FieldType implements OnInit {

    constructor(
        private util: UtilsService
    ) {
        super();
    }

    ngOnInit() {
        setTimeout(() => {
            let index = this.util.findIndexByKeyValue (this.to.options, this.to.valueProp || 'value', this.model[this.key]);
            if(index === -1){
                this.model[this.key] = '';
                this.updateForm();
            }
        });
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }

    get text() {
        let index = this.util.findIndexByKeyValue (this.to.options, this.to.valueProp || 'value', this.model[this.key]);
        return index > -1 ? this.to.options[index][this.to.labelProp || 'label'] : '';
    }
}
