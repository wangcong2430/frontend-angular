import { Component, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, ActivationEnd, NavigationStart, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MenuService } from '../../../services/menu.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd';
import {FormsModule} from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd';
import { IfStmt } from '@angular/compiler';

@Component({
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit {
  menus = {};
  menu_collapsed = {};
  user = {
    username:''
  };
  crru_menu = {
    icon: 'filter',
    parent_id: '',
    parent_name: '',
    id: '',
    name: '',
    url: '',
    node_key: ''
  };
  is_read_contract=true
  is_agree=true
  is_checked=false
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private menuService: MenuService,
    private translate: TranslateService,
    private language: LanguageService,
    private i18n: NzI18nService,
    private modalService:NzModalService
  ) {
    this.translate.use(this.language.language);
  }

  ngOnInit() {

   
    this.user = this.route.snapshot.data['user'];
    //console.log(this.user.username)
   // console.log(JSON.parse(localStorage.getItem('user')).username)
    if(localStorage.getItem('user')&& this.user.username==JSON.parse(localStorage.getItem('user')).username){
      this.is_read_contract=false
    }else if(localStorage.getItem('user')&& this.user.username!=JSON.parse(localStorage.getItem('user')).username){
      this.is_read_contract=true     
    }else if(!localStorage.getItem('user')){
      this.is_read_contract=true 
    }
    this.menuService.menu$.subscribe(result => {
      // console.log()
        //console.log('6667')
        result = result['data'];
        if (Array.isArray(result)) {
          this.menuService.getBacklog(true);
          this.menus = result;
          if (this.menus && this.menus instanceof Array) {
            let menu_has_name, nodekey_has_pid;
            menu_has_name = {};
            nodekey_has_pid = {};

            // 获取当前菜单路径
            // console.log()


            if (this.menus instanceof Array) {
              this.menus.forEach(menu => {
                if (menu.children) {
                  menu.children.forEach(menu2 => {
                    menu2.selected = false
                    if (menu2['node_key'] && menu2['node_key'] !== '') {
                      nodekey_has_pid[menu2['node_key']] = menu['id'];
                    }
                    menu_has_name['/system' + menu2['url']] = {
                      'icon': menu['icon'],
                      'parent_id': menu['id'],
                      'parent_name': menu['name'],
                      'id': menu2['id'],
                      'name': menu2['name'],
                      'url': '/system' + menu2['url'],
                      'node_key': menu2['node_key'],
                    };
                    // console.log(this.menuService.curr_menu.url)
                    // console.log(menu2.url)

                    if (this.router.url.indexOf(menu2.url) > -1) {
                      menu2.selected = true
                    }

                  });
                }
              });
            }
            this.menuService.menu_has_names = menu_has_name;
            this.menuService.nodeKeyHasPid = nodekey_has_pid;

            if (this.menuService.menu_has_names[this.router.url]) {
              this.menuService.curr_menu = this.menuService.menu_has_names[this.router.url];
            }

            this.menus = this.menus.map(item => {
              if (item.children && item.children instanceof Array) {
                item.children.sort((a, b) => a.sort - b.sort)
              }
              return item
            }).sort((a, b) => a.sort - b.sort)
          }

        }
    });
    
    this.menuService.getMenu()

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // this.menuService.curr_menu = this.menuService.menu_has_names[event.url];
        // this.menuService.refreshMenu();
      }
      if (event instanceof ActivationEnd) {
        // console.log('6666')
        // console.log(event)
        // this.menuService.curr_menu = this.menuService.menu_has_names[event.url];
        this.menuService.refreshMenu();
      }
    });

    this.translate.get('DOCUMENT_TITLE').subscribe(res => {
      document.title = res;
    });

    this.menuService.getBacklog();
    
  }
  handleCancel(){
    this.is_read_contract=false
  }
  handleOk(){
    this.is_read_contract=false
  }
  changeAgree(){
    this.is_agree=!this.is_agree
  }
  closeWindow(){
    localStorage.setItem('user',JSON.stringify(this.user))
    this.is_read_contract=false
  }
}
