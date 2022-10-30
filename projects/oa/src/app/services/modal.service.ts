import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {


  modal$ = new Subject();

  complete$ = new Subject();

  zIndex = 800;

  // key: bulletin 通知的弹窗
  // key: photo 图片的弹窗
  // key：order 订单的弹窗
  // key: thing 物件的弹窗
  // key: budget 预算的弹窗
  // key: demand 需求详情
  open(key: string, data = null) {
    this.zIndex = this.zIndex + 1;
    this.modal$.next({
        key: key,
        zIndex: this.zIndex,
        data: data
    });
  }

  initModalZindex () {
    this.zIndex = 800
  }

  complete (key: string, data = {}) {
    this.complete$.next({
      key: key,
      data: data
    });
  }

  close (key: string, data = null) {
    this.zIndex = this.zIndex - 1;
    this.modal$.next({
      key: key,
      data: data
    });
  }

  valueChange () {
    return this.modal$;
  }
}
