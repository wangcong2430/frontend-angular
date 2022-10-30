import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { RestLinkService } from '../../../services/rest-link.service';
import { TranslateService } from '@ngx-translate/core';
import { NzTreeNode } from 'ng-zorro-antd';
import { filterOption } from '../../../utils/utils';

@Component({
  templateUrl: './category.component.html',
  styles: [
  `
    :host ::ng-deep .ant-card-body{
      padding: 16px;
      padding-top: 8px;
    }
  `]
})

export class CategoryComponent  implements OnInit {
  modelClass = 'FaultInfluenceType';
  title;
  user;
  data;
  expandDataCache = {};
  pagination = {
    previous_text: 'previous',
    next_text: 'next',
    total_count: null,
    page_size: null,
  };
  query = {
    page: 1,
    'per-page': null
  };
  loading = false;

  form: FormGroup;
  formInitData = {};
  formData = {};
  formFields: FormlyFieldConfig[];
  validateForm: FormGroup;
  options: FormlyFormOptions = {};
  treeSelect = [];
  languages = [];
  languageFields = {};

  queryFields: FormlyFieldConfig[];
  columns;
  is_sync;
  modalRef: BsModalRef;
  link_name_map;
  produceBreakdownList = [];
  produceGradeList = [];
  workloadUnitList = [];
  filterOption = filterOption
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private modalService: BsModalService,
    private restLinkService: RestLinkService,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const modelClass = 'Category';

    this.modelClass = modelClass;

    if (!this.link_name_map) {
      this.restLinkService.link_name_map.subscribe(link_name_map => {
        this.link_name_map = link_name_map;
        this.title = link_name_map[modelClass];
      });
    } else {
      this.title = this.link_name_map[modelClass];
    }
    forkJoin([
      this.translate.get('previous'),
      this.translate.get('next'),
      this.http.get('web/rest/config', {
        params: {
          'modelClass': this.modelClass
        },
      })
    ]).subscribe(results => {
      const [previous_text, next_text, config] = results;
      this.pagination.previous_text = previous_text;
      this.pagination.next_text = next_text;
      this.queryFields = config['search_form'];
      this.columns = config['columns'];
      this.formFields = config['form'];
      this.is_sync = config['sync'];
      this.formFields.forEach((item, index) => {
        if (item.key === 'parent_id') {
          for (const i in item.templateOptions.options) {
            if (i) {
              this.treeSelect.push( new NzTreeNode(item.templateOptions.options[ i ]));
            }
          }
        }
        if (item.key === 'languages') {
          for (const i in item.defaultValue) {
            if (i) {
              let langobj;
              langobj = {};
              for (const ii in item.fieldArray.fieldGroup) {
                if (ii) {
                  this.languageFields[item.fieldArray.fieldGroup[ ii ].key] = '';
                  langobj[item.fieldArray.fieldGroup[ ii ].key] = '';
                  langobj['language'] = item.defaultValue[ i ]['language'];
                  this.formInitData['language_' + item.fieldArray.fieldGroup[ ii ].key] = '';
                }
              }
              this.languages.push(langobj);
            }
          }
        } else {
          this.formInitData[item.key] = item.defaultValue || '';
        }
      });
    });

    this.user = JSON.stringify(this.route.snapshot.data['user'], null, 4);

