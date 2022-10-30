import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserInfoService } from '../services/user-info.service';
import { UserService } from '../../api-client';
import { MenuService } from '../services/menu.service';
import { Observable, forkJoin } from 'rxjs';
import { ModalService } from '../services/modal.service';

@Injectable({
  providedIn: 'root',
})

export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private userInfoService: UserInfoService,
    private userService: UserService,
    private menuservice: MenuService,
    private modalService: ModalService
  ) {}

  menus = {};
  crru_menu = {
    icon: 'filter',
    parent_id: '',
    parent_name: '',
    id: '',
    name: '',
    url: '',
    node_key: ''
  };

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return Observable.create((observer) => {
        forkJoin(
          this.menuservice.getMenu(),
          this.userService.webUserInfoGet()
        ).subscribe(result => {
          const [menus, user] = result;
          if (user['code'] === 0 && user.data && user['data']['is_roles']) {
            this.userInfoService.user = user['data'];

            observer.next(true);
            observer.complete();
          } else {
            this.router.navigate(['/un']);
            observer.next(false);
          }
        });
    });
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // console.log('9999')
    this.modalService.initModalZindex()
    if (this.menuservice.menu_has_names[state.url]) {
      this.menuservice.curr_menu = this.menuservice.menu_has_names[state.url];
    } else {
      this.menuservice.curr_menu = this.crru_menu;
    }
    return true;
  }
}

