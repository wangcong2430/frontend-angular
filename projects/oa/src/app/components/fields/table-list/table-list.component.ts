import { Component, OnInit, OnDestroy, ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
    ::ng-deep .ant-table-thead > tr > th, .ant-table-tbody > tr > td{
      padding: 8px 12px;
    }
    `
  ]
})
export class TableListComponent extends FieldType implements OnInit, OnDestroy {

  constructor(
    private cd: ChangeDetectorRef,
    ) {
    super();
  }

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData: any[] = [];
  listOfAllData: any[] = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  onDestroy$ = new Subject<void>();
  checked = [];

  currentPageDataChange($event: Array<{ value: number; name: string; }>): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayData.length > 0 ?
      this.listOfDisplayData.every(item => this.mapOfCheckedId[item.value]) : false;
    this.isIndeterminate = this.listOfDisplayData.some(item => this.mapOfCheckedId[item.value]) && !this.isAllDisplayDataChecked;
    const checked = this.listOfDisplayData.filter(item => this.mapOfCheckedId[item.value]);

    this.formControl.setValue(checked);
    this.cd.markForCheck();
  }

  checkAll(value: boolean): void {
    this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.value] = value));
    this.refreshStatus();
  }

  ngOnInit(): void {
    this.formControl.valueChanges.pipe(takeUntil(this.onDestroy$), debounceTime(100)).subscribe(res => {
      if (Array.isArray(this.to['options'])) {
        this.listOfAllData = this.to['options'];
      }
      this.cd.markForCheck();
    });
  }

  ngOnDestroy () {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

}
