import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ModalService } from '../../../../../services/modal.service';
import { MessageService } from '../../../../../services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../services/language.service';

@Component({
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})

export class SystemComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    private message: MessageService,
    public translate: TranslateService,
    public language: LanguageService
  ) {
    this.translate.use(this.language.language);
  }

  isBulletinVisible = false;

  initLoading = true; // bug
  loadingMore = false;

  // 加载中
  loading = false;
  // 全部加载完毕
  loadAll = false;
  loaded =  false;
  // 是否有数据
  isData = false;

  queryFields = [];
  data: any[] = [];
  list: Array<{ loading: boolean; name: any }> = [];
  can = false;

  page_index: '0';

  bulletinObj: {};
  bulletinList: any[] = [];
  topList = [];
  supplier_type = '';

  ngOnInit() {
    this.getData();
  }

  getData (title = '') {
    this.initLoading = true;
    this.loading = true;
    forkJoin(
      this.http.get('web/bulletin/config'),
      this.http.get('web/bulletin/list', {params: {'is_top': '1', title: title,'type':'3'}}),
      this.http.get('web/bulletin/list', {params: {page_index: '1', page_size: '20', title: title,'type':'3'}}),
    ).subscribe(item => {

    const [config, topList, bulletinList] = item;
    this.topList = topList['list'];
    this.supplier_type = topList['supplier_type'];
    if (Number(bulletinList['pager']['itemCount']) || Number(topList['pager']['itemCount'])) {
      this.isData = true;
    }

    if (bulletinList['code'] === 0) {
      if (Array.isArray(this.queryFields) && this.queryFields.length == 0) {
        this.queryFields = config['form'];
      }
      this.bulletinObj = bulletinList['list'];
      this.page_index = bulletinList['pager']['page'];
      this.bulletinList = this.getObject(this.bulletinObj);

      if (Number(bulletinList['pager']['page']  * Number(bulletinList['pager']['pageSize']) > Number(bulletinList['pager']['itemCount']))) {
        this.loaded = true;
        this.loadAll = true;
      }
    }
    this.can = bulletinList['can'];
    this.initLoading = false;
    this.loading = false;
  });
  }

  getObject(object) {
    const values = [];
    for (const property in object) {
      if (property) {
        values.push({
          year: property,
          children: object[property]
        });
      }
    }
    return values.sort((a, b) => b.year - a.year)
  }

  onLoadMore(): void {
    this.loadingMore = true;
    this.loading = true;
    this.http.get('web/bulletin/list', {params: {
      page_index: (Number(this.page_index) + 1).toString(),
      page_size: '20',
      type:'3'
    }}).subscribe((res: any) => {
      if (res.code === 0) {
        for (let item in res.list) {
          if (Object.getOwnPropertyDescriptor(this.bulletinObj, item) && res.list[item].length > 0) {
            this.bulletinObj[item] = this.bulletinObj[item].concat(...[res.list[item]])
          } else {
            this.bulletinObj[item] = res.list[item];
          }
        }
        this.bulletinList = this.getObject(this.bulletinObj);
        this.page_index = res.pager.page;

        if (Number(res['pager']['page']  * Number(res['pager']['page']) < Number(res['pager']['itemCount']))) {
          this.loaded = true;
          this.loadAll = true;
        }
      }
      this.loading = false;
      this.loadingMore = false;
    });
  }
  //点击报名
  onSignup(id,is_external_link,external_link,index){
    console.log("ceshi",id,is_external_link,external_link,index)
    if(is_external_link){
      window.open(external_link)
      this.topList[index].is_sign_up_button= false
    }else{
      this.http.get('web/bulletin/sign-up?id='+id).subscribe(res=>{
        if(res['code']==0){
          this.message.success(res['msg'])
          this.topList[index].is_sign_up_button= false
        }else{
          if(res['code']==-2){
            this.topList[index].is_sign_up_button= false
          }
          this.message.error(res['msg'])
        }
      })
    }
    
  }
  viewMore (data, isVisible) {
    data.showMore = isVisible;
    data.is_read = '1';
    if (!(data.bulletinBrowsingHistory && data.bulletinBrowsingHistory.id)) {
      this.http.post('/web/bulletin-browsing-history/add', {
        bulletin_id: data.id
      }).subscribe((res: any) => {
      });
    }
  }

  simplify (html) {
    if (!html) {
      return ''
    }

    let value = html.replace(/<[^>]+>/g, '').replace(/(&nbsp;)*/g, "")
    return value.length > 120 ?  value.slice(0, 120) + '...' : value;
  }

  submitSearchForm(data): void {
    if (data['code'] === 0) {
      this.getData(data['value']['title']);
    }
  }

  preview ($event, data = {}) {
    $event.stopPropagation();
    this.modalService.open('photo', {
      title: data['uploadFile']['file_name'],
      url: data['uploadFile']['file_path'] ? data['uploadFile']['file_path'] : '/web/file/1491'
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
