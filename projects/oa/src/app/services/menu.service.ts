import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ModalService } from './modal.service';

@Injectable()
export class MenuService {
  menu_has_names;
  menus;
  // 当前菜单信息
  curr_menu = {
    icon: 'filter',
    parent_id: '',
    parent_name: '',
    id: '',
    name: '',
    url: '',
    node_key: ''
  };
  // 待办数量提示
  nodeKeyHasPid = {};
  parentNumber = {};
  backlogNumber = {};
  menu$ = new Subject();

  constructor(
    private http: HttpClient,
    private modalService: ModalService,
  ) {}

  // 获取待办数量
  getBacklog(auto = false) {
    this.http.get('web/user/backlog?auto=' + auto ).subscribe(data => {
      if (data['code'] === 0) {
        this.parentNumber = {};
        this.backlogNumber = {};

        data['data'].forEach(data2 => {
          if (this.nodeKeyHasPid[data2['current_workflow']]) {
            if (!this.parentNumber[this.nodeKeyHasPid[data2['current_workflow']]]) {
              this.parentNumber[this.nodeKeyHasPid[data2['current_workflow']]] = 0;
            }
            this.parentNumber[this.nodeKeyHasPid[data2['current_workflow']]] = parseFloat(data2['total'])
              + this.parentNumber[this.nodeKeyHasPid[data2['current_workflow']]];
          }
          if(data2['total'] === 0 || data2['total'] === '0'){
            return;
          }
          this.backlogNumber[data2['current_workflow']] = data2['total'];
        });

        if (data && data['bulletin'] && data['bulletin'].length > 0) {
          this.modalService.open('bulletin', data['bulletin']);
        }
        this.menu$.next();
        if (auto) {
          setTimeout(() => {
            this.getBacklog(auto);
          }, 180000);
        }
      }
    });
  }

  change () {
    this.menu$.next();
  }


  getMenu () {
    return Observable.create((observer) => {
      this.http.get('web/menu/curr-list').subscribe(result => {
        this.getBacklog(true);
        result = result['data'];
        if (Array.isArray(result)) {
            const menu_has_name = {};
            const nodekey_has_pid = {};
            this.menus = result;
            result.forEach( menu => {
              if (menu.children) {
                menu.children.forEach(menu2 => {
                  if (menu2['node_key'] && menu2['node_key'] !== '') {
                    nodekey_has_pid[menu2['node_key']] = menu['id'];
                  }

                  const url = JSON.parse(JSON.stringify(menu2['url']));
                  menu2['query'] = menu2['url'].indexOf('?') > -1 ? menu2['url'].split('?')[1].split('&').map(item => {
                    const data = {};
                    const key = item.split('=')[0];
                    data[key] = item.split('=')[1];
                    return data;
                  })[0] : {},
                  menu2['url'] = menu2['url'].indexOf('?') > -1 ? menu2['url'].split('?')[0] : menu2['url'],
                  menu_has_name[url] = {
                    'icon': menu['icon'],
                    'parent_id': menu['id'],
                    'parent_name': menu['name'],
                    'id': menu2['id'],
                    'name': menu2['name'],
                    'url': menu2['url'],
                    'query': menu2['query'],
                    'node_key': menu2['node_key'],
                  };
                });
              }
            });
            this.menu_has_names = menu_has_name;
            this.nodeKeyHasPid = nodekey_has_pid;

            this.menus = this.menus.map(item => {
              if (item.children && item.children instanceof Array) {
                item.children.sort((a, b) => a.sort - b.sort)
              }
              return item
            }).sort((a, b) => a.sort - b.sort)
        }
        observer.next(this.menus);
        this.menu$.next();
        observer.complete();
      });
    });
  }
}

