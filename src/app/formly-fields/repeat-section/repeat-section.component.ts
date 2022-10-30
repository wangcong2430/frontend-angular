import {Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'app-repeat-section',
    templateUrl: './repeat-section.component.html',
    styleUrls: ['./repeat-section.component.less']
})
export class FormlyFieldRepeatSection extends FieldType implements OnInit{
    list;
    constructor(
        private util: UtilsService
    ) {
        super();
    }

    ngOnInit() {
        this.list = [];
        this.init();
    }

    init(){
        if(this.model[this.key] && this.model[this.key].length){
            this.model[this.key].forEach(item => {
                let opt = this.itemOptions.opt;
                opt.forEach(val => {
                    val.value = item[val.key];
                });
                this.list.push(opt);
            });
        } else {
            this.addItem(this.list.length);
        }
    }

    addItem(index) {
        this.list.splice(index, 0, this.itemOptions.opt);
        this.setValue();
    }

    delItems(index) {
        this.list.splice(index, 1);
        this.setValue();
    }

    setValue() {
        let res = [];
        this.list.forEach(row => {
            let i = {};
            let flag = false;
            row.forEach(item => {
                if(item.value && item.value.length > 0){
                    flag = true;
                }
                i[item.key] = item.value || null;
            });
            flag && res.push(i);
        });
        this.model[this.key] = res;
        this.updateForm();
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }

    get itemOptions() {
        return this.util.deepClone({
            opt: this.to.options
        });
    }
}
