import {Component} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'formly-field-search-select',
    templateUrl: './search-select.component.html',
    styleUrls: ['./search-select.component.css']
})
export class FormlyFieldSearchSelect extends FieldType {
    constructor(
        private util: UtilsService
    ){
        super();
    }
    get text () {
        let index = this.util.findIndexByKeyValue(this.to.options, this.to.valueProp || 'value', this.model[this.key]);
        return index > -1 ? this.to.options[index][this.to.labelProp || 'label'] : '';
    }
    valueChange(value) {
        this.model[this.key] = value;
        this.updateForm();
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }
}
