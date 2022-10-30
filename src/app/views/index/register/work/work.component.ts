import { Component, OnInit } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormService, StyleService, SupplierService } from "../../../../../api-client";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { UtilsService } from "../../../../services/utils.service";

@Component({
    selector: 'app-index-register-work',
    templateUrl: './component.html',
})
export class WorkComponent implements OnInit {


    form = new FormGroup({});
    form_data;
    form_fields: FormlyFieldConfig[];


    constructor(
        private http: HttpClient,
        private styleService: StyleService,
        private formService: FormService,
        private router: Router,
        private utils: UtilsService,
        private supplierService: SupplierService) {

    }

    ngOnInit() {
        this.formService.webFormPost({
            model: 'Work',
            params: {
                scenario: 'supplier_save'
            }
        }).subscribe(result => {
            let fields = result['data'];
            this.supplierService.webSupplierWorksGet().subscribe(result => {
                if (result['ret_code'] === 0) {
                    this.form_data = {
                        works: [{}]
                    };
                    if (Array.isArray(result['data']) && result['data'].length) {
                        this.form_data['works'] = result['data'];
                    }

                    this.form_fields = [
                        {
                            key: 'works',
                            type: 'repeat',
                            className: 'work-editor-list',
                            fieldArray: {
                                templateOptions: {
                                    filedGroupClassName: 'work-editor',
                                    btnText: 'Add another work',
                                    removeBtnText: 'Add another work',
                                },
                                fieldGroup: fields
                            }
                        }
                    ];
                }
            });
        });
    }

    submit() {
        if (this.form.invalid) {
            return;
        }
        this.supplierService.webSupplierWorksPost(this.form_data).subscribe(result => {
            if (result['ret_code'] === 0) {
                this.router.navigate(['/']);
            }
        });
    }

}
