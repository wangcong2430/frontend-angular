import { Component, ChangeDetectorRef, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-field-template',
  template: `
    <a style="margin-left:8px;font-size:12px;" [style.display]="to['display'] || 'block'" class="text-primary" (click)="toggleCollapse()">
      {{isCollapse ? '展开' : '收起'}}
      <i nz-icon [type]="isCollapse?'down':'up'"></i>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyFieldCollapseComponent extends FieldType  implements OnDestroy, OnInit {
  // @ViewChild

  isCollapse: Boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit () {
    if (this.field.formControl.value) {
      this.isCollapse = this.field.formControl.value;
    }

    this.formControl.valueChanges.subscribe(value => {
      this.isCollapse = value;
    });
    this.cd.markForCheck();
  }

  toggleCollapse () {
    this.isCollapse = !this.isCollapse;
    this.field.formControl.setValue(this.isCollapse);
    this.cd.markForCheck();
  }

  ngOnDestroy() {}
}
