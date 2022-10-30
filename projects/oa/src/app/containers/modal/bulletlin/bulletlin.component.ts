/*
 * @Author: your name
 * @Date: 2022-04-22 20:11:39
 * @LastEditTime: 2022-04-25 17:20:45
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /csp/cpm/frontend/projects/oa/src/app/containers/modal/bulletlin/bulletlin.component.ts
 */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzCarouselComponent } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-bulletlin',
  templateUrl: './bulletlin.component.html',
  styleUrls: ['./bulletlin.component.css']
})

export class BulletlinComponent implements AfterViewInit {
  @ViewChild(NzCarouselComponent) carousel: NzCarouselComponent;

  effect = 'scrollx';
  arrayList = [];
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
      if (item && item['key'] === 'bulletin' && Array.isArray(item['data']) && item['data'].length > 0 && !this.isVisible) {
        this.arrayList = item['data'];
        this.index = this.arrayList.length - 1;
        this.openBulletin();
      }
    });
  }

  // 打开一个弹窗
  openBulletin () {
    if (this.index >= 0) {
      this.isVisible = true;
      this.isClose = false;
      this.bulletlin = this.arrayList[this.index];
      const must_time = this.bulletlin['inside_permission_limit_must_time'] && this.bulletlin['inside_permission_limit_must_time'] !== 0 ? this.bulletlin['inside_permission_limit_must_time'] : 2;
      this.countDown(must_time);
      this.index--;
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
  isRead () {
    if (this.bulletlin['id']) {
      this.http.post('/web/bulletin-browsing-history/add', {
        bulletin_id: this.bulletlin['id']
      }).subscribe(res => {
      });
    }
  }

  load ($event) {
    this.loading = false;
  }

  countDown (times) {
    // let timer = null;
    times = times * 5;
    const timer = setInterval(() => {
      this.timer = Math.ceil(times / 5);
      if (times <= 0) {
        this.isClose = true;
        clearInterval(timer);
      }
      times--;
    }, 200);
  }
}
