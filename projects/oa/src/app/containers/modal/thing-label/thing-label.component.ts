import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { MenuService} from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-thing-label',
  templateUrl: './thing-label.component.html',
  styleUrls  : ['./thing-label.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ThingLabelModalComponent implements OnInit {

  @ViewChild('thingLabel') thingLabel: ElementRef;

  isOpen;
  nzZIndex = 1000;
  loading = false;
  isOkLoading = false;

  list = null;
  columns = null;
  callback=false;
  required = false;

  constructor(
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
    private http: HttpClient,
    private message: MessageService,
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'thing-label') {
        this.isOpen = true;
        this.loading = true;
        this.nzZIndex = item['zIndex'];
        if (item['data']['required'] === false) {
          this.required = false;
        } else {
          this.required = true;
        }

        this.thingLabel['container']['overlayElement'].style.zIndex = item['zIndex'];
        this.cd.markForCheck();
        if (item['data']) {
          this.callback = item['data']['callback'];
          if (item['data'] && item['data']['getUrl']) {
            this.http.get(item['data']['getUrl'], {
              params: item['data']['params']
            }).subscribe(result => {
              this.loading = false;
              if (result['code'] === 0) {
                this.list = result['data'];
                this.columns = result['columns'];

                this.cd.markForCheck();
              }
            }, err => {
              this.loading = false;
            });
          }
        }
        this.cd.markForCheck();
      }
    });
  }

  openModal() {
    this.isOpen = true;
    this.cd.markForCheck();
  }

  modalCancel() {
    this.isOpen = false;
    this.cd.markForCheck();
  }

  handleOk () {
    let error = false;
    this.list.map((label, index3) => {
      if (label && label.attribute && label.attribute_check) {
        label.attribute.map(item3 => {
          if (item3.attr_type === '1') {
            if (item3.options
                && item3.options.length > 0
                && item3.options.some(item => item.value === null)
                && item3.options.some(item => item.value !== null)) {
              //this.message.error(label.category + '需求标签' + item3.title + '不能为空');
              this.message.error('标签' + item3.title + '不能为空');
              error = true;
              return false;
            }
          }
        });

        label.attribute_check.map(item3 => {
          if (item3.attr_type === '1') {
            if (item3.options
                && item3.options.length > 0
                && item3.options.some(item => item.value === null)
                && item3.options.some(item => item.value !== null)) {
              //this.message.error(label.category + '交付标签' + item3.title + '不能为空');
              this.message.error('标签' + item3.title + '不能为空');
              error = true;
              return false;
            }
          }
        });
      }
    });

    if (error) {
      this.cd.markForCheck();
      return;
    }


    
    if (error) {
      return;
    }

    // 添加标签验证
    if (!this.callback) {
      this.isOkLoading = true;
      this.cd.markForCheck();
      this.http.post('/web/thing/thing-label-save', {
        data: this.list
      }).subscribe(result => {
        this.isOkLoading = false;
        if (result['code'] === 0) {
          this.message.success(result['msg']);
          this.isOpen = false;
          this.cd.markForCheck();
          this.modalService.complete('thing-label', {
            title: '获取物件变更记录',
            list: this.list
          });
        } else {
          this.message.error(result['msg']);
        }
      }, err => {
        this.isOkLoading = false;
        this.message.error(err['msg']);
        this.cd.markForCheck();
      });
    } else {
      this.modalService.complete('thing-label', {
        title: '获取物件变更记录',
        list: this.list
      });
      this.isOkLoading = false;
      this.isOpen = false;
      this.cd.markForCheck();
    }
    
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
