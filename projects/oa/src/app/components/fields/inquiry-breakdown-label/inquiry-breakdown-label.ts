import { Component, OnInit, OnDestroy,ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { exit } from 'process';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime , distinctUntilChanged, filter } from 'rxjs/operators';
import { filterOption } from '../../../utils/utils';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-inquiry-breakdown-label-component',
  templateUrl: './inquiry-breakdown-label.html',
})

export class InquiryBreakdownLabelComponent extends FieldType implements OnInit, OnDestroy  {
  constructor(
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
  ) {
    super();
  }
  pre_workload = '';
  data:any;
  columnkey:string;

  ngOnInit () {
    this.pre_workload = this.model.pre_workload;
    this.data = this.model;
    this.columnkey = 'pre_produce_breakdown';
    console.log(this);
  }

  // 显示明细
  showPriceDetail(item, key, event, type) {
    event.stopPropagation();
    this.modalService.open('price-detail', {
      item: item,
      key: key,
      type: type
    });
    this.cd.markForCheck();
  }
  // 是否显示明细按钮，循环判断里面的value是否都为null
  isShowDetail (data, key) {
    if (!data[key] || data[key] === '') {
      return false;
    }
    if (!Array.isArray(data[key])) {
      return Array.isArray(JSON.parse(data[key])) && JSON.parse(data[key]).some(item => item.value||item.pre_value);
    } else {
      return data[key].some(item => item.value||item.pre_value);
    }
  }

  ngOnDestroy () {
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

}
