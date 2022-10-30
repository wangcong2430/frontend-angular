import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { CategoryService, SupplierService } from "../../../../../api-client";
import { Router } from "@angular/router";
import { TreeService } from "../../../../services/tree.service";
import { forkJoin } from "rxjs/internal/observable/forkJoin";

@Component({
  selector: 'app-index-register-category',
  templateUrl: './component.html',
  styleUrls: ['./style.less']
})
export class CategoryComponent implements OnInit {

    model = [];
    categories;

    constructor(
      private http: HttpClient,
      private categoryService: CategoryService,
      private router: Router,
      private treeService: TreeService,
      private supplierService: SupplierService
    ) {}

    ngOnInit() {
        forkJoin([
            this.categoryService.webCategoryTreeGet(),
            this.supplierService.webSupplierCategoriesGet()
        ]).subscribe(results => {
            if (results[1]['ret_code'] === 0) {
                this.model = results[1]['data'];
            }
            if (results[0]['ret_code'] === 0) {
                this.categories = results[0]['data'];
                this.categories = this.treeService.map(this.categories, (node, parent) => {
                    node['parent'] = parent;
                    if (Array.isArray(node['children'])) {
                        node['counter'] = 0;
                        node['children'].forEach(child => {
                            if (Array.isArray(child['children'])) {
                                node['counter'] += child['counter'];
                            } else {
                                if (child.checked) {
                                    node['counter']++;
                                }
                            }
                        });
                    } else {
                        node.checked = this.model.indexOf(node.id) > -1;
                    }
                    return node;
                });
                if (this.model.length) {
                    let is_set_active = false;
                    this.categories.forEach(category => {
                        if (!is_set_active && category.counter) {
                            category.active = is_set_active = true;
                        }
                    });
                } else {
                    if (this.categories[0]) {
                        this.categories[0]['active'] = true;
                    }
                }
            }
        });
    }

    change(category) {
        if (!(this.model instanceof Array)) {
            this.model = [];
        }
        if (category['checked']) {
            let index = this.model.indexOf(category.id);
            if (index > -1) {
                this.model.splice(index, 1);
            }
        } else {
            let index = this.model.indexOf(category.id);
            if (index === -1) {
                this.model.push(category.id);
            }
        }
        if (category.parent) {
            this.parentCounter(category.parent, !category['checked']);
        }
    }

    parentCounter(parent, checked) {
        if (parent) {
            if (checked) {
                parent.counter++;
            } else {
                parent.counter--;
            }
            if (parent.parent) {
                this.parentCounter(parent.parent, checked);
            }
        }
    }

    submit() {
        this.supplierService.webSupplierCategoriesPost({categoryIdList: this.model}).subscribe(result => {
            if (result['ret_code'] === 0) {
                this.router.navigate(['/register/style']);
            }
        });
    }

    activeTopCategory(category) {
        this.categories.forEach(item => {
            item.active = item.id == category.id;
        });
    }

    trackByFn(index, item) {
        return item && item.id ? item.id : index; // or item.id
    }
}
