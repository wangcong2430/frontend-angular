import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DownloadService } from './download.service';


@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private http: HttpClient,
    private _downloadService: DownloadService
  ) {}

  export (URL, fileName, model) {
    this._downloadService.loading({
      data: {
        msg: '下载中',
        name: fileName
      }
    });

    this.http.post(URL, model).subscribe(result => {
        if (result['code'] == 0) {
          this._downloadService.loaded({
            data: {
              name: fileName,
              msg: '下载成功',
              link: result['data']
            }
          });
        } else {
          this._downloadService.error({
            data: {
              name: fileName,
              msg: result['msg'] ? result['msg'] : '下载失败',
            }
          });
        }
    }, (err) => {
        this._downloadService.error({
          data: {
            name: fileName,
            msg: err.msg
          }
        });
    });
  }
}
