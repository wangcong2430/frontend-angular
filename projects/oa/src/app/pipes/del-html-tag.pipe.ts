import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'delhtmltag' })
export class DelHtmlTagPipe implements PipeTransform {
  transform(html) {
    return html.replace(/<[^>]+>/g, '');
  }
}
