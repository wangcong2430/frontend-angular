import { Component, ChangeDetectorRef,  ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { FieldArrayType, FormlyFormBuilder} from '@ngx-formly/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-attribute-edit',
  templateUrl: './attribute-edit.component.html',
  styleUrls: ['attribute-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AttributeEditComponent extends FieldArrayType implements OnInit, OnDestroy {
  constructor(
    builder: FormlyFormBuilder,
    private cd: ChangeDetectorRef,
  ) {
    super(builder);
  }

  onDestroy$ = new Subject<void>();

  data = null;

  ngOnInit () {
    if (this.formControl.value) {
      this.data = this.formControl.value;
      this.cd.markForCheck();
    }

    this.formControl.valueChanges.subscribe(data => {
      if (data) {
        this.data = data;
        this.cd.markForCheck();
      }
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; 
  }

  modelChange (data) {
    if (data) {
      this.formControl.patchValue(data);
    }
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
}
