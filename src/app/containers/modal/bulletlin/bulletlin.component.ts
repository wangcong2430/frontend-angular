import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { ModalService } from '../../../services/modal.service';
import { MessageService } from '../../../services/message.service';
@Component({
  selector: 'app-bulletlin-modal',
  templateUrl: './bulletlin.component.html',
  styleUrls: ['./bulletlin.component.css']
})

export class BulletlinComponent implements AfterViewInit {

  arrayList = [];
  supplier_type = '';
  isVisible = false;
  loading = false;
  content = null;
  index = 0;
  bulletlin = {};
  isClose = true;
  timer = null;

  constructor(
    private modal: ModalService,
    private message: MessageService,
    private http: HttpClient
  ) {}

  ngAfterViewInit(): void {
    this.modal.modal$.subscribe(item => {
      if(!item['data']){
        return;
      }
      let data = item['data']['data'];
      if (item && item['key'] === 'bulletin' && Array.isArray(data) && data.length > 0  && !this.isVisible) {
        this.arrayList = item['data']['data'];
        this.supplier_type = item['data']['supplier_type'];
        this.index =   this.arrayList.length - 1;
        this.openBulletin();
      }
    });
  }

  // 打开一个弹窗
  openBulletin () {
    if (this.index >= 0) {
      this.bulletlin = this.arrayList[this.index];
      this.index--;

      this.isVisible = true;
      this.isClose = false;
      let must_time = 5;
      if(this.supplier_type == 'registered_supplier'){
        must_time = this.bulletlin['registered_supplier_limit_must_time'];
      }
      if(this.supplier_type == 'contracted_supplier'){
        must_time = this.bulletlin['contracted_supplier_limit_must_time'];
      }
      this.countDown(must_time);

    }
  }

  onOk() {
    this.isVisible = false;
    this.isRead();
    setTimeout(() => {
      this.openBulletin();
    }, 60);
  }

  //点击报名
  onSignup(id,is_external_link,external_link){
    if(is_external_link){
      window.open(external_link)
      this.isVisible = false;
      this.isRead();
      setTimeout(() => {
        this.openBulletin();
      }, 60);
    }else{
      this.http.get('web/bulletin/sign-up?id='+id).subscribe(res=>{
        if(res['code']==0){
          this.message.success(res['msg'])
          this.isVisible = false;
          this.isRead();
          setTimeout(() => {
            this.openBulletin();
    }, 60);
        }else{
          this.message.error(res['msg'])
        }
      })
    }
    
  }

  load ($event) {
    this.loading = false;
  }

  countDown(times) {
    let timer = null;
    times = times * 5;
    timer = setInterval(() => {
      this.timer = Math.ceil(times / 5);
      if (times <= 0) {
        this.isClose = true;
        clearInterval(timer);
      }
      times--;
    }, 200);
  }

  isRead () {
    if (this.bulletlin['id']) {
      this.http.post('/web/bulletin-browsing-history/add', {
        bulletin_id: this.bulletlin['id']
      }).subscribe(res => {
        console.log(res);
      });
    }
  }

  preview ($event, data = {}) {
    $event.stopPropagation();
    this.modal.open('photo', {
      title: data['uploadFile']['file_name'],
      url: data['uploadFile']['file_path'] ? data['uploadFile']['file_path'] : '/web/file/1491'
    });
  }
}
