import {Component, OnInit} from '@angular/core';
import {FieldType} from "@ngx-formly/core";

@Component({
    selector: 'formly-field-table-data',
    templateUrl: './table-data.html',
    styleUrls: ['./table-data.css']
})
export class FormlyFieldTableData extends FieldType implements OnInit {
    ths;
    idKey;
    ngOnInit() {
        this.ths = this.to.data.ths || [];
        this.idKey = this.to.data.idKey;
        this.setModel();
    }

    isType(val, type, flag?) {
        return flag ? typeof val !== type : typeof val === type;
    }

    setModel(e?, i?, k?) {
        if(e){
            this.list[i][k]['value'] = e.target.value;
        }
        let res = [];
        let list = this.list;
        list && list.forEach(row => {
            let obj = {};
            obj[this.idKey] = row.id;
            for (let key in row) {
                if(this.isType(row[key], 'object') && row[key].type !== 'html'){
                    obj[key] = row[key]['value'];
                }
            }
            res.push(obj);
        });
        this.model[this.key] = res;
        this.updateForm();
    }

    updateForm() {
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }

    get list(){
        return this.to.data.list || [];
    }

}


