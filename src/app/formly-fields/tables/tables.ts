import {Component, OnInit} from '@angular/core';
import {FieldType} from "@ngx-formly/core";

@Component({
    selector: 'formly-field-tables',
    templateUrl: './tables.html',
    styleUrls: ['./tables.css']
})
export class FormlyFieldTables extends FieldType implements OnInit{
    ngOnInit(){
        this.to.type = this.to.type || 'default';
    }
}


