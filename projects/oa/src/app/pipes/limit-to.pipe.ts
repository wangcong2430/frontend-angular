import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'limitTo'
})
export class LimitToPipe implements PipeTransform {
  transform(value: any, num: number): any {
    if (!num) {
      return value;
    }
    if (typeof value === 'string') {
      return value.substr(0, num);
    } else if (typeof value === 'object' && value.length) {
      return value.splice(0, num);
    } else {
      return value;
    }
  }
}
