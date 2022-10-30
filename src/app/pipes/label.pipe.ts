import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { forEach } from '@angular/router/src/utils/collection';

@Pipe({
    name: 'label'
})
export class LabelPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer
  ) {}
  transform(data): any {
    let html = data.value;
    if (data.attr_type === '1' && data.form_num === 1 && data.value) {
      html = data.value + data.form_unit;
    } else if (data.attr_type === '1' && data.form_num > 1 && data.option) {
      data.option.map(item => {
       html += `<span>${item.value}</span>
                  <span *ngIf="index < (item.options.length - 1)">${data.form_separator ? data.form_separator : ' '}</span>`;
      });
    } else if (data.attr_type === '2' && data.value) {
      html = data.value + data.form_unit;
    }
    return html;
  }
}
