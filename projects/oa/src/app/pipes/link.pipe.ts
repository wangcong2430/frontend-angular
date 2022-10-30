import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'link'
})
export class LinkPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer
  ) {}
    transform(url): any {
      if (!url)  {
        return window.location.origin;
      }
      return window.location.origin + url;
    }
}
