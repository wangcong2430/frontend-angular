import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { PriceDetailModalComponent } from '../modal/price-detail/price-detail.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { of, Observable } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { NzMessageService } from 'ng-zorro-antd';
import { UploadService } from '../../services/upload.service';
import { CosService } from '../../services/cos.service';

@Component({
  selector: 'app-container-table-group-new',
  templateUrl: './table-group-new.container.html',
  styleUrls: ['./table-group-new.container.css']
})

export class TableGroupNewContainer implements OnInit {
  @ViewChild('nestedTable') nestedTable: ElementRef;

  @ViewChild(PriceDetailModalComponent)
  public priceDetailModal: PriceDetailModalComponent;

  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() changeDisabledButton: EventEmitter<any> = new　EventEmitter();
  @Output() blurEvent: EventEmitter<any> = new　EventEmitter();
  @Output() clickEvent: EventEmitter<any> = new　EventEmitter();
  @Output() operateEvent1: EventEmitter<any> = new　EventEmitter();
  // 空数据状态
  @Input() nzNoResult;

  // loading
  @Input() loading;
  // 配置项
  @Input() columns = [];
  @Input() childrenColumns = [];
  // 数据列表
  @Input() list;
  allChecked = false;
  @Input() disabledButton = true;
  @Input() isChildrenDisabled = true;
  checkedNumber = 0;
  indeterminate = false;
  isExpand = true;
  expand   = {};
  // 分页
  @Input() pagination = {
    total_count: null,
    page_size: '10',
    page_index: '1',
  };
  datePipe = new DatePipe('zh-Hans');

  limitJPG = '';
  limit100M = '';
  limit10G = '';
  FileUploading = '';
  fileSuccess = '';
  fileFails = '';

  constructor(
    private modal: ModalService,
    private message: NzMessageService,
    private upload: UploadService,
    private http: HttpClient,
    private modalService: NzModalService,
    private translate: TranslateService,
    private cos: CosService
  ) {}

  paginationChange$ = new BehaviorSubject({});

