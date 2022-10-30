/*
 * @Author: suxinmian
 * @Date: 2022-02-16 15:29:52
 * @Description: 
 */
import { Injectable } from '@angular/core';
import { MycurrencyPipe } from '../../app/pipes/mycurrency.pipe';
import { CurrencyPipe } from '@angular/common';

@Injectable({providedIn: "root"})
export class CommonFunctionService {
    myCurrencyPipe = new MycurrencyPipe(new CurrencyPipe("zh-cn"));
    numberFormat(str,has_symbol=false){
        return this.myCurrencyPipe.transform(str,has_symbol);
    }
}
