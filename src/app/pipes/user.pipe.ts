import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'user'
})
export class UserPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer
  ) {}

    transform(str): any {
      if (!str)  {
        return 'NA';
      }

      let s = str.split(';').filter(user => user && user.split('(')[0]).map(user => {
        const name = user.split('(');
        let url;
        if (isNaN(name[0])) {
         url = `WXWork://message?username=${name[0]}`;
        } else {
         url = `http://wpa.qq.com/msgrd?v=3&uin=${name[0]}&site=qq&menu=yes`;
        }
        return `<a target="_blank" class="mr-2" style="white-space: nowrap;" href="${url}">${user};</a>`;
      }).join('');

      s = `<div style="max-width: 240px; display: inline-block;">${s}</div>`;
      return this.sanitizer.bypassSecurityTrustHtml(s);
    }
}