  ngOnInit() {
    this.paginationChange$.pipe(skip(1), debounceTime(10)).subscribe(item => {
      this.getTableList();
    });

    this.translate.get('LIMIT_JPG').subscribe(result => {
      this.limitJPG = result;
    });

    this.translate.get('LIMIT_100M').subscribe(result => {
      this.limit100M = result;
    });

    this.translate.get('LIMIT_10G').subscribe(result => {
      this.limit10G = result;
    });

    this.translate.get('FILE_UPLOADING').subscribe(result => {
      this.FileUploading = result;
    });

    this.translate.get('FILE_SUCCESS').subscribe(result => {
      this.fileSuccess = result;
    });

    this.translate.get('FILE_FAILS').subscribe(result => {
      this.fileFails = result;
    });
  }
  ngOnChanges( ): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    //console.log(this.list)
    /* if(this.list.length>0){
      this.list = this.list.map((item) => {
        if (item.children && item.children.length > 0) {
          item.children = item.children.map((idm) => {
            if (idm.attribute_check && idm.attribute_check.length > 0) {
              idm.attribute_check = idm.attribute_check.filter((ixm) => {                    
                    return ixm.label_type==1&&ixm.is_show==1                                        
              })
            }
            return idm
          })
        }
        return item

      })
    } */
  }
  
  // 表格复选
  refreshStatus(notSet ?: boolean): void {
    let checkedNumber = 0;
    this.indeterminate = false;
    this.list.forEach(item => {
      if (item.children && item.children.filter(value => !value.disabled).length > 0) {
        if (notSet) {
          item.children.filter(value => !value.disabled).forEach(data => data.checked = item.checked);
        }
        if (item.children.filter(value => !value.disabled).length
              === item.children.filter(value => value.checked && !value.disabled).length) {
          item.checked = true;
        } else {
          item.checked = false;
        }


        // 全选
        const allChecked2 = item.children.filter(value => !value.disabled).every(value => value.checked === true);

        // 反选
        const allUnChecked2 = item.children.filter(value => !value.disabled).every(value => !value.checked);

        item.indeterminate = (!allChecked2) && (!allUnChecked2);
        checkedNumber = checkedNumber + item.children.filter(value => value.checked).length;
      }
      // 计算总金额
      if (item.children && item.children.length > 0) {
        if (item['children'].some(item => item.checked)) {
          item['content_order_amount'] = item['children'].filter(item => item.checked).map(item => {
            if (item.total_price_cny) {
              return Number(item.total_price_cny);
            }
            return Number(item.total_price);
          }).reduce((total, num) => Number(total) + Number(num)).toFixed(2) + " " + (item['currency_symbol'] || 'CNY');
        } else {
          item.content_order_amount = 0;
        }
      }
    });
    this.checkedNumber = checkedNumber;
    const flag = !(checkedNumber > 0);
    this.changeDisabledButton.emit(flag);
    this.isCheckAll();
  }

  refreshChildrenStatus(val, itemId) {
    this.refreshStatus(false);
  }

  isCheckAll() {
    const allChecked = this.list.every(value => value.checked === true);
    const allUnChecked = this.list.every(value => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = (!allChecked) && (!allUnChecked);
  }

  // 表格全选
  checkAll(value: boolean): void {
    this.list.forEach(data => data.checked = value);
    this.refreshStatus(true);
  }

  // 页码改变时
  pageIndexChange(page_index) {
    this.pagination.page_index = page_index;
    this.paginationChange$.next(this.pagination);
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size  = page_size;
    this.paginationChange$.next(this.pagination);
  }

  // 获取数据列表
  getTableList() {
    this.getList.emit(this.pagination);
  }

  // 获取失去焦点事件
  getBlurEvent(key, item, item2 = {}) {
    this.blurEvent.emit({key: key, item: item, parentItem: item2});
  }

  // 获取点击事件
  getClickEvent(key, item, img = false) {
    if (img) {
      this.modal.open('photo', {
        title: item.thing_name,
        url: item.img,
      });
    } else {
      this.clickEvent.emit({key: key, item: item});
    }
  }

  // 操作按钮
  operate1(key, item) {
    this.operateEvent1.emit({key: key, item: item});
  }

  // 显示展开按钮
  expandChange($event, data) {
    data.expand = !data['expand'];
    this.expand[data.id] = !$event;
  }

  // 显示明细
  showPriceDetail(item, key) {
    this.priceDetailModal.openModal(item, key);
  }

  listDataChange() {
    if (this.list) {
      this.list.forEach(data => {
        this.expand[data.id] = this.isExpand;
      });
    }
  }
  // 承诺日期小于当前日期标红
  isRedDate(date) {
    if (!date) {
      return false;
    }
    date = new Date(Date.parse(date .replace(/-/g, '/')));
    const curDate = new Date();
    if (date <= curDate) {
      return true;
    }
    return false;
  }

  // 预览图片
  preview (url, name = null) {
    console.log(url)
    this.modal.open('photo', {
      title: name,
      url: url
    });
  }



  uploadClick(event, data) {
    if(data.is_ihub_upload === '1') {
      this.clickEvent.emit({ key: 'uplaodClick', item: data })
      event.preventDefault()
    }
    event.stopPropagation();
  }

  beforeUploadFile = (file: File) => {
    // console.log()
    // const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');

    // const  isLt2M = file.size  < 1024 * 1024 * 24;
    // if (isJPG && !isLt2M) {
    //   this.message.error('JPG/PNG 等预览图片大小不超过32MB、宽高不超过30000像素且总像素不超过2.5亿像素!');
    //   return false;
    // }

    // const fileTypes = ['jpg', 'gif', 'png', 'psd', 'ai', 'jpeg',
    //     'bmp', 'doc', 'docx', 'xls', 'xlsx', 'ppt',
    //     'pptx', 'pdf', 'zip', '7z', 'tga', 'rar', 'mp3',
    //     'mp4', 'mov', 'wmv', 'avi', 'swf', 'fla', 'wav',
    //     'ogg', 'aif', 'aiff', 'flac', 'caf', 'mpg', 'mpeg', 'wma', 'eml', 'txt'];
    // const fileNames = file.name.split('.');
    // const isFILE = fileTypes.some(type => fileNames[fileNames.length - 1] == type);
    // if (!isFILE) {
    //   this.message.error(file.name + `格式不对，格式要求：jpg,gif,png,psd,ai,jpeg,bmp,doc,docx,xls,xlsx,ppt,
    //   pptx,pdf,zip,7z,tga,rar,mp3,mp4,mov,wmv,avi,swf,fla,wav,ogg,aif,aiff,flac,caf,mpg,mpeg,wma`);
    // }
    // const isLt10G = file.size < 1024 * 1024 * 1024 * 10;
    // if (!isLt10G) {
    //   this.message.error(file.name + this.limit10G);
    //   return false
    // }
    return true;
  }

  beforeUploadImg = (file: File) => {
    // const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
    // if (!isJPG) {
    //   this.message.error(this.limitJPG );
    // }
    const isLt100M = file.size / 1024 / 1024 < 25;
    if (!isLt100M) {
      this.message.error(this.limit100M );
    }
    return /* isJPG &&  */isLt100M;
  }

  customBigReq = (item) => {
    this.upload.uploadBig(item, null, data => {
      console.log(data);
    });
  }


  fileUploadChange ($event, data, column) {
    if ($event.type === 'success') {
      if ($event.file.status === 'done') {
        $event.fileList.forEach(item => {
          if (item.uid === $event.file.uid) {
            item.url = 'https://' + $event.file.response.Location;
            item.id = item.originFileObj.id;
          }
        });
      }
    } else if ($event.type === 'removed' && $event.file.originFileObj && $event.file.originFileObj.taskId) {
      this.cos.cancelTask($event.file.originFileObj.taskId);
    } else if($event.type === 'error'){
      data[column].pop(0);
    }
  }

  onDatePickerChange(date, data, key) {
    data[key] = this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  uploadPreview = (item) => {
    let url = item.url
    if (item.response && item.response.url) {
      url = item.response.url
    }
    return this.modal.open('photo', {
      title: item,
      url: url,
      type: item.type
    });
  }

  moveX = null

  dragstart($event) {
    this.moveX = null
  }  
  dragmove($event) {
    if (this.moveX) {
      this.nestedTable['tableBodyElement'].nativeElement.scrollLeft -= ($event.pointerPosition.x - this.moveX)
      this.moveX = $event.pointerPosition.x
    } else {
      this.moveX = $event.pointerPosition.x
    }
  }


  uploadDel = (item) =>  this.modalService.create({
    nzTitle: '提示',
    nzContent: '确认删除文件' + item.name,
    nzClosable: false,
    nzOnOk: () => new Promise((resolve, reject) => {
      if (item.id || item.originFileObj.file_id) {
        this.http.post('web/thing/del-thing-file', {file_id: item.id || item.originFileObj.file_id})
        .subscribe(results => {
          if (results['code'] === 0) {
            this.message.success(results['msg']);
            resolve(true);
          } else {
            this.message.error(results['msg']);
            resolve(false);
          }
        }, err => {
          this.message.error(err['msg']);
          resolve(false);
        });
      } else {
        resolve(true);
      }
    })
  }).afterClose

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}

