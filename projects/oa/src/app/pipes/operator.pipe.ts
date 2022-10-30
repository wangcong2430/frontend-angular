import { Pipe, PipeTransform } from '@angular/core';
// operator format, e.g. ['like', 'name', 'test']

@Pipe({
    name: 'operator'
})
export class OperatorPipe implements PipeTransform {
  transform(key, data: Array<Object>, conf: string ): any {

    if (data && conf) {
      let className = conf['class'] ? conf['class'] : '' ;
      if (conf['operators'] && conf['operators'].length > 0) {
        conf['operators'].map(item => {

          if (item && item[0] === '>' && data[item[1]] && data[item[2]]) {
            className += data[item[1]] > data[item[2]] ? item[3] : '';
          } else

          if (item && item[0] === '<' && data[item[1]] && data[item[2]]) {
            className += data[item[1]] < data[item[2]] ? item[3] : '';
          } else

          if (item && item[0] === '==' && data[item[1]] && data[item[2]]) {
            className += data[item[1]] === data[2] ? item[3] : '';
          } else

          if (item && item[0] === '!=' && data[item[1]] && data[item[2]]) {
            className += data[item[1]] !== data[2] ? item[3] : '';
          }
        });
      }

      return className;
    } else {
      return '';
    }
  }
}
