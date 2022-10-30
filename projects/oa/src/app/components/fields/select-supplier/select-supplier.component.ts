import { Component, OnInit, OnDestroy, ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions, FieldType } from '@ngx-formly/core';
import { merge, of,  BehaviorSubject, Observable, Subject  } from 'rxjs';
import { debounceTime, map, switchMap , takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-select-supplier',
  templateUrl: './select-supplier.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SelectSupplierComponent extends FieldType implements OnInit, OnDestroy {
  isVisible = false;
  onDestroy$ = null;
  optionList = [];
  checkOptionList = [];
  selectedUser = [];
  isLoading = false;
  searchChange$ = new BehaviorSubject('');
  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }
  errStr = '';
  tableForm = new FormGroup({});
  tableModel: any = {};
  tableOptions: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };
  tableFields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'ant-row',
      fieldGroup: [
        {
          key: 'name',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '供应商名字',
            nzLayout: 'fixedwidth',
            nzRequired : true,
          },
        },
        {
          key: 'category_id',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '品类',
            nzMode: 'multiple',
            nzValue: 'value',
            nzLayout: 'fixedwidth',
            options: [],
            nzRequired : true,
          },
        },
        {
          key: 'is_valid',
          type: 'nz-radio',
          className: 'ant-col-24',
          defaultValue: '1',
          templateOptions: {
            label: '有效供应商',
            nzLayout: 'fixedwidth',
            nzRequired : true,
            options: [
              {
                value: '1',
                label: '是'
              },
              {
                value: '2',
                label: '否'
              },
              {
                value: '3',
                label: '所有'
              }
            ]
          },
        },
        {
          key: 'short_list',
          type: 'nz-radio',
          className: 'ant-col-24',
          defaultValue: '1',
          templateOptions: {
            label: '短名单',
            nzLayout: 'fixedwidth',
            nzRequired : true,
            options: [
              {
                value: '1',
                label: '是'
              },
              {
                value: '2',
                label: '否'
              },
              {
                value: '3',
                label: '所有'
              }
            ]
          },
        },
        {
          key: 'list',
          type: 'nz-table-list',
          className: 'ant-col-24',
          templateOptions: {
            label: '',
            options: []
          },
          lifecycle: {
            onInit: (from, field) => {
              this.onDestroy$ = new Subject<void>();
              merge(
                from.get('name').valueChanges,
                from.get('is_valid').valueChanges,
                from.get('short_list').valueChanges,
                from.get('category_id').valueChanges
              ).pipe(takeUntil(this.onDestroy$), debounceTime(100)).subscribe(item => {
                // 是否默认选中
                const params = {
                  'name': field.model.name ? field.model.name : null,
                  'category_id': field.model.category_id ? field.model.category_id : [],
                  'is_valid': field.model.is_valid ? field.model.is_valid : null,
                  'short_list': field.model.short_list ? field.model.short_list : null
                };
                this.http.post('web/supplier/search-supplier', params).subscribe(result => {
                  if (result['code'] === 0 ) {
                    field.templateOptions.options = result['data'];
                    from.get('list').setValue(from.get('list').value);
                  }
                });
              });
            },
            onDestroy: (field) => {
              this.onDestroy$.next();
              // this.onDestroy$.complete();
            }
          },
        }
      ]
    }
  ];

  // 供应商下拉列表
  supplierList = [];

  onSearch(value: string): void {
    this.isLoading = true;
    this.searchChange$.next(value);
    this.cd.markForCheck();
  }

  // 选择供应商
  ngOnInit() {
    const getRandomNameList = (name: string) => this.http.post('web/supplier/search-supplier', {
      name: name
    }).pipe(
      map((result: any) => {
        return result['data'];
      })
    );

    this.formControl.valueChanges.subscribe(item => {
      this.cd.markForCheck()
    })

    const optionList$: Observable<string[]> = this.searchChange$
      .asObservable()
      .pipe(debounceTime(500))
      .pipe(switchMap(getRandomNameList));

    optionList$.subscribe(data => {
      console.log(data)
      this.supplierList = data
      this.optionList = data.map(item => {
        return {
          label: item['label'],
          value: item['label'] + ';'
        }
      });
      this.isLoading = false;
      this.cd.markForCheck();
    });

    this.formControl.valueChanges.subscribe(item => {
      if (!item) {
        this.errStr = ''
      }
    })

    this.http.get('web/bulletin/get-all-category').subscribe(result => {
      if (result['all_category'].length > 0) {
        this.tableFields[0].fieldGroup.find(item => item.key === 'category_id').templateOptions.options =  result['all_category'];
      }
      this.cd.markForCheck();
    });

    this.cd.markForCheck();
  }

  onInput(value: string): void { 
    
    value = value ? value : ''
    // 获取当前输入的值
    let arr = value.split(';').map(value => value.trim())

    // 搜索的值
    let searchValue = arr.slice(-1).join(';')

    // 选中的值
    let checkvalue = arr.slice(0, -1).filter(i => i).join(';')

    if (checkvalue) {
      checkvalue += ';'
    }

    // 下拉
    this.optionList = this.supplierList.filter(option => option.label.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) 

    if (this.optionList.length) {
      this.optionList = this.optionList.map(option => {
        return {
          label: option.label,
          value: checkvalue.indexOf(option.label) > -1 ? checkvalue : checkvalue + option.label + ';'
        }
      })
    } else {
      this.optionList = this.supplierList.map(option => {
        return {
          label: option.label,
          value: checkvalue.indexOf(option.label) > -1 ? checkvalue : checkvalue + option.label + ';'
        }
      })
    }
  }

  selectSupplier () {
    this.isVisible = true;
  }

  // 去重
  unique(arr) {
    return arr.filter(function(item, index, arr) {
      return arr.indexOf(item, 0) === index;
    });
  }

  // 取差
  diff(arr1, arr2) {
    return arr1.filter(item => {
      return arr2.indexOf(item) == -1;
    });
  }

  // 取交集
  intersection (arr1, arr2) {
    return arr1.filter(item => {
      return arr2.indexOf(item) > -1;
    });
  }


  handleCancel () {
    this.isVisible = false;
  }

  handleOk () {
    this.isVisible = false;
    this.selectedUser = this.checkOptionList;
    this.model[this.key] += ';' + this.selectedUser.map(item => item.label).join(';') + ';';

    let value = this.model[this.key] + ';' + this.selectedUser.map(item => item.label).join(';') + ';';
    this.model[this.key] = this.unique(value.split(';').filter(i => i))

    this.formControl.setValue(this.model[this.key]);
  }

  modelChange ($event) {
    if (Array.isArray($event.list) && $event.list.length > 0) {
      if (Array.isArray(this.model[this.key])) {
        const list = $event.list.filter(item => !(this.model[this.key].some(i => i.value === item.value)));
        this.checkOptionList = [...this.model[this.key], ...list];
      } else {
        this.checkOptionList = [...$event.list];
      }
    }
  }

  blur () {
    // 去重
    if (this.model[this.key]) {
      const arr  = this.unique(this.model[this.key].split(';')).filter(str => str)
 
      const errArr = this.diff(arr, this.supplierList.map(item => item.label)).filter(str => str)
  
      const iset = this.intersection(arr, this.supplierList.map(item => item.label)).filter(str => str)
      
      this.errStr = `填写了${arr.length}家供应商，选中了${iset.length}家供应商${ errArr.length ? ',未选中的供应商为：' + errArr.join(';') : ''}`
      
      if (iset.length) {
        this.model[this.key] = iset.join(';') + ';';
      } else {
        this.model[this.key] = ''
      }

      this.formControl.setValue(this.model[this.key]);
    }
  }

  focus () {
    console.log('focus')
    this.onInput(this.model[this.key])
  }

  onModelChange ($event) {
    this.formControl.setValue(this.model[this.key]);
  }

  compareFn = (o1: any, o2: any) => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

  ngOnDestroy() {
    this.searchChange$.complete();
  }

}
