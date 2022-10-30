import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'math'
})
export class MathPipe implements PipeTransform {

  transform(value: any, method: any): any {
    if (!Array.isArray(value)) {
      return false;
    }

    if (value.length === 0) {
      return undefined;
    }

    switch (method) {
      case 'min':
        return Math.min(...value);
      case 'max':
        return Math.max(...value);
    }

    if (value instanceof Array 
      && value.length === 2 
      && Number(value[0]) != NaN
      && Number(value[0]) != NaN
    ) {
      switch (method) {
        case '>':
          return Number(value[0]) > Number(value[1]);
        case '>=':
          return Number(value[0]) >= Number(value[1]);
        case '<':
          return Number(value[0]) < Number(value[1]);
        case '<=':
          return Number(value[0]) <= Number(value[1]);
        case '==':
          return Number(value[0]) == Number(value[1]);
        case '<':
          return Number(value[0]) > Number(value[1]);
      }
    }
  }
}