    this.getList();
  }

  getList() {
    this.loading = true;
    this.route.queryParams.subscribe(params => {
      this.query = JSON.parse(JSON.stringify(params));
      if (this.query.page) {
        this.query.page = +this.query.page;
      }
      this.http.post('web/category/tree', this.query, {
        observe: 'response',
      }).subscribe(response => {
        this.loading = false;
        this.data = response.body;
        this.data.forEach(item => {
          this.expandDataCache[ item.id ] = this.convertTreeToList(item);
        });
        this.pagination.total_count = response.headers.get('x-pagination-total-count');
        this.query['per-page'] = response.headers.get('x-pagination-per-page');
      });
    });
  }

  search(page = 1) {
    this.query.page = page;
    this.router.navigate([], {
      queryParams: this.query
    });
  }

  collapse(array, data, $event: boolean): void {
    if ($event === false) {
      if (data.children) {
        data.children.forEach(d => {
          const target = array.find(a => a.id === d.id);
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: object) {
    const stack = [];
    const array = [];
    const hashMap = {};
    stack.push({ ...root, key: root['title'], level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop();
      const key = node.key ? node.key : node.id;
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          let keyname;
          keyname = key + '//' + node.children[ i ].title;
          stack.push({ ...node.children[ i ], key: keyname, level: node.level + 1, expand: false, parent: node });
        }
      }
    }

    return array;
  }

  visitNode(node, hashMap: object, array): void {
    if (!hashMap[ node.id ]) {
      hashMap[ node.id ] = true;
      array.push(node);
    }
  }

  openModal(item, template: TemplateRef<any>, isBig = true) {
    if (item && item.id) {
      forkJoin([
        this.http.get('web/category/get-produce-breakdown', {
          params: {
            'id': item.id,
          },
        }),
        this.http.get('web/category/get-produce-grade', {
          params: {
            'id': item.id,
          },
        })
      ]).subscribe(results => {
        this.produceBreakdownList = results[0]['data'];
        this.produceGradeList = results[1]['data'];
      });

      let data;
      data = {
        'id': item.id
      };
      for (const i in this.formInitData) {
        if (i.indexOf('language') > -1) {} else if (String(item[i]) === 'null') {
          data[i] = '';
        } else {
          data[i] = String(item[i]);
        }
      }
      if (item['languages'].length === 0) {
        data['languages'] = this.languages;
      } else {
        data['languages'] = item['languages'];
        // 是否有语言字段 没有则定义
        for (const i in  data['languages']) {
          if (i) {
            for (const ii in  this.languageFields) {
              if (typeof(data['languages'][i][ii]) === 'undefined') {
                data['languages'][i][ii] = '';
              }
            }
          }
        }
      }
      // 已有制作明细 与 制作等级
      let produce_grades, produce_breakdowns;
      produce_grades = [];
      produce_breakdowns = [];
      if (item['produceGrades']) {
        for (const i in item['produceGrades']) {
          if (i) {
            produce_grades.push(item['produceGrades'][i]['id']);
          }
        }
      }
      if (item['produceBreakdowns']) {
        for (const i in item['produceBreakdowns']) {
          if (i) {
            produce_breakdowns.push(item['produceBreakdowns'][i]['id']);
          }
        }
      }

      data['produce_grades'] = produce_grades;
      data['produce_breakdowns'] = produce_breakdowns;

      this.validateForm = this.fb.group(this.formInitData);
      this.formData = JSON.parse(JSON.stringify(data));
      this.modalRef = this.modalService.show(template);
    } else {
      let data;
      data = this.formInitData;
      data['languages'] = this.languages;
      this.validateForm = this.fb.group(this.formInitData);
      this.formData = JSON.parse(JSON.stringify(data));
      this.modalRef = this.modalService.show(template);
    }
  }

  onChanges(values: any): void {
  }

  save() {
      if (this.formData['id']) {
        this.http.patch('web/category/save', this.formData, {
          params: {
            'id': this.formData['id']
          },
        }).subscribe(() => {
          this.modalRef.hide();
          this.query['random'] = Math.random();
          this.search();
        });
      } else {
        this.http.post('web/category/save', this.formData, {
        }).subscribe(() => {
          this.modalRef.hide();
          this.query['random'] = Math.random();
          this.search();
        });
      }
  }

  sort(e) {
    const list = JSON.parse(JSON.stringify(this.data));
    const compare = function (prop, type) {
      return function (obj1, obj2) {
          const val1 = obj1[prop];
          const val2 = obj2[prop];
          if (type === 'descend') {
            return val1 > val2 ? 1 : -1;
          } else {
            return val1 > val2 ? -1 : 1;
          }
      };
    };
    this.data = [];
    list.sort(compare(e.key, e.value));
    this.data = list;
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
