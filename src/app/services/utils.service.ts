import {Injectable} from '@angular/core';
import * as jQuery from 'jquery';
declare let require: any;

const moment = require('moment/moment');
moment.locale('zh-Hans');

interface DateRange {
    start: string;
    end: string;
}


@Injectable()
export class UtilsService {
    constructor() {
    }

    static datesFromDateRange(dateRange, format: string = 'YYYY-MM-DD') {
        const dates = [];
        let date = moment(dateRange.start);
        while (date.isSameOrBefore(dateRange.end)) {
            dates.push(date.format(format));
            date = date.add(1, 'day');
        }
        return dates;
    }

    findMaxInArray(array: Array<Object>, key: string) {
        let max = 0;
        array.forEach(function (item) {
            max = Math.max(max, +item[key]);
        });
        return max;
    }

    sumInArray(array: Array<Object|number>, key?: string) {
        let sum = 0;
        array.forEach(function (item) {
            if (key && item[key]) {
                sum += +item[key];
            } else if (item) {
                sum += +item;
            }
        });
        return sum;
    }

    message (text, bgColor?) {
        if(!text){
            return false;
        }
        bgColor = bgColor ? '#5FD591' : '#FD7166';
        let div = document.createElement('div');
        let span = document.createElement('span');
        div.appendChild(span);
        span.innerText = text;
        style();
        document.body.appendChild(div);

        // 自动关闭
        let clear = setTimeout(function () {
            span.style.opacity = '0';
            const time = setTimeout(function(){
                document.body.removeChild(div)
            }, 300);
        }, 1500);

        function style() {
            div.style.textAlign = 'center';
            div.style.position = 'fixed';
            div.style.top = '20px';
            div.style.left = '50%';
            div.style.transform = 'translateX(-50%)';
            div.style.zIndex = '99999';
            span.style.borderRadius = '4px';
            span.style.display = 'inline-block';
            span.style.padding = '10px 50px';
            span.style.minWidth = '200px';
            span.style.fontSize = '14px';
            span.style.fontWeight = '700';
            span.style.transition = '0.3s';
            span.style.color = '#fff';
            span.style.background = bgColor;
        }
    }

    toQueryPair(key, value) {
        if (typeof value == 'undefined') {
            return key;
        }
        return key + '=' + encodeURIComponent(value === null ? '' : String(value));
    }

    toQueryString(obj) {
        var ret = [];
        for (var key in obj) {
            key = encodeURIComponent(key);
            var values = obj[key];
            if (values && values.constructor == Array) {//数组
                var queryValues = [];
                for (var i = 0, len = values.length, value; i < len; i++) {
                    value = values[i];
                    queryValues.push(this.toQueryPair(key, value));
                }
                ret = ret.concat(queryValues);
            } else {
                ret.push(this.toQueryPair(key, values));
            }
        }
        return ret.join('&');
    }

    orderBy(list, key){
        if(!list){
            return false;
        }
        let type = 'asc';
        if(key.indexOf('-') === 0){
            type = 'desc';
            key = key.slice(1);
        }
        list.sort(function (a, b) {
            if(type === 'asc'){
                return a[key]-b[key];
            } else if(type === 'desc'){
                return b[key]-a[key];
            }
        });
        return list;
    }

    deepClone(...args) {
        return jQuery.extend(true, {}, ...args);
    }

    findIndexByKeyValue (arr, oldKey, oldValue) {
        let result = -1;
        if(!arr || !oldKey){
            return result;
        }
        arr.some((v, i) => {
            if (result === -1) {
                for (let _key in v) {
                    if (_key === oldKey && v[_key] === oldValue) {
                        result = i;
                        break
                    }
                }
            }
        });
        return result;
    }

    getErrorMessage(errors) {
        let errorMessage = '';
        let first = '';
        for(let key in errors){
            for (let i of errors[key]) {
                errorMessage += i + '<br>';
                !first && (first = i);
            }
        }
        errorMessage += '请检查以上字段。';
        return {
            errorMessage: errorMessage,
            first: first
        };
    }
}
