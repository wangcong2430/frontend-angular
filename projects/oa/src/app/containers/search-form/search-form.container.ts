import { Component, EventEmitter, Input, OnInit, Output,  ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { CacheService } from '../../services/cache.service';
import { filterOption } from '../../utils/utils';

import * as moment from 'moment';

moment.locale('zh-CN');

@Component({
  selector: 'app-container-search-form',
  templateUrl: './search-form.container.html',
  styleUrls: ['./search-form.container.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchFormContainer implements OnInit {
  @Output() submit: EventEmitter<any> = new　EventEmitter();
  // loading
  @Input() loading = false;
  // loading
  @Input() is_disabled = false;
  // 配置项
  @Input() data = [];

  @Input() searchFormData = {}
  // 筛选
  _searchForm: FormGroup;
  @Output() searchChange: EventEmitter<any> = new　EventEmitter();



  isShowCollapse = true;
  isCollapse = true;
  searchChange$ = new BehaviorSubject('');
  searchChangeObj = {};
  asObservableKey = {};
  // oauser
  searchOaChange$ = new BehaviorSubject('');
  isSearchOaSelect = true;
  optionOaSearchs = {};
  optionOaKey = '0';

  // supplier
  searchSupplierChange$ = new BehaviorSubject('');
  isSearchSupplierSelect = true;
  optionSupplierSearchs = {};
  optionSupplierKey = '0';

  defaultOpenValue;

  // 标签属性
  selectOptions = [];

  filterOption = filterOption;

  datePipe = new DatePipe('zh-Hans');

  formVal

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private cache: CacheService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


  ngOnInit() {
    this._searchForm = this.fb.group({});
    this.getConfig();

    // 读取缓存
    this.cache.get(this.cache.getKey('project_id')).subscribe(value => {
      if (value && this._searchForm.get('project_id')) {
        this._searchForm.get('project_id').setValue(value)

      }
    })

    // 设置默认值
    if (this.router.url.indexOf('iomc') > -1 && this._searchForm.get('category_type')) {
      this._searchForm.get('category_type').setValue('1');
    }

    // 搜索
    this._searchForm.valueChanges.pipe(debounceTime(100)).subscribe(item => {
      this.searchFormUpdate();
      this.searchChange.emit(this.formVal);
      this.cd.markForCheck();

    })

    // 搜索用户
    this.searchOaChange$.asObservable().pipe(debounceTime(60), skip(1)).subscribe((value) => {
      this.isSearchOaSelect = true;
      this.cd.markForCheck();
      this.http.get('web/user/search-names', { params: {
        enName: value || '',
      }}).subscribe(data2 => {
        this.optionOaSearchs[(this.optionOaKey ? this.optionOaKey : '0')] = data2['data'];
        this.isSearchOaSelect = false;
        this.cd.markForCheck();
      }, err => {
        this.cd.markForCheck();
      });
    });

    // 搜索供应商
    this.searchSupplierChange$.asObservable().pipe(debounceTime(60), skip(1)).subscribe((value) => {
      this.isSearchOaSelect = true;
      this.cd.markForCheck();
      this.http.get('web/supplier/name-list', { params: {
        name: value || '',
      }}).subscribe(data2 => {
        this.optionSupplierSearchs[(this.optionOaKey ? this.optionOaKey : '0')] = data2['data'];
        this.isSearchSupplierSelect = false;
        this.cd.markForCheck();
      });
    });

    if (this.router.url.indexOf('iomc') > -1 && this._searchForm.get('category_type')) {
      this._searchForm.get('category_type').setValue(1);
    }
    this.cd.markForCheck();
  }

  // 展开更多筛选
  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
    if (this.data) {
      this.data.forEach((item, index) => {
        item['show'] = this.isCollapse ? (index < 5) : true;
      });
    }
    this.cd.markForCheck();
  }

  searchFormUpdate () {
    for (const i in this._searchForm.controls) {
      if (i) {
        this._searchForm.controls[ i ].markAsDirty();
        this._searchForm.controls[ i ].updateValueAndValidity();
      }
    }

    this.formVal = {};
    this.data.map((item, index) => {
      let val;
      if (item.type === 'interval') {
        this.formVal[item.key + '1'] = this._searchForm.value[item.key + '1'] || '';
        this.formVal[item.key + '2'] = this._searchForm.value[item.key + '2'] || '';
      } else  if (item.type === 'date-picker') {
        this.formVal[item.key] = this.datePipe.transform(this._searchForm.value[item.key], 'yyyy-MM-dd');
      } else {
        if (this._searchForm.value[item.key]) {
          if (this._searchForm.value[item.key] instanceof Array) {
            val = this._searchForm.value[item.key].join(',');
          } else {
            val = this._searchForm.value[item.key];
          }
        } else {
          val = '';
        }
        this.formVal[item.key] = val;
      } 

    });
    this.selectOptions.map((item => {
      this.formVal['label_id_' + item.id] = item;
    }));
    this.formVal['label_arr'] = this.selectOptions;
  }

  submitForm(): void {
    this.searchFormUpdate();
    this.submit.emit({code: 0, value: this.formVal});
  }

  // 获取页面配置
  getConfig() {
    if (this.data) {
      this.data.forEach((item, index) => {
        let defaultValue;
        defaultValue = typeof(item['defaultValue']) !== 'undefined' ? item['defaultValue'].toString() : '';
        item['show'] = true;
        if (item.type === 'interval') {
          this._searchForm.addControl(`${item.key}1`, new FormControl(defaultValue));
          this._searchForm.addControl(`${item.key}2`, new FormControl(defaultValue));
        } else {
          this._searchForm.addControl(`${item.key}`, new FormControl(defaultValue));
        }

        if (item.type === 'label-select') {
          this._searchForm.addControl(`${item.key}-obj`, new FormControl({}));
          // 数据初始化
          if ( item.templateOptions.options) {
            item.templateOptions.options.forEach(option => {
              if (option.attr_type === '1') {
                option.options = option['form_name'] ? option['form_name'].split('|').map(item => {
                  return {
                    label: item,
                    minValue: null,
                    maxValue: null
                  };
                }) : [];
              } else if (option.attr_type === '2') {
                option.options = option['form_value'] ? option['form_value'].split('|') : [];
              }
            });
          }
        }

        if (item['subscribe']) {
          this.asObservableKey[item['subscribe']] = true;
          this.searchChange$.asObservable().subscribe((value) => {
            this._searchForm.patchValue({
              project_product_budget_id: null
            });
            item.templateOptions.options = [];
            if (value && value.toString() !== '0' && value.toString() !== '') {
              item['hide'] = false;
              this.http.get(item['subscribe_url'] + value).subscribe(data2 => {
                item.templateOptions.options = data2['data'];
                this.cd.markForCheck();
              });
            }
          });
        }

        if (this.searchFormData[item.key] ) {
          console.log(this.searchFormData[item.key])
          this._searchForm.get(item.key).setValue(this.searchFormData[item.key]);
        }

        // 如果缓存不存在, 则清楚默认数据
        if (item.key == 'project_id') {
          this.cache.get(this.cache.getKey('project_id')).subscribe(projectId => {
            if (!item.templateOptions.options.some(item => item.value == projectId)) {
              this._searchForm.get('project_id').setValue(null)
            }
          })
        }
      });
    }
  }

  // 搜索OA用户
  onOaSearch(value = '', key = '0') {
    this.optionOaKey = key;
    this.searchOaChange$.next(value);
    this.cd.markForCheck();
  }
  // 搜索供应商
  onSupplierSearch(value = '', key = '0') {
    this.optionSupplierKey = key;


    this.searchSupplierChange$.next(value);
    this.cd.markForCheck();
  }

  onSubscribe(value = '', key = '') {
    if (this.asObservableKey[key]) {
      this.searchChange$.next(value);
      this.cd.markForCheck();
    }

    if (key === 'project_id') {
      if (value) {
        this.cache.set(this.cache.getKey('project_id'), value).subscribe(item => {
          // console.log(item)
        })
      } else {
        this.cache.remove(this.cache.getKey('project_id')).subscribe(item => {
          // console.log(item)
        })
      }
    }
  }

  modelChange (value, data) {
    // 赋值是对象, 对象存在引用
    this.selectOptions = value.filter(id => id).map(id => {
      if (this.selectOptions.find(item => item.id === id)) {
        return this.selectOptions.find(item => item.id === id);
      } else {
        return data.templateOptions.options.find(item => item.id === id);
      }
    });
    this.cd.markForCheck();
  }

  valueChange () {
    // console.log('valueChange');
  }

  filter = (i, p) => {
    return !!p && p.nzLabel.trim().toLowerCase().indexOf(i.trim().toLowerCase()) !== -1;
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
