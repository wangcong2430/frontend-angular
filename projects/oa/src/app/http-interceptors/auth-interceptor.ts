import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private modal: NzModalService,
    private notification: NzNotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    let ok: string;

    // extend server response observable with logging
    return next.handle(req)
      .pipe(
        tap(
          // Succeeds when there is a response; ignore other events
          event => {
              if (event['type'] === 4 && !(event['status'] === 200 && event['body']['code'] === 0)) {
                console.error(
                  '\t\n页面地址: ' + location.href,
                  '\t\n接口地址: ' + event['url'],
                  '\t\nrequest-id: '+ req.headers['headers'].get('request-id')[0],
                  '\t\n错误信息:\t\n',
                  JSON.parse(JSON.stringify(event))
                )

                // if (event['body']['code'] === -2 || event['body']['msg']) {
                //   this.notification.create(
                //     'error',
                //     '警告提示',
                //     event['body']['msg'] || '网络异常，请稍后再试',
                //     {
                //       nzDuration: 0
                //     }
                //   );
                // }


              }
              return ok = event instanceof HttpResponse ? 'succeeded' : '';
          },
          // Operation failed; error is an HttpErrorResponse
          error => {
            if (error.status === 401 && location.pathname !== '/login') {
              if (location.host === 'oa.cpm.cm.com:4212') {
                location.href = 'http://oa.cpm.cm.com:8212/login?return_url=' + encodeURIComponent(location.href);
              } else {
                location.href = 'login?return_url=' + encodeURIComponent(location.href);
                // window.location.reload()
              }
            } else {


              console.error(
                '\t\n页面地址: ' + location.href,
                '\t\n接口地址: ' + error['url'],
                '\t\nrequest-id: '+ req.headers['headers'].get('request-id')[0],
                '\t\n错误信息:\t\n',
                JSON.parse(JSON.stringify(error))
              )


            }
            return ok = 'failed';
          }
        )
      );
  }
}

