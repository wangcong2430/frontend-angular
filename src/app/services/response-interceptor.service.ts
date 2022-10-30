import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { UtilsService } from './utils.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LanguageService } from './language.service';
import { UserInfoService } from './user-info.service';


@Injectable()
export class ResponseInterceptorService implements HttpInterceptor {
    constructor(
      private service: UtilsService,
      private language: LanguageService,
      private userInfo: UserInfoService,
      private router: Router
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let language = this.language.getLanguage() === 'en-Us' ? 'en-Us' : 'zh-CN';
        const username = this.userInfo.user ? this.userInfo.user.username : '';
        const clonedRequest = request.clone({
          setHeaders: {
            'X-Requested-With': 'XMLHttpRequest',
            'request-id': Math.random().toString(36).slice(-8) +  '-' + new Date().getTime() + '-' + username
          },
          setParams: {
            '_lang': language,
          }});
        return next.handle(clonedRequest).pipe(
            tap(
                (event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        if (event['body'] && event['body']['code'] === -1 && event['body']['message']) {
                            this.service.message(event['body']['message'], false);
                        } else if (event['body'] && event['body']['ret_code'] === 401 && location.hostname !== 'localhost') {
                          let base_url = '';
                        //   base_url += 'qq-auth/login?return_url=' + location.href;
                        //   location.href = base_url;
                          this.router.navigateByUrl('/qqLogin?return_url=' + location.href);

                        }

                        if (event['type'] === 4 && !(event['status'] === 200 && event['body']['code'] === 0) && event['url'].indexOf('.json') === -1) {
                            console.error(
                                '\t\n页面地址: ' + location.href,
                                '\t\n接口地址: ' + event['url'],
                                '\t\nrequst-id: '+ clonedRequest.headers['headers'].get('request-id')[0],
                                '\t\n错误信息:\t\n',
                                JSON.parse(JSON.stringify(event))
                            )
                        }
                    }
                },
                // error responses
                (err: any) => {
                    if (err instanceof HttpErrorResponse) {
                        if (err.status === 401) {
                            let base_url = '';
                            switch (location.hostname) {
                                case 'qq.cpm.cm.com':
                                    base_url = 'http://qq.cpm.cm.com:8210/';
                                    break;
                            }
                            if (location.pathname != '/un'){
                              base_url += 'qq-auth/login?return_url=' + location.href;
                            //   location.href = base_url;
                            }

                          this.router.navigateByUrl('/qqLogin?return_url=' + location.href);
                      }


                    } else if (err['url'].indexOf('json') === -1){
                        console.error(
                            '\t\n页面地址: ' + location.href,
                            '\t\n接口地址: ' + err['url'],
                            '\t\nrequest-id: '+ clonedRequest.headers['headers'].get('request-id')[0],
                            '\t\n错误信息:\t\n',
                            JSON.parse(JSON.stringify(err))
                        )

                    }
                }
            )
        );
    }
}
