import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import {UtilsService} from "../../services/utils.service";
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'formly-wrapper-single',
    templateUrl: './wrapper-single.html',
})
export class WrapperSingleComponent extends FieldWrapper {
    @ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent: ViewContainerRef;
    oldModel;
    constructor(
        private util: UtilsService,
        private translate: TranslateService
    ){
        super();
    }

    editClick() {
        if(this.form['singleKey'] && this.form['singleKey'].length){
            this.cancel();
        }
        this.oldModel = Object.assign({}, this.model);
        this.form['singleKey'] = this.to.relatedArr || [this.key];
        if(this.field.type === 'linkage'){
            this.to.data && this.to.data.forEach((item, index) => {
                item.value = this.model[this.key][index];
            });
            if(this.to.data.length){
                this.to.data[0]['options'] = this.to.options;
                this.to.data.forEach((item, index) => {
                    item.value = this.model[this.key][index];
                    if(item.value && index+1<this.to.data.length){
                        let i = this.util.findIndexByKeyValue(item.options, 'value', item.value);
                        if(i > -1){
                            this.to.data[index+1]['options'] = item.options[i]['children'];
                        }
                    } else {
                        if(this.to.data[index+1]){
                            this.to.data[index+1]['options'] = [];
                        }
                    }
                })
            }
        }
    }
    cancel(){
        this.reset();
        this.form['singleKey'] = [];
    }

    reset() {
        this.options && this.options.resetModel && this.options.resetModel(this.oldModel);
    }

    get text() {
        if(['select', 'search-select'].indexOf(this.field.type) > -1){
            let index;
            if(this.to.options && this.to.options instanceof Array){
                index = this.to.options.find(item => {
                    return item[this.to.valueProp || 'value'] == this.model[this.key];
                });
            }
            return index ? index[this.to.labelProp || 'label'] : '';
        } else if(this.field.type === 'file'){
            let options = this.to.options || [];
            let res = '';
            if(options instanceof Array){
                options.forEach(item => {
                    res += item.label + '; ';
                });
            }
            return res;
        } else if(this.field.type === 'linkage'){
            return this.model[this.key] ? this.model[this.key].join('/') : '';
        }
        return this.model[this.key];
    }
}
