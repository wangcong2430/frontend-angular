import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../services/message.service';

@Injectable({
  providedIn: 'root',
})

export class DownloadService {
  download$ = new Subject();

  zIndex = 800;

  private state: String = 'loaded';

  constructor(
    private http: HttpClient,
    private message: MessageService,
  ) {}

  loading (data = {}) {
    this.download$.next({
        state: 'loading',
        data: data
    });
  }

  loaded (data = {}) {
    this.download$.next({
        state: 'loaded',
        data: data
    });
  }

  error (data = {}) {
    this.download$.next({
        state: 'error',
        data: data
    });
  }

  downFile(content, filename) {
    // 创建隐藏的可下载链接
    const eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    // var blob = new Blob([content]);
    eleLink.href = content;
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
  }

  downloadFile(content, fileName) {
    const aLink = document.createElement('a');
    const blob = new Blob([content]);
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('click', false, false); // initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
  }

  getExportFile (url, model) {
    const messageId = this.message.loading('文件正在下载中...', { nzDuration: 0 }).messageId;
    this.http.get(url, {
      params: model
    }).subscribe(result => {
      this.message.remove(messageId);
      if (result['code'] === 0) {
        this.message.success('下载成功');
        this.loaded({
          data: { 
            msg: '下载成功',
            name: result['data']['filename'],
            link: result['data']['url']
          }
        });
      } else {
        this.message.error(result['msg']);
      }
    }, error => {
      this.message.remove(messageId);
      this.message.error('下载失败');
    });
  }
}



