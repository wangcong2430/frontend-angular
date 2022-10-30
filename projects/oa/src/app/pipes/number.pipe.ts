import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'number'
})
export class NumberPipe implements PipeTransform {
  transform(value: number, num?: number): string {
    return value.toFixed(num || 0);
  }
}
