import {Component, OnInit} from '@angular/core';
import {Field} from '@ngx-formly/core';
import {UtilsService} from '../../services/utils.service';

@Component({
    selector: 'formly-field-check-list',
    templateUrl: './check-list.html',
    styleUrls: ['./check-list.css']
})
export class FormlyFieldCheckList extends Field implements OnInit {
    private src;

    constructor(
        private util: UtilsService
    ) {
        super();
    }

    ngOnInit() {
        this.src = this.to.src;
        if(this.to['data'] && this.to['data']['isBan']){
            this.setValueObj('init');
        }
    }

    setValueObj(str?) {
        for(let i of <any[]>this.to['options']){
            let status = 0, enabled = 0;
            if(str === 'init'){
                status = i.checked;
                enabled = i.enabled;
            } else {
                status = this.model[this.key].indexOf(i[this.to.valueProp || 'value']) > -1? 1: 0;
                enabled = i.ban ? 0: 1;
            }
            this.to['data']['valueObj'][i[this.to.valueProp || 'value']] = {
                status: status,
                enabled: enabled
            };
        }
    }

    toggle(option, flag?) {
        if(option.ban && !flag){
            this.util.message('请先解除该服务禁用');
            return false;
        }
        if (!(this.model[this.key] instanceof Array)) {
            this.model[this.key] = [];
        }
        let index = this.model[this.key].indexOf(option[this.to.valueProp || 'value']);
        if (index == -1) {
            this.model[this.key].push(option[this.to.valueProp || 'value']);
        } else {
            this.model[this.key].splice(index, 1);
        }
        if(this.to['data'] && this.to['data']['isBan']){
            this.setValueObj();
        }
        this.updateForm();
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }

    ban(e, option) {
        e.stopPropagation();
        option.ban = !option.ban;
        if(option.ban && this.model[this.key].indexOf(option[this.to.valueProp || 'value'])>-1){
            this.toggle(option, true);
        }
        this.setValueObj();
    }
}
