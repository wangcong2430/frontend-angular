import { Component, DoCheck, OnDestroy, ChangeDetectionStrategy, OnInit, ChangeDetectorRef} from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-description-repeat',
  templateUrl: './description-repeat.html',
  styleUrls: ['./description-repeat.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DescriptionRepeatComponent extends FieldArrayType implements OnInit, DoCheck, OnDestroy  {

  constructor(
    builder: FormlyFormBuilder,
    private cd: ChangeDetectorRef
  ) {
    super(builder);
  }

  onDestroy$ = null;


  ngOnInit () {
    this.onDestroy$ = new Subject<void>();
    this.formControl.valueChanges.pipe(takeUntil(this.onDestroy$)).pipe(debounceTime(100)).subscribe(item => {
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    // 组件销毁时, 删除循环的列表
    this.field.fieldGroup.map((item, index) => {
      super.remove(index);
    });

    if (this.onDestroy$) {
      this.onDestroy$.next();
      this.onDestroy$.complete();
    }
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
