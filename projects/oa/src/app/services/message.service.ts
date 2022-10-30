import { Injectable } from '@angular/core';
import { NzMessageService, NzMessageDataOptions } from 'ng-zorro-antd';

@Injectable()
export class MessageService {
  isAllLoading = false;
  constructor(private message: NzMessageService) {}

  success(str: string): void {
    this.message.success(str);
  }

  error(str: string, options?: NzMessageDataOptions): void {
    this.message.error(str, options);
  }

  warning(str: string): void {
    this.message.warning(str);
  }

  remove (id) {
    this.message.remove(id);
  }

  loading (str, option = { nzDuration: 0 }) {
    return this.message.loading(str, option);
  }
}


