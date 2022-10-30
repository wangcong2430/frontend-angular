import { EventEmitter, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { ModalService } from './modal.service'
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MenuService {
  menu_has_names;
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
  menus = null;

  menu$ = new Subject();

  constructor(
    private http: HttpClient,
    private modalService: ModalService
  ) {
  }

  // 获取待办数量
  getBacklog(auto = false) {
    this.http.get('web/user/backlog?auto=' + auto, ).subscribe(data => {
      if (data['code'].toString() === '0') {
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
          let data2 = {"data":data['bulletin'],'supplier_type':data['supplier_type']}
          this.modalService.open('bulletin', data2);
        }

        if (auto) {
          setTimeout(() => {
            this.getBacklog(auto);
          }, 180000);
        }
      }
    });
  }


  getMenu () {
    this.http.get('web/menu/curr-list').subscribe(result => {
      this.menus = result
      this.menu$.next(this.menus);
    }, err => {
      this.menu$.error(err);
    })
  }

  refreshMenu () {
    if (this.menus) {
      this.menu$.next(this.menus);
    }
  }
}
