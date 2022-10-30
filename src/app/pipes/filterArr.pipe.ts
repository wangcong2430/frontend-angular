import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'filterArr'
})
export class FilterArrPipe implements PipeTransform {
  transform(value, arr: Array<object>): any {
    if (!arr || !arr.length) {
      return value;
    }
    return (value || []).filter((item) => {
      let flag = true;
      arr.forEach((value) => {
        if (item[value['key']] !== value['value']) {
            flag = false;
        }
      });
      return flag;
    });
  }
}
