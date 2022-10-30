import { Component, OnInit, OnDestroy,ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { exit } from 'process';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime , distinctUntilChanged, filter } from 'rxjs/operators';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-inquiry-tax-rate-component',
  templateUrl: './inquiry-tax-rate.html',
  styles: [`
    :host ::ng-deep .ant-checkbox-wrapper + .ant-checkbox-wrapper {
      margin-left: 0px;
    }

    :host ::ng-deep .ant-checkbox-wrapper {
      min-width: 162px;
    }
  `]
})

export class InquiryTaxRateComponent extends FieldType implements OnInit, OnDestroy  {
  searchChange$ = new BehaviorSubject('');
  constructor(
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  tax_list_options = [];
  taxValueChange () {
    this.formControl.setValue(this.to['tax_rate']);
    this.cd.markForCheck();
  }
  ngOnInit () {
    //如果model的值，但列表没值，则加入列表
    setTimeout(() => {
      let has_tax_rate = this.to['tax_list_options'].some(item=>{
        return item['value'] == this.to['tax_rate'];
      });
      if(!has_tax_rate){
        const arr = [{
          label: this.to['tax_rate'],
          value: this.to['tax_rate'],
        }];
        this.to['tax_list_options'] = arr.concat(this.to['tax_list_options']);
        this.taxValueChange();
      }
    }, 100);
    
    this.searchChange$
    .asObservable()
    .pipe(distinctUntilChanged())
    .pipe(filter(item => !!item))
    .pipe(debounceTime(200)).subscribe(value => {
      this.to['tax_list_options'] = this.to['tax_list_options'].filter(item=>{return item['showtype'] != 'temp'})
      if (value && this.to['tax_list_options']) {
        const arr = [{
          label: value,
          value: value,
          showtype:'temp'
        }];
        this.to['tax_list_options'] = arr.concat(this.to['tax_list_options']);
        this.to['tax_rate'] = value;
        this.taxValueChange();
      }
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
