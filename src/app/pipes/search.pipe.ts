import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'search'
})
export class SearchPipe implements PipeTransform {
    transform(value, keys: string, term: string, flag: boolean): any {
        if (!term) {
            return value;
        }
        return (value || []).filter((item) => {
            return keys.split(',').some(key => {
                if (flag) {
                    return item.hasOwnProperty(key) && (item[key] + '').toLowerCase() === term.toLowerCase();
                } else {
                    return item.hasOwnProperty(key) && (item[key] + '').toLowerCase().indexOf(term.toLowerCase()) > -1;
                }
            });
        });
    }

}
