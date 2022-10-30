import {Component} from '@angular/core';
import {FieldType} from "@ngx-formly/core";
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'formly-field-linkage',
    templateUrl: './linkage.component.html',
    styleUrls: ['./linkage.component.css']
})
export class FormlyFieldLinkage extends FieldType {
    data;
    constructor(
        private util: UtilsService
    ){
        super();
    }
    ngOnInit() {
        this.init();
    }

    init(){
        if(this.to.data.length){
            this.to.data[0]['options'] = this.to.options;
            this.to.data.forEach((item, index) => {
                item.value = this.model[this.key][index];
                if(item.value && index+1<this.to.data.length){
                    let i = this.util.findIndexByKeyValue(item.options, 'value', item.value);
                    if(i > -1){
                        this.to.data[index+1]['options'] = item.options[i]['children'];
                    }
                }
            })
        }
    }

    change(i) {
        this.to.data.forEach((item, index) => {
            if(index > i){
                item.value = '';
                item.options = [];
            }
            if(index === i+1){
                let optIndex = this.util.findIndexByKeyValue(this.to.data[i]['options'], 'value', this.to.data[i]['value']);
                item.options = optIndex > -1 ? this.to.data[i]['options'][optIndex]['children'] : [];
            }
        });
        this.updateForm();
    }

    updateForm() {
        let res = [];
        this.to.data.forEach(item => {
            item.value && res.push(item.value);
        });
        this.model[this.key] = res;
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }
}
