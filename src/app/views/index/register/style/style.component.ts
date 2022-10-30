import { Component, OnInit } from '@angular/core';
import { StyleService, SupplierService } from "../../../../../api-client";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs/internal/observable/forkJoin";

@Component({
    selector: 'app-index-register-style',
    templateUrl: './component.html',
    styleUrls: ['./component.css']
})
export class StyleComponent implements OnInit {

    model = [];
    categories;

    constructor(
        private http: HttpClient,
        private styleService: StyleService,
        private router: Router,
        private supplierService: SupplierService) {

    }

    ngOnInit() {
        forkJoin([
            this.styleService.webStyleGet(),
            this.supplierService.webSupplierStylesGet(),
        ]).subscribe(results => {
            if (results[0]['ret_code'] === 0) {
                this.categories = results[0]['data'];
            }
            if (results[1]['ret_code'] === 0) {
                this.model = results[1]['data'];
                this.categories.forEach(category => {
                    category.counter = 0;
                    category.styles = category.styles || [];
                    category.styles.forEach(style => {
                        style.checked = this.model.indexOf(style.id) > -1;
                        if (style.checked) {
                            category.counter++;
                        }
                    })
                })
            }
        });
    }

    categoryCounter(category) {
        let counter = 0;
        category.styles = category.styles || [];
        category.styles.forEach(style => {
            if (style.checked) {
                counter++;
            }
        });
        return counter;
    }

    change(style) {
        if (!(this.model instanceof Array)) {
            this.model = [];
        }
        if (style['checked']) {
            const index = this.model.indexOf(style.id);
            if (index > -1) {
                this.model.splice(index, 1);
            }
        } else {
            const index = this.model.indexOf(style.id);
            if (index === -1) {
                this.model.push(style.id);
            }
        }
    }

    submit() {
        this.supplierService.webSupplierStylesPost({styleIdList: this.model}).subscribe(result => {
            if (result['ret_code'] === 0) {
                this.router.navigate(['/register/work']);
            }
        });
    }
}
