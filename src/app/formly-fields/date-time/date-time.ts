// import {Component} from '@angular/core';
// import {FieldType} from '@ngx-formly/core';

// @Component({
//     selector: 'formly-field-date-time',
//     template: `
//         <div>
//             <input class="form-control" [class.is-invalid]="showError"
//                    (valueChange)="valueChange($event)"
//                    (input)="input($event)"
//                    app-date-range
//                    [dates]="model[key]"
//                    [options]="to.data">
//             <input type="hidden"
//                    [name]="key"
//                    [id]="id"
//                    [value]="model[key]"
//                    [formControl]="formControl"
//                    [formlyAttributes]="field"
//             >
//         </div>
//   `,
// })
// export class FormlyFieldDateTime extends FieldType {
//     ngOnInit() {
//         if (!(this.to.data instanceof Object)) {
//             this.to.data = {};
//         }
//         this.to.data = Object.assign({}, {
//             singleDatePicker: true
//         }, this.to.data);
//     }

//     valueChange(date) {
//         this.model[this.key] = date;
//         if (this.form.get(this.key)) {
//             this.form.get(this.key).setValue(this.model[this.key]);
//         }
//     }

//     input(e) {
//         this.valueChange(e.target.value);
//     }
// }