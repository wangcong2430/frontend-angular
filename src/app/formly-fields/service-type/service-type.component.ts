import {Component} from '@angular/core';
import {FieldType} from "@ngx-formly/core";
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'formly-field-service-type',
    templateUrl: './service-type.component.html',
    styleUrls: ['./service-type.component.css']
})
export class FormlyFieldServiceType extends FieldType {
    oldModel = [];
    serviceList = [];
    oldValue;

    constructor(private util: UtilsService) {
        super();
    }

    ngOnInit() {
        if (this.to.listenKey) {
            this.form.valueChanges.subscribe(data => {
                if (data[this.key] !== this.oldValue && this.to['isInit']) {
                    this.to['isInit'] = false;
                    this.oldValue = data[this.key];
                    this.init();
                }
            });
        } else {
            this.init();
        }
    }

    init() {
        this.serviceList = this.resetOptions(this.to.options);
        this.model[this.key] = [];
        if (this.serviceList instanceof Array) {
            for (let row of this.serviceList) {
                for (let item of row.list) {
                    // isRequired = true 则自动勾选 required = true 的项目
                    // modifiable = true 则可以取消默认勾选（required）的项目 不包括已选的（checked）
                    if(this.to.isRequired && (+item.enabled && (item.checked || item.required))){
                        this.model[this.key].push(item[this.to.valueProp || 'id']);
                    } else if(!this.to.isRequired && (+item.enabled && item.checked)){
                        this.model[this.key].push(item[this.to.valueProp || 'id']);
                    }
                }
            }
        }
        this.oldModel = Object.assign([], this.model[this.key]);
        this.updateForm();
    }

    resetOptions(list) {
        list = this.util.orderBy(list, 'sort');
        let res = [];
        for (let row of list) {
            let val = [{
                parentCategory: true,
                category: row.category,
                list: []
            }];
            row.list = this.util.orderBy(row.list, 'sort');
            for (let item of row.list) {
                if (!item.sub_category) {
                    val[0]['list'].push(item);
                } else {
                    let index = this.util.findIndexByKeyValue(val, 'category', item.sub_category);
                    if (index > -1) {
                        val[index]['list'].push(item);
                    } else {
                        val.push({
                            parentCategory: false,
                            category: item.sub_category,
                            list: [item]
                        });
                    }
                }
            }
            res.push(...val);
        }
        return res;
    }

    toggle(item) {
        let index = this.model[this.key].indexOf(item[this.to.valueProp || 'id']);
        if (index > -1) {
            this.model[this.key].splice(index, 1);
        } else {
            this.model[this.key].push(item[this.to.valueProp || 'id']);
        }
        this.updateForm();
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }


    isDisabled(item){
        return (!this.to.modifiable && this.oldModel.indexOf(item[this.to.valueProp || 'id']) > -1) || !+item.enabled || +item.checked;
    }

    trackByFn(index, item) {
        return item && item.id ? item.id : index; // or item.id
    }


}
