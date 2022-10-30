import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params, NavigationStart } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { UserInfoService } from '../services/user-info.service';

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  menus = {};
  user;
  menu_collapsed = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuservice: MenuService,
    private userInfoService: UserInfoService,
  ) {}

  return_url;

  ngOnInit() {
    document.querySelector("html").setAttribute('data-theme', '')
    this.return_url = encodeURIComponent(location.href);
    this.user = this.route.snapshot.data['user'];
    this.user = this.userInfoService.user;
    let url;
    if (this.router.url) {
      url = this.router.url.split('?')[0];
    }
    if (typeof(url) !== 'string') {
      url = this.router.url;
    }
    if (this.menuservice.menu_has_names && this.menuservice.menu_has_names[url]) {
      this.menuservice.curr_menu = this.menuservice.menu_has_names[url];
    }

    this.menus = this.menuservice.menus;
  }
}
