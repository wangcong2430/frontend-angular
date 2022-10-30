import {Component} from '@angular/core';
import {FieldArrayType, FormlyFormBuilder} from '@ngx-formly/core';

@Component({
    selector: 'formly-repeat-tabs-section',
    template: `
        <nz-tabset>
            <nz-tab [nzTitle]="model[i][field.fieldArray.templateOptions['tabNameKey']]"
                    *ngFor="let sub_field of field.fieldGroup; let i = index;trackBy: trackByFn"
                    [ngClass]="field.fieldArray.templateOptions['filedGroupClassName']">
                <formly-group
                        [ngClass]="field.fieldArray.templateOptions['filedGroupItemClassName']"
                        [model]="model[i]"
                        [field]="sub_field"
                        [options]="options"
                        [form]="formControl">
                </formly-group>
            </nz-tab>
        </nz-tabset>
    `,
})
export class RepeatTabsTypeComponent extends FieldArrayType {
    constructor(builder: FormlyFormBuilder) {
        super(builder);
    }

    add() {
        super.add();
    }

    trackByFn(index, item) {
        return item && item.id ? item.id : index; // or item.id
    }
}
