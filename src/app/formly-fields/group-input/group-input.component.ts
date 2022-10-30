import {Component} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'formly-fields-group-input',
    templateUrl: './group-input.component.html',
    styleUrls: ['./group-input.component.css']
})
export class FormlyFieldsGroupInput extends FieldType {
    arrOptions = [];

    constructor(private util: UtilsService){
        super();
    }

    ngOnInit() {
        let value = this.model[this.key] || [];
        for(let item of value){
            let arrItem = this.itemOptions.opt;
            for(let opt of arrItem) {
                opt.value = item[opt.key];
            }
            this.arrOptions.push(arrItem);
        }
        if(!value.length){
            setTimeout(() => {
                this.addItem();
            });
        }
    }
    addItem() {
        this.arrOptions.push(this.itemOptions.opt);
        this.changeValue();
    }
    removeItem(i) {
        this.arrOptions.splice(i, 1);
        this.changeValue();
    }

    get itemOptions() {
        return this.util.deepClone({
            opt: this.to.options
        });
    }

    changeValue(e?, i?, j?){
        if(e){
            this.arrOptions[i][j]['value'] = e.target.value;
        }
        let retArr = [];
        for (let item of this.arrOptions) {
            let arr = {};
            for (let row of item) {
                arr[row.key] = row.value;
            }
            retArr.push(arr);
        }
        this.model[this.key] = retArr;
        this.updateForm();
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }
}
