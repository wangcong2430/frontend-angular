import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class CaptchaService {
  public refresh$: EventEmitter<any>;

  constructor(private http: HttpClient) {
    this.refresh$ = new EventEmitter();
  }

  public refresh(url) {
    this.http.get(url).subscribe(result => {
      this.refresh$.emit(result);
    });
  }
}
