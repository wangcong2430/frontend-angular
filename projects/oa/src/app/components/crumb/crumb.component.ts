import { Component, EventEmitter, Input, OnInit, Output,  ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NzModalService, NzMessageService, UploadXHRArgs } from 'ng-zorro-antd';
import { Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MenuService } from '../../services/menu.service';
import { MessageService } from '../../services/message.service';
import { UploadService } from '../../services/upload.service';
import { ModalService } from '../../services/modal.service';
import { CosService } from '../../services/cos.service';
import { from, of } from 'rxjs';
import { delay, concatMap } from 'rxjs/operators';

@Component({
  selector: 'app-component-crumb',
  templateUrl: './crumb.component.html',
  styleUrls: ['./crumb.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CrumbComponent implements OnInit {
  params;

  @Input() title = '';
  @Input() isChildren = false;

  @Input() isSetSecrecy = false;
  @Input() isCheckAll = true;
  @Input() isCheckReverse = true;
  @Input() importData = false;
  @Input() exportData = false;
  @Input() downloadData = {};

  // 是否批量下载附件
  @Input() isDownloadCheckFile = false;
  isLoadingCheckFile: Boolean = false;

  @Input() isDownloadCheckImage = false;
  isLoadingCheckImage: Boolean = false;

  @Input() disabled = true;

  @Input() list = [];

  @Output() listchange: EventEmitter<any> = new　EventEmitter();
  @Output() changeDisabledButton: EventEmitter<any> = new　EventEmitter();
  private destroy$ = new Subject<void>();

  constructor(
    public menuService: MenuService,
    private http: HttpClient,
    private modal: NzModalService,
    private message: MessageService,
    private msg: NzMessageService,
    public uploadService: UploadService,
    private router: Router,
    public cos: CosService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
  ) {
    this.menuService.menu$.pipe(takeUntil(this.destroy$)).subscribe(item => {
      this.cd.markForCheck();
    })
  }


  ngOnInit() {}


  // 全部展开、全部收起
  openOrCloseAll(bool = true) {
    const key = this.router.url + 'expand';
    const expand = sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)) : {};
    this.list.forEach(data => {
      data.expand = bool;
      expand[data.id] = data.expand;
    });
    sessionStorage.setItem(key, JSON.stringify(expand));
    this.cd.markForCheck();
  }

  // 表格全选
  checkAll(value: boolean): void {
    this.list.forEach(data => {
      data.checked = value;
      data.indeterminate = false;
      if (data.children) {
        data.children.forEach(data2 => data2.checked = value);
      }
      data.product_price = 0;
      data.brand_price = 0;
      if (data.indeterminate || data.checked) {
        if (data.children && data.children instanceof Array && data.children.some(item => item.checked)) {
          data.order_amount = data.children.filter(item => item.checked)
                                           .map(item => item.total_price)
                                           .reduce((total, num) => Number(total) + Number(num));

          if (data.children.some(item => item.checked && item.budget_type === '2')) {
            data.product_price = data.children.filter(item => item.checked && item.budget_type === '2')
                                              .map(item => item.total_price)
                                              .reduce((total, num) => Number(total) + Number(num));
          }

          if (data.children.some(item => item.checked && item.budget_type === '1')) {
            data.brand_price = data.children.filter(item => item.checked && item.budget_type === '1')
                                            .map(item => item.total_price)
                                            .reduce((total, num) => Number(total) + Number(num));
          }
        } else {
          data.order_amount = 0;
        }
      } else {
        data.order_amount = 0;
      }

      // 计算总金额
      if (data['children'] instanceof Array) {
        if (data['children'].length > 0 && data['children'].some(item => item.checked)) {
          if (typeof data['total_price_cny'] === 'number')  {
            data['content_order_amount'] = data.total_price_cny.toFixed(2) + 'CNY';
          } else {
            data['content_order_amount'] = data['children'].filter(item => item.checked).map(item => {
              if (typeof item.total_price_cny === 'number') {
                return Number(item.total_price_cny) + Number(item.tax_price_cny || 0);
              }
              return Number(item.total_price) +  Number(item.tax_price || 0);

            }).reduce((total, num) => Number(total) + Number(num));
            data['content_order_amount'] = data['content_order_amount'].toFixed(2) + (data['currency_symbol'] || 'CNY');
          }
        } else {
          data['content_order_amount'] = 0;
        }
      }
    });
    this.changeDisabledButton.emit(false);
    this.cd.markForCheck();
  }

  checkReverse(): void {
    this.list.forEach(data => {
      data.checked = !data.checked;
      if (data.children) {
        data.children.forEach(data2 => data2.checked = !data2.checked);
      }
      data.product_price = 0;
      data.brand_price = 0;
      if (data.indeterminate || data.checked) {
        if (data.children && data.children instanceof Array && data.children.some(item => item.checked)) {
          data.order_amount = data.children.filter(item => item.checked)
                                           .map(item => item.total_price)
                                           .reduce((total, num) => Number(total) + Number(num));
          if (data.children.some(item => item.checked && item.budget_type === '2')) {
            data.product_price = data.children.filter(item => item.checked && item.budget_type === '2')
                                              .map(item => item.total_price)
                                              .reduce((total, num) => Number(total) + Number(num));
          }
          if (data.children.some(item => item.checked && item.budget_type === '1')) {
            data.brand_price = data.children.filter(item => item.checked && item.budget_type === '1')
                                            .map(item => item.total_price)
                                            .reduce((total, num) => Number(total) + Number(num));
          }
        } else {
          data.order_amount = 0;
        }
      } else {
        data.order_amount = 0;
      }

      // 计算总金额
      if (data['children'] instanceof Array) {
        if (data['children'].length > 0 && data['children'].some(item => item.checked)) {
          if (typeof data['total_price_cny'] === 'number')  {
            data['content_order_amount'] = data.total_price_cny.toFixed(2) + 'CNY';
          } else {
            data['content_order_amount'] = data['children'].filter(item => item.checked).map(item => {
              if (typeof item.total_price_cny === 'number') {
                return Number(item.total_price_cny) + Number(item.tax_price_cny || 0);
              }
              return Number(item.total_price) +  Number(item.tax_price || 0);

            }).reduce((total, num) => Number(total) + Number(num));
            data['content_order_amount'] = data['content_order_amount'].toFixed(2) + (data['currency_symbol'] || 'CNY');
          }
        } else {
          data['content_order_amount'] = 0;
        }
      }
    });

    if (this.list.some(item => item.checked || item.indeterminate)) {
      this.changeDisabledButton.emit(false);
    } else {
      this.changeDisabledButton.emit(true);
    }
    this.cd.markForCheck();
  }

  beforeUploadImg = (file: File) => {
    const isLt2M = file.size / 1024 / 1024 < 100;
    if (!isLt2M) {
      this.message.error('文件必需小于100MB!');
    }
    return isLt2M;
  }

  customBigReq = (item: UploadXHRArgs) => {
    const id = this.msg.loading('附件正在上传..', { nzDuration: 0 }).messageId;
    this.uploadService.uploadBig(item, this.importData['key'], data => {
      this.msg.remove(id);
      const loadid = this.msg.loading('上传成功,数据正在打包中...', { nzDuration: 0 }).messageId;
      this.http.get('/web/upload-file/upload-switch',  {
        params: {
          type: this.importData['type'],
          file_id: data.id
        },
      }).subscribe(results => {
        this.msg.remove(loadid);
        if (results['code'] === 0) {
          this.listchange.emit({
            code: 0,
            msg: ''
          });
          if (results['type'] === 'model') {
            this.modal.create({
              nzTitle: '提示',
              nzContent: results['msg'],
              nzCancelText: null,
              nzClosable: false,
              nzOnOk: () => {}
            });
          } else {
            this.message.success(results['msg']);
          }
        } else {
          this.message.error(results['msg']);
        }
      }, (error) => {
        this.message.error('导入异常! 请稍后再试, 或联系管理员');
      });
    });
  }

  uploadChange ($event) {
    if ($event.file && $event.file.status === 'done') {
      const messageId = this.msg.loading('上传成功,数据正在打包中...', { nzDuration: 0 }).messageId;
      this.http.get('/web/upload-file/upload-switch',  {
        params: {
          type: this.importData['type'],
          file_id: $event.file.originFileObj.file_id
        },
      }).subscribe(results => {
        this.msg.remove(messageId);
        if (results['code'] === 0) {
          this.listchange.emit({code: 0, msg: ''});
          if (results['type'] === 'model') {
            this.modal.create({
              nzTitle: '提示',
              nzContent: results['msg'],
              nzCancelText: null,
              nzClosable: false,
              nzOnOk: () => {}
            });
          } else {
            this.message.success(results['msg']);
          }
        } else {
          this.message.error(results['msg']);
        }
      }, () => {
        this.message.error('导入异常! 请稍后再试, 或联系管理员');
      });
    }
  }

  // 下载附件
  downloadTemplate () {
    const id = this.msg.loading('正在下载附件..', { nzDuration: 0 }).messageId;
    this.http.get('/web/upload-file/download-switch', {
      params: {
        'type': this.importData['type'],
      },
      observe: 'response'
    }).subscribe(res => {
      this.msg.remove(id);
      if (res.body && res.body['code'] === -1) {
        this.msg.error(res.body['msg']);
      } else if (res.body['code'] === 0) {
        this.downloadFile('', res.body['data']);
      }
    }, err => {
      this.msg.remove(id);
      this.msg.success(err);
    });
  }

  // 在新窗口下载文件
  downloadFile (filename, url) {
    window.open(url, '_blank');
  }

  // 批量下载附件
  downloadCheckFile (type) {
    let ids, thing_ids;
    ids = this.list.filter(item => item.checked || item.indeterminate).map(item => item.id);
    thing_ids = this.list
      .filter(item => (item.checked || item.indeterminate) && item.children)
      .map(item => item.children.filter(res => res.checked).map(res => res.id))
      .reduce((a, b) => a.concat(b));
    this.http.post('/web/order/check-download', {
      type: type,
      id: ids,
      thing_id: thing_ids,
      class: this.router.url
    }).subscribe(res => {
      this.isLoadingCheckFile = false;
      this.isLoadingCheckImage = false;
      if (res['code'] === 0) {
        if (res['data']['attachmentList'] instanceof Array) {
          res['data']['attachmentList'].map(item => {
            this.downloadByid(item.id, item.file_name);
          });
        }
      } else {
        this.msg.error(res['msg']);
      }
    }, err => {
      this.msg.error(err);
      this.isLoadingCheckImage = false;
      this.isLoadingCheckFile = false;
    });
  }

  showSecrecyForm(init_secrecy,secrecys_detail,thing_ids){
    this.modalService.open('secrecy-form', {'init_secrecy':init_secrecy,'thing_ids':thing_ids,"secrecys_detail":secrecys_detail});
  }
  
    // 批量设置保密设置
    setSecrecy () {
      let thing_ids = [];
      for(let i of this.list){
          if(typeof(i.children) == 'undefined'){
              if(i.checked){
                thing_ids.push(i.id)
              }
          }else{
            for(let j of i.children){
              if(j.checked){
                thing_ids.push(j.id)
              }
            }
          }
      }
      if(thing_ids.length == 0){
        this.message.error('请选择物件');
        return;
      }
      this.http.post('web/thing-secrecy-list/check-bulk-things-secrecy', {
        thing_ids: thing_ids
      }).subscribe(result => {
          if(result['code'] != 0){
            this.message.error(result['msg']);
            return;
          }
          this.showSecrecyForm(result['data']['secrecy_codes'],result['data']['secrecys_detail'],thing_ids)
      });
    }



  // 下载预览图
  downloadPerview () {
    const things = this.list.filter(item => (item.checked || item.indeterminate) && item.children)
      .map(item => item.children.filter(res => res.checked))
      .reduce((a, b) => a.concat(b));

    if (!things.some(item => item['img'])) {
      this.message.error('当前所选物件没有预览图');
    }

    const arraySource =  from(things)
    const subscribe = arraySource.pipe(
      concatMap(item => of(item).pipe(delay(1000)))
    ).subscribe(item => {
      if (item['img'] && item['img'].split('/')[3] && item['img'] !== '/assets/images/pic-thumb-default.60.jpg') {
        this.downloadByid(item['img'].split('/')[3], item['file_name']);
      } else if (item['img'] !== '/assets/images/pic-thumb-default.60.jpg') {
        this.message.error('所选物件没有可下载的文件')
      }
    });
  }

  // 下载预览图
  downloadByid (id, name = null) {
    this.http.get('web/plupload/downloads', { params: {
      id: id
    }}).subscribe(res => {
      if (res['code'] === 0) {
        this.downloadImageByUrl(res['data']['url'], res['data']['fileName']); return

        if (res['data']['url'] && res['data']['url'].indexOf("cos.ap-guangzhou") != -1 ) {
          this.downloadImageByUrl(res['data']['url'], res['data']['fileName'])
        } else {
          this.downloadByUrl(res['data']['url'], res['data']['fileName'])
        }
      } else {
        this.message.error(res['msg']);
      }
    }, err => {
      this.message.error(err['msg']);
    });
  }

  downloadByUrl (url, name = null) {
    const eleLink = document.createElement('a');
    eleLink.download =  name ? name : 'file';
    eleLink.style.display = 'none';
    eleLink.href = url;
    eleLink.target = '_blank';
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
  }

  downloadImageByUrl (url, filename = null) {
    this.http.get(url, {
      responseType: "blob",
    }).subscribe(resp=>{
      var eleLink = document.createElement('a');
      eleLink.download = filename ? filename : '';
      eleLink.target = '_blank';
      eleLink.style.display = 'none';
      // 字符内容转变成blob地址
      var blob = new Blob([resp]);
      eleLink.href = URL.createObjectURL(blob);
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();
      // 然后移除
      document.body.removeChild(eleLink);
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
