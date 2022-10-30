import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { UserInfoService } from '../services/user-info.service';
import { UserService } from '../../api-client';
import { MenuService } from '../services/menu.service';
import { Observable, forkJoin } from 'rxjs';
import { ModalService } from '../services/modal.service';
// import { CanDeactivate } from '@angular/router/src/utils/preactivation';

@Injectable({
  providedIn: 'root',
})

export class LeaveGuard implements CanDeactivate<any> {
  constructor(
    private menuService: MenuService,
  ) {
  }

  canDeactivate(
    component: any, 
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    var r = confirm("数据尚未保存, 是否离开改页面");
    this.menuService.refreshMenu()
    return r
  }
}

