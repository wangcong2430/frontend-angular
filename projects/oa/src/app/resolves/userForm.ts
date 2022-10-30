import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { UserService } from '../../api-client';

@Injectable()
export class UserFormResolve implements Resolve<any> {

  constructor(private userService: UserService) {
  }

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('username');
    return Observable.create(observer => {
      this.userService.webUserDetailGet(id).subscribe(result => {
        if (result.ret_code === 0) {
          observer.next(result.data);
        }
        observer.complete();
      });
    });
  }
}
