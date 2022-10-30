import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'format'
})
export class FormatPipe implements PipeTransform {
  constructor(
    private sanitizer: DomSanitizer
  ) {}

  transform(str, type): any {
    if ( type === 'category_list' && str && str instanceof String && str.indexOf(';') !== -1 ){
      str = str.split(';').map(item => `<span style="white-space: nowrap;">${item}</span><br/>`).join('');
      return this.sanitizer.bypassSecurityTrustHtml(str);
    }

    return str || str === 0 ? str : 'NA';
  }
}
