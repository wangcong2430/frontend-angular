import { HttpClient } from '@angular/common/http';
import {Pipe, PipeTransform} from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Pipe({
    name: 'preview'
})
export class PreviewPipe implements PipeTransform {
    constructor(
        private http: HttpClient
    ) {}

    // async transform(value: any, ...args: any[]) {
    //     // 获取城市列表
    //     this.cityList = await this.globalFun.getCity();
    //     // 通过编码输入查找对应的城市名称将其返回
    //     return value ? this.returnIt(value, this.cityList)['label'] : '';
    //   }
    

    transform(url) {
        if ( url) {
          url = url.split('?')[0];
          url = url.replace('/900', '');
          url = url.replace('/60', '');
        }

        return this.http.get( url + '/60/preview').pipe(map(result => {
            url = result['data']['file_path'];
            const suffix = result['data']['file_path'].substring(result['data']['file_path'].lastIndexOf(".") + 1);
            const type =  this.getFileType(suffix);
 
            if (type === 'video') {
                 return `<video *ngIf="type == 'video'" width="240" height="160" controls>
                 <source src="${url}" type="video/mp4">
                 <source src="${url}" type="video/webm">
                 <source src="${url}" type="video/mp4">
                 <source src="${url}" type="video/mp4">
             </video>`
            } else if (type === 'audio') {
             return `<audio *ngIf="type == 'audio'" width="240" height="160" controls>
                 <source src="${url}" type="audio/mp3">
                 <source src="${url}" type="audio/ogg">
                 <source src="${url}" type="audio/wav">
             </audio>`
            } else {
              return `<img *ngIf="type == 'image'" src="${url + '?imageMogr2/crop/240x160/gravity/center'}" width="240" height="160"/>`
            }
        }))
    }

    getFileType (suffix) {
        if (['mp4', 'ogg', 'webm'].some(item => item === suffix)) {
            return 'video'
        } else if (['mp3'].some(item => item === suffix)) {
            return 'audio'
        }  else {
            return 'image'
        }
    }


}

