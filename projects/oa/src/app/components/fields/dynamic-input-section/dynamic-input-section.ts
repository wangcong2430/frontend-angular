import { Component, DoCheck, ChangeDetectionStrategy} from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';

@Component({
  selector: 'app-dynamic-input-section',
  templateUrl: './dynamic-input-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DynamicInputComponent extends FieldArrayType {
  constructor(builder: FormlyFormBuilder) {
    super(builder);
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }
}
