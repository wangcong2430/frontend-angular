import { Component, ChangeDetectorRef,  ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-attribute-input',
    templateUrl: './attribute-input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeInputComponent extends FieldType implements OnInit {
  value1 = '';
  value2 = '';
  value = '';
  lastValue = null;
  hyphens = '_';
  destroy$ = null;

  constructor(
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    this.destroy$ = new Subject<any>();
  }

  change () {
    this.value = this.value1 + '-' + this.value2;
    if (this.value !== this.lastValue) {
      this.formControl.setValue(this.value);
      this.lastValue = this.value;
    }
    this.cd.markForCheck();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
