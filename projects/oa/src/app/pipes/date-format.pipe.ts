import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  transform(date, type): any {
    if (date && date.length === 19 && type === 'yyyy/MM/dd') {
      return date.slice(0, 10);
    } else if (date && date.length === 19 && type === 'MM/dd') {
      return date.slice(5, 10);
    } else if (date && date.length === 19 && type === 'HH:mm:ss') {
      return date.slice(11, 19);
    }
  }
}
