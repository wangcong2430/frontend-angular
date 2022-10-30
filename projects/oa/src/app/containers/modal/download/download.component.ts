import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { DownloadService } from '../../../services/download.service';

@Component({
  selector: 'app-modal-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})

export class DownloadModalComponent implements OnInit {
  @ViewChild(TemplateRef) template: TemplateRef<{}>;

  state = '';
  data = {
    data: {
      name: ''
    }
  };

  notification;

  constructor(
    private notificationService: NzNotificationService,
    private _downloadService: DownloadService
  ) {
    this._downloadService.download$.subscribe(item => {
      this.state = item['state'];
      this.data = item['data'];

      if (item['state'] === 'loading') {
        this.notificationService.template(this.template, { nzData: this.data, nzDuration: 0, nzKey: 'notification'});
      } else if (item['state'] === 'error') {
        this.notificationService.template(this.template, { nzData: this.data, nzDuration: 2000, nzKey: 'notification'});
        setTimeout(() => {
          this.notificationService.remove();
        }, 2000);
      } else {
        this.notificationService.template(this.template, { nzData: this.data, nzDuration: 0, nzKey: 'notification'});
      }
    });
  }

  ngOnInit () {}
}
