import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { UserInfoService } from '../services/user-info.service';

@Injectable()
export class AjaxInterceptor implements HttpInterceptor {
  constructor(
    private userInfoService: UserInfoService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const username = this.userInfoService.user ? this.userInfoService.user.username : '';
    const authReq = req.clone({setHeaders: {
      'X-Requested-With': 'XMLHttpRequest',
      'request-id': Math.random().toString(36).slice(-8) +  '-' + new Date().getTime() + '-' + username
    }});
    return next.handle(authReq);
  }
}


/*
Copyright 2017-2018 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
