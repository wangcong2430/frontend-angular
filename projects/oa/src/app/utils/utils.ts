/*
 * @Author: v_hhlihuang 1724690469@qq.com
 * @Date: 2022-06-19 17:18:05
 * @LastEditors: v_hhlihuang 1724690469@qq.com
 * @LastEditTime: 2022-06-19 17:18:06
 * @FilePath: /csp/cpm/frontend/projects/oa/src/app/utils/utils.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export function paramsFilter (data) {
  const obj = {};
  if (data && data instanceof Object) {
    Object.keys(data).map(key => {
      if (data[key]) {
        obj[key] = typeof data[key] === 'string' ? data[key].toString().toUpperCase().trim() : data[key];
      }
    });
  }
  return obj;
}

export const filterOption = (input, option) => {
  if (input && option && option['nzLabel']) {
    return option['nzLabel'].toUpperCase().indexOf(input.trim().toUpperCase()) > -1 ? true : false;
  } else {
    return false
  }
}

export const getUrlParams = (): object => {
  var obj = {}
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  if (vars.length) {
    for (var i=0; i<vars.length; i++) {
      var pair = vars[i].split("=");
      obj[pair[0]] = pair[1]
    }
    return obj
  } else {
    return {}
  }
}

//获取url后面的参数
export function GetRequest(value:string) {
  //url例子：www.baidu.com?id="123456"&name="www"；  
  var url = decodeURI(window.location.search); //?id="123456"&name="www";
  var object:any = {};
  if (url.indexOf("?") != -1)//url中存在问号，也就说有参数。  
  {
    var arr = url.split("?")
    var str = arr[1]
    var strs = str.split("&");  //将得到的参数分隔成数组[id="123456",name="www"];
    for (var i = 0; i < strs.length; i++) {
      object[strs[i].split("=")[0]] = strs[i].split("=")[1];//得到{id:'123456',name:'www'}
    }
  }
  return object[value];
}


