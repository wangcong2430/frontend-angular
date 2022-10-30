import { Component, OnInit, DoCheck, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy,} from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';
import { BehaviorSubject, Subject, observable, Observable, forkJoin } from 'rxjs';
import { debounceTime, skip, takeUntil, filter, distinctUntilChanged, first } from 'rxjs/operators';

@Component({
  selector: 'app-create-demand-tabs',
  templateUrl: './create-demand-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CreateDemandTabsComponent extends FieldArrayType implements OnInit, DoCheck, OnDestroy  {

  constructor(
    builder: FormlyFormBuilder,
    private cd: ChangeDetectorRef,
  ) {
    // store the initial value to compare with

    super(builder);
  }

  onDestroy$ = new Subject<void>();

  classOptions;

  selectedValue = [];
  oldSelectedValue = [];

  // 可用费用
  product_cost = [];

  // 物价数量
  product_number = [];
  // 总费用
  total_cost = 0;
  total_num = 0;

  diffLastModel = '';

  selectChange$ = new BehaviorSubject([]);

  radioOptions = [];

  user_role_level;

  ngOnInit () {

    // 费用类型
    //console.log(this.form)
    this.user_role_level = this.formControl.root.get('user_role_level').value;
    this.formControl.root.get('user_role_level').valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(id => {
      this.user_role_level = id;
      this.cd.markForCheck();
    });

    // 设置选中的值
    this.selectedValue = this.model.map(item => item.id);
    this.oldSelectedValue = this.model.map(item => item.id);

    if (this.to['options'] instanceof Observable) {
      this.to['options'].pipe(takeUntil(this.onDestroy$)).subscribe(options => {
        const value = options.filter(item => item.checked && !item.disable).map(item => item.value);
        this.selectedValue = value;
        this.oldSelectedValue = value;
        this.radioOptions = options;
        //console.log(this.radioOptions)
      });
    }

    this.form.valueChanges.pipe(takeUntil(this.onDestroy$)).pipe(debounceTime(100), skip(1)).subscribe(() => {
      this.cd.markForCheck();
    })

    this.selectChange$.pipe(takeUntil(this.onDestroy$)).pipe(debounceTime(100), skip(1)).subscribe(arr => {
      // 选中的
      arr = arr.filter(item => item.checked === true).map(item => item.value);
      // 新增的分类
      if (arr.length > this.oldSelectedValue.length) {
        const addList = arr.filter(x => !this.oldSelectedValue.includes(x));
        if (addList[0]) {
          const index = arr.findIndex((val) => val === addList[0]);
          const option = this.radioOptions.find(res => res.value === addList[0]);
          super.add(index, {
            thing_list: [],
            id: option.value,
            title: option.label,
          });
        }
      } else if (arr.length < this.oldSelectedValue.length) {
        const removeList = this.oldSelectedValue.filter(x => !arr.includes(x));
        if (removeList[0]) {
          const index = this.oldSelectedValue.findIndex((val) => val === removeList[0]);
          super.remove(index);
        }
      }

      this.oldSelectedValue = arr;
      this.cd.markForCheck();
    });

    this.formControl.valueChanges
        .pipe(takeUntil(this.onDestroy$))
        .pipe(filter(item => item))
        .pipe(distinctUntilChanged())
        .pipe(debounceTime(50))
        .subscribe(item => {
          const model = item;
          if (model && model[0] && model[0].thing_list) {
            this.product_cost = model.map(item => {
              const costArr = item.thing_list.map(item => {
                if(!this.isNumeric(item.expected_expenditure)){
                  item.expected_expenditure = 0;
                }
                return item.expected_expenditure?item.expected_expenditure:0
              });
              const cost = costArr.length ? costArr.reduce((total, num) => Number(total) + Number(num)) : 0;
              return {
                cost: cost,
                title: item.title,
              };
            });

            this.product_number = model.map(item => {
              const numArr = item.thing_list.map(item => {
                if (item.produce_breakdowns && item.produce_breakdowns.length > 0) {
                  return 1;
                } else if (item.pre_workload) {
                  return item.pre_workload;
                } else {
                  return 0;
                }
              });
              const num = numArr.length ? numArr.reduce((total, num) => Number(total) + Number(num)) : 0;
              return {
                num: num,
                title: item.title,
              };
            });

            this.total_cost = 0;
            for (let i = 0; i < this.product_cost.length; i++) {
              this.total_cost += Number(this.product_cost[i]['cost']);
            }

            this.total_num = 0;
            for (let i = 0; i < this.product_number.length; i++) {
              this.total_num +=  Number(this.product_number[i]['num']);
            }

            if (this.formControl.root.get('budget_price')) {
              this.formControl.root.get('budget_price').setValue(this.total_cost);
            }
          }
          this.cd.markForCheck();
      });
    this.cd.markForCheck();
  }
  isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  OnChanges (arr,length) {
    //console.log(arr)
    this.selectChange$.next(arr);
    this.cd.markForCheck();

  }


  ngOnDestroy() {
    // 组件销毁时, 删除循环的列表
    if (this.field.fieldGroup && this.field.fieldGroup.length > 0) {
      this.field.fieldGroup.map((item, index) => {
        super.remove(index);
      });
    }
    this.onDestroy$.next();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
