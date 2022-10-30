import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';

@Component({
  templateUrl: './in-deliverable.component.html',
  styleUrls: ['./in-deliverable.component.css']
})
export class InDeliverableComponent implements OnInit {
  loading = false;
  list    = [];

  constructor(
    private http: HttpClient,
    private message: MessageService
  ) {}

  ngOnInit() {}

  customBigReq = (item) => {
    const file = {
      name: item.file.name,
      size: item.file.size > 1024 * 1024 ? (item.file.size / (1024 * 1024)).toFixed(2) + 'mb' : (item.file.size / 1024).toFixed(2) + 'kb',
      uid: item.file.uid,
      status: '等待上传',
      detail: ''
    };
    this.list = [...this.list, file];
    if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'].some(type =>
      type === item.file.type
      )
    ) {
      file.detail = '文件格式错误';
      file.status = '上传失败';
      return;
    }
    const form = new FormData();

    form.append('file', item.file);
    file.status = '正在上传';
    this.http.post('gd/index/import-excel', form).subscribe(result => {
      file.detail = result['msg'];
      file.status = '上传完成';
    }, error => {
      file.detail = error['msg'];
      file.status = '上传失败';
    });
  }

  download() {
    this.http.post('gd/index/download-excel', {}).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return;
      }
      window.location = result['data'];
    });
  }
}
