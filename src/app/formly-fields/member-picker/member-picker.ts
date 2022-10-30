// import {Component} from '@angular/core';
// import {FieldType} from '@ngx-formly/core';

// @Component({
//     selector: 'formly-member-picker',
//     templateUrl: './member-picker.html',
//     styleUrls: ['./member-picker.css']
// })
// export class FormlyFieldMemberPicker extends FieldType{
//     maxMemberCount;
//     ngOnInit(){
//         this.maxMemberCount = this.field.templateOptions && this.field.templateOptions.maxMemberCount
//     }

//     get value() {
//         return this.model[this.key] || '';
//     }

//     valueChange(value) {
//         this.model[this.key] = value;
//         this.updateForm();
//     }

//     updateForm() {
//         if (this.form.get(this.key)) {
//             this.form.get(this.key).setValue(this.model[this.key]);
//         }
//     }

//     get text() {
//         return this.model[this.key] ? this.model[this.key].replace(/,|;/g, '，') : '';
//     }

// }
