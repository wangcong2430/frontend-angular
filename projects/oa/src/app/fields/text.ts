import { Component } from '@angular/core';
import { Field } from '@ngx-formly/core';

@Component({
    selector: 'formly-field-text',
    template: `
    <p class="form-control-static">{{model[key]}}</p>
    `,
})
export class FormlyFieldText extends Field {
}
