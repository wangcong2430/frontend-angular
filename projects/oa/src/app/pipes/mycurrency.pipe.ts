import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'mycurrency'
})
export class MycurrencyPipe implements PipeTransform {
    constructor(public currencyPipe:CurrencyPipe){}

    transform(num:any,has_symbol=false): string {
        if(typeof(num) != 'string' && typeof(num) != 'number' ){
            return num;
        }

        num = num.toString();
        // 1111.00 / 12%
        if(num.indexOf("/") != -1){
            let num_arr = num.split('/');
            for(let i in num_arr){
                num_arr[i] = this.transformNumberic(num_arr[i],has_symbol)
            }
            return num_arr.join('/');
        }
        // 1111.00  CNY
        if(num.indexOf(" ") != -1){
            let num_arr = num.split(' ');
            for(let i in num_arr){
                num_arr[i] = this.transformNumberic(num_arr[i],has_symbol)
            }
            return num_arr.join(' ');
        }
        //普通数字或字符
        return this.transformNumberic(num,has_symbol)
    }
    
    transformNumberic(num,has_symbol){
        if(!this.isNumeric(num) || num == 'Infinity' ||num == '-Infinity'){
            return num;
        }
        // num = '88888888';
        if(has_symbol){
            return this.currencyPipe.transform(num,'CNY','symbol-narrow','0.2-2');
        }else{
            return this.currencyPipe.transform(num,' ','symbol-narrow','0.2-2').trim();
        }
    }
    
    isNumeric(num):boolean{
        if (num == "" || Number(num).toString() === 'NaN') {
            return false
        }
        return true;
    }
}
