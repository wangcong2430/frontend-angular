import {Component} from '@angular/core';
import {FieldType} from "@ngx-formly/core";
import {HttpClient} from "@angular/common/http";
import {UtilsService} from "../../services/utils.service";

@Component({
    selector: 'app-btns',
    templateUrl: './btns.component.html',
    styleUrls: ['./btns.component.css']
})
export class FormlyFieldBtns extends FieldType {
    constructor(
        private http: HttpClient,
        private util: UtilsService
    ){
        super();
    }
    btn_submit(item){
        if(!item.url){
            return false;
        }
        this.http.post(item.url, item.params || {}).toPromise().then(result => {
            if(result['code'] === 0){
                this.util.message(result['message'] || '成功', true);
            }
        });
    }

    trackByFn(index, item) {
        return item && item.id ? item.id : index; // or item.id
    }
}
