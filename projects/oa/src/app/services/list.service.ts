import { Injectable } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  list$ = new Subject<[any, any]>();
  list = null;
  config = null;
  params = null;

  constructor(
    private http: HttpClient,
    private message: MessageService,
  ) {}

  getList (url, params = null) {{
    if (params) {
      this.params = params;
    }
    this.http.get('web/' + url + '-list', this.params).subscribe(list => {
      if (list['code'] === 0) {
        this.list = list['data'];
        this.list$.next(this.list);
      } else {
        this.message.error(this.list['msg']);
      }
    }, err => {
      this.message.error(err.msg);
    });
  }}

  valueChange () {
    return this.list$;
  }
}
