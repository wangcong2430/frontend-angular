import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { NzCarouselComponent, NzModalService } from 'ng-zorro-antd';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-photo-swipe',
  templateUrl: './photo-swipe.component.html',
  styleUrls: ['./photo-swipe.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PhotoSwipeComponent implements OnInit {
  @ViewChild(NzCarouselComponent) carousel: NzCarouselComponent;
  @ViewChild('tplContent') tplContent: TemplateRef<{}>;

  tplModal;
  effect = 'scrollx';
  isVisible = false;
  loading = false;
  photos = [];
  init = false;
  index;

  url: string = ''
  type: string = ''

  constructor(
    private modal: ModalService,
    private modalService: NzModalService,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.modal.modal$.subscribe(item => {

      if (item && item['key'] === 'photo' && item['data'] && item['data']['url']) {
        this.url = item['data']['url']
        if (item['data']['type']) {
          if (item['data']['type'].indexOf('image') > -1) {
            this.type = 'image'
          } else if (item['data']['type'].indexOf('video') > -1) {
            this.type = 'video'
          }  else if (item['data']['type'].indexOf('audio') > -1) {
            this.type = 'audio'
          }
          this.createTplModal(this.tplContent);
        } else if (this.url.indexOf('myqcloud.com') > -1 ) {
          this.url= this.url.split('?')[0];

          const suffix = this.url.substring(this.url.lastIndexOf(".") + 1);
          this.type = this.getFileType(suffix);
          this.createTplModal(this.tplContent);
        } else if (this.url && this.url.indexOf('web/file') > -1) {
          this.url= this.url.split('?')[0];
          this.url= this.url.replace('/900', '');
          this.url= this.url.replace('/60', '');
           
          this.http.get(this.url + '/60/preview').subscribe(result => {
            this.url = result['data']['file_path'];
            const suffix = result['data']['file_path'].substring(result['data']['file_path'].lastIndexOf(".") + 1);
            this.type = this.getFileType(suffix);
            if (this.type) {
              this.createTplModal(this.tplContent);
            }
          }, err => {
            console.log(err)
          })
        }
      }
    });
  }

  getFileType (suffix) {
    if (['mp4', 'ogg', 'webm'].some(item => item === suffix)) {
      return 'video'
    } else if (['mp3', 'wav', 'ogg'].some(item => item === suffix)) {
      return 'audio'
    }  else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].some(item => item === suffix)) {
      return 'image'
    } else {
      window.open(this.url , '_blank');
    }
  }

  // 关闭弹窗
  close () {
    this.tplModal.close();
  }



  createTplModal(tplContent: TemplateRef<{}>): void {
    this.tplModal = this.modalService.create({
      nzClassName: 'photo-swipe',
      nzBodyStyle: {padding: 0},
      nzContent: tplContent,
      nzClosable: false,
      nzMaskClosable: true,
      nzFooter: null
    });
    this.cd.markForCheck();
  }
}
