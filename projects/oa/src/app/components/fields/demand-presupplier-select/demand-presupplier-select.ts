import { Component, OnInit, OnDestroy,ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { exit } from 'process';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime , distinctUntilChanged, filter } from 'rxjs/operators';
import { filterOption } from '../../../utils/utils';


@Component({
  selector: 'app-demand-presupplier-select-component',
  templateUrl: './demand-presupplier-select.html',
  styles: [`
    :host ::ng-deep .ant-checkbox-wrapper + .ant-checkbox-wrapper {
      margin-left: 0px;
    }

    :host ::ng-deep .ant-checkbox-wrapper {
      min-width: 162px;
    }
  `]
})

export class DemandPresupplierSelectComponent extends FieldType implements OnInit, OnDestroy  {
  searchChange$ = new BehaviorSubject('');
  constructor(
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  pre_supplier_options_filters = [];
  pre_supplier_options = [];
  supplier_id = null;
  preSupplierValueChange () {
    this.formControl.setValue(this.supplier_id);
    this.cd.markForCheck();
  }

  isBanOptions(value){
    let ban_word = ['有','限','公','司','有限','限公','公司','有限公','限公司','有限公司',''];
    value = value.trim()
    if(ban_word.indexOf(value) === -1){
      return false
    }
    return true
  }

  ngOnInit () {
    setTimeout(() => {
      this.pre_supplier_options = this.to['pre_supplier_options']
    }, 100);
    this.searchChange$
      .asObservable()
      .pipe(distinctUntilChanged())
      .subscribe(value => {
        if(this.isBanOptions(value)){
          this.pre_supplier_options_filters = [];
        }else{
          this.pre_supplier_options_filters = this.to['pre_supplier_options']
        }
        this.cd.markForCheck();
      });
  }

  search (value) {
    this.searchChange$.next(value);
  }
  
  
  ngOnDestroy () {
    this.searchChange$.complete();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
