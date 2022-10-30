import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'some'
})
export class SomePipe implements PipeTransform {
  transform(arr: Array<Object>, obj: string ): any {
    if (arr && arr.length > 0 && arr instanceof Array && obj) {
      return arr.some(item => item === obj);
    } else {
      return false;
    }
  }
}
