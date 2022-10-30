import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'orderBy'
})
@Injectable()
export class OrderByPipe implements PipeTransform {
  transform(value: Array<any>, key: string): Array<any> {
    if (!key) {
      return value;
    }
    let order = 'acs';
    if (key.indexOf('-') === 0) {
      order = 'desc';
      key = key.substring(1);
    }
    value.sort(function (p1, p2) {
      if (p1[key] && p2[key]) {
        if (order === 'desc') {
          return p2[key] - p1[key];
        } else if (order === 'acs') {
          return p1[key] - p2[key];
        }
      } else {
          return 0;
      }
    });
    return value;
  }
}
