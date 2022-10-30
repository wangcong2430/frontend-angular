import { Component } from '@angular/core';
import { Field } from '@ngx-formly/core';

@Component({
    selector: 'formly-field-pre',
    template: `
    <pre class="form-control-static">{{model[key]}}</pre>
    `,
})
export class FormlyFieldPre extends Field {
}
