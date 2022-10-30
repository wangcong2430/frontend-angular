import { Component, OnInit, OnDestroy, ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime , distinctUntilChanged, filter } from 'rxjs/operators';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-inquiry-exchange-rate-component',
  templateUrl: './inquiry-exchange-rate.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .ant-checkbox-wrapper + .ant-checkbox-wrapper {
      margin-left: 0px;
    }

    :host ::ng-deep .ant-checkbox-wrapper {
      min-width: 162px;
    }
  `]
})

export class InquiryExchangeRateComponent extends FieldType implements OnInit, OnDestroy  {
  searchChange$ = new BehaviorSubject('');
  constructor(
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  tax_type = null;
  tax_value = null;
  tax_list_options = [];
  tax_type_options = [];

  contract_tax_type = null;

  filterOption = filterOption

  modelChange () {
    this.tax_value = null;
    this.formControl.setValue({
      tax_value: null,
      tax_type: this.tax_type
    });
    this.tax_list_options = this.to['tax_list_options'];
    this.cd.markForCheck();
  }

  taxValueChange () {
    this.formControl.setValue({
      tax_value: this.tax_value,
      tax_type: this.tax_type
    });
    this.cd.markForCheck();

  }

  ngOnInit () {
    this.searchChange$
    .asObservable()
    .pipe(distinctUntilChanged())
    .pipe(filter(item => !!item))
    .pipe(debounceTime(300)).subscribe(value => {
      if (value && this.to['tax_list_options']) {
        const arr = [{
          label: value,
          value: value
        }];
        this.tax_list_options =  arr.concat(this.to['tax_list_options'])
        this.tax_value = value;
        this.taxValueChange();
      }
    })
    this.formControl.valueChanges
      .pipe(distinctUntilChanged())
      .pipe(filter(item => !!item))
      .pipe(debounceTime(300)).subscribe(value => {
        this.tax_type = value['tax_type'];
        this.tax_value = value['tax_value'];
        if (this.tax_list_options.length == 0) {
          this.tax_list_options = this.to['tax_list_options'];
        }
        this.cd.markForCheck();
      });
    this.cd.markForCheck();

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
