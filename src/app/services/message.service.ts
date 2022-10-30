import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';

@Injectable()
export class MessageService {
  isAllLoading = false;
  constructor(
    private message: NzMessageService
  ) {}

  success(str: string): void {
    this.message.create('success', str);
  }

  error(str: string): void {
    this.message.create('error', str);
  }

  showerror(str: string): void {
    this.message.create('error', str);
  }
}


