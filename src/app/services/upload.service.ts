import { Injectable } from '@angular/core';
import { UploadXHRArgs } from 'ng-zorro-antd';
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse} from '@angular/common/http';
import {concat, interval, of, throwError} from 'rxjs';
import { MessageService } from './message.service';
import {catchError, mergeMap} from 'rxjs/operators';

@Injectable()
export class UploadService {

  uploadModal = {
    isShow: false,
    percent: 0,
    msg: ''
  };
  constructor(private http: HttpClient, private message: MessageService) {}

  getQueryVariable(url, variable) {
    const query = url.split('?')[1];
    const vars = query ? query.split('&') : null;
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (pair[0] === variable) {
        return pair[1];
      }
    }
    return null;
  }

  // 分片上传
  uploadBig(item: UploadXHRArgs, objtype, fun, type ?: String): void {

    if (!objtype) {
      objtype = this.getQueryVariable(item.action, 'objtype');
    }

    const size = item.file.size;
    const filename = item.file.name;
    // const chunkSize = parseInt((size / 8) + '', 10);
    // 每片段文件大小
    const chunkSize = 5800000;
    // 总片段数量
    const maxChunk = Math.ceil(size / chunkSize);
    // 每分片占有进度%
    const maxChunkPlan = parseFloat((80 / maxChunk).toFixed(8));
    // 显示提示框
    this.uploadModal.isShow  = true;
    this.uploadModal.percent = 0;
    this.uploadModal.msg     = '正在上传中...';
    // 创建大文件上传任务
    this.http.post('web/plupload/upload-task', {size: size, chunkNum: maxChunk, filename: filename, objectType: objtype, type: type})
      .subscribe(retask => {
        if (retask['code'].toString() !== '0') {
          item.onError(retask['msg'], item.file);
          this.message.error(retask['msg']);
          this.uploadModal.isShow  = false;
          return false;
        }
        // 任务key
        const upload_key = retask['data'];
        // 任务分片
        const reqs = Array(maxChunk).fill(0).map((v: {}, index: number) => {
          const start = index * chunkSize;
          let end = start + chunkSize;
          if (size - end < 0) {
            end = size;
          }
          const formData = new FormData();
          formData.append('upload_key', upload_key);
          formData.append('file', item.file.slice(start, end));
          formData.append('currSize', start.toString());
          formData.append('size', size.toString());
          formData.append('index', index.toString());
          formData.append('chunks', maxChunk.toString());
          const req = new HttpRequest('POST', item.action, formData, {
            reportProgress : true,
            withCredentials: true
          });
          return this.http.request(req);
        });
        // 上传
        let task_i;
        task_i = 0;
        const example = concat(...reqs);
        return example.pipe(
          mergeMap(event => {
            if (event['body'] && event['body']['code'].toString() !== '0' && event['body']['code'].toString() !== '1') {
              return throwError(event['body']['msg']);
            }
            return of(event);
          })
        ).subscribe((event: HttpEvent<{}>) => {
          let percent, oldPercent;
          oldPercent = task_i * maxChunkPlan;
          percent = 0;
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total > 0) {
              percent = (maxChunkPlan * (event.loaded / event.total));
            }
            // 总进度
            this.uploadModal.percent = (oldPercent + percent).toFixed(1);
            // 任务结束时 需要等待服务器文件合并
            if ((task_i + 1) === maxChunk && event.loaded === event.total) {
              let tempPercent;
              tempPercent = parseFloat((oldPercent + percent).toFixed(1));
              const t1 = setInterval(() => {
                tempPercent = tempPercent + 0.1;
                let currPercent;
                currPercent = this.uploadModal.percent;
                if (parseFloat(currPercent) >= 98) {
                  clearTimeout(t1);
                } else {
                  this.uploadModal.percent = tempPercent.toFixed(1);
                }
              }, 900);
            }
          } else if (event instanceof HttpResponse) {
            task_i++;
            // 上传结束返回文件id
            if (event['body']['code'].toString() === '0') {
              item.onSuccess(event['body']['data'], item.file, event);

              fun(event['body']['data'], item.file, event);

              this.uploadModal.percent = 100;
              this.uploadModal.msg   = '上传完成';

              setTimeout(() => {
                this.uploadModal.isShow = false;
              }, 3000);
            }
          }
          return;
        }, (err) => {
          // 处理失败
          item.onError(err, item.file);
          this.uploadModal.msg = '上传失败';
          this.uploadModal.isShow = false;
          this.message.error(err);
        });
      }, (err) => {
        this.uploadModal.isShow = false;
      });
  }

}


