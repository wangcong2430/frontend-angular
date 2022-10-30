import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-table',
  templateUrl: './table.component.html',
  styleUrls  : ['./table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableModalComponent implements OnInit {

  @ViewChild('table') table: ElementRef;
  config: any = [];
  list: any = [];
  nzZIndex: Number = 1000;
  isOpen: Boolean = false;
  loading: Boolean = false;
  title = '';
  columns = [];

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'table') {
        this.isOpen = true;
        this.loading = true;
        this.nzZIndex = item['zIndex'];

        this.table['container']['overlayElement'].style.zIndex = item['zIndex'];
        this.cd.markForCheck();
        // 获取弹窗信息
        if (item['data']) {
          this.title = item['data']['title'];
          if (item['data']['url']) {
            this.http.get(item['data']['url'],  item['data']['params']).subscribe(result => {
              this.loading = false;
              if (result['code'] === 0) {
                this.columns = result['columns'];
                this.list = result['data'];
                if (item['data']['id']) {
                 this.list = this.list.filter(data => data.type_id === item['data']['id']);
                }
              } else {
                this.message.error(result['msg'] || '网络异常, 请稍后再试');
              }
              this.cd.markForCheck();
            }, err => {
              this.loading = false;
              this.cd.markForCheck();
            });
          }
        }
        this.cd.markForCheck();
      }
    });
  }

  modalCancel () {
    this.isOpen = false;
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
