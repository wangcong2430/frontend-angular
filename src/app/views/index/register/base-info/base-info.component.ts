import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { FormService } from '../../../../../api-client/api/form.service';
import { SupplierService } from '../../../../../api-client/api/supplier.service';

@Component({
    selector: 'app-index-register-base-info',
    templateUrl: './component.html',
})

export class BaseInfoComponent implements OnInit {

    type;
    tab_active_index;
    company_form = new FormGroup({});
    person_form = new FormGroup({});
    company_form_data = {};
    person_form_data = {};
    company_form_fields: FormlyFieldConfig[];
    person_form_fields: FormlyFieldConfig[];

    constructor(
      private http: HttpClient,
      private formService: FormService,
      private router: Router,
      private supplierService: SupplierService)
    {}

    submit(model) {
        let request;
        switch (this.type) {
            case 'company':
                request = this.supplierService.webSupplierBaseInfoCompanyPost(model).subscribe(result => {
                    if (result['ret_code'] === 0) {
                        this.router.navigate(['/register/category']);
                    }
                });
                break;
            case 'person':
                request = this.supplierService.webSupplierBaseInfoPersonPost(model).subscribe(result => {
                    if (result['ret_code'] === 0) {
                        this.router.navigate(['/register/category']);
                    }
                });
                break;
        }
    }

    ngOnInit() {
        this.loadData();
        this.loadFormFields();
    }

    loadData() {
        this.supplierService.webSupplierBaseInfoGet().subscribe(result => {
            this.type = result['data']['type'];
            switch (this.type) {
                case 'company':
                    this.tab_active_index = 0;
                    this.company_form_data = result['data']['baseInfo'];
                    this.person_form_data = {};
                    break;
                case 'person':
                    this.tab_active_index = 1;
                    this.company_form_data = {};
                    this.person_form_data = result['data']['baseInfo'];
                    break;
                default:
                    this.type = 'company';
                    this.tab_active_index = 0;
                    break;
            }
        });
    }

    loadFormFields() {
        this.formService.webFormPost({
            model: 'Company',
            params: {
                'scenario': 'supplier_save'
            },
        }).subscribe(result => {
            if (result['ret_code'] === 0) {
                this.company_form_fields = result['data'];
            }
        });
        this.formService.webFormPost({
            model: 'Person',
            params: {
                'scenario': 'supplier_save'
            },
        }).subscribe(result => {
            if (result['ret_code'] === 0) {
                this.person_form_fields = result['data'];
            }
        });
    }
}
