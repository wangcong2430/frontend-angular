import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'autoDecode'
})
export class AutoDecodePipe implements PipeTransform {
  transform(value: any): any {
    return decodeURI(value);
  }
}
