import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef,  ChangeDetectionStrategy, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UploadXHRArgs} from 'ng-zorro-antd';
import { MessageService } from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { filter } from 'rxjs/operators';
import { CosService } from '../../../services/cos.service';

@Component({
  selector: 'app-modal-new-order-detail',
  templateUrl: './new-order-detail.component.html',
  styleUrls  : ['./new-order-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NewOrderDetailModalComponent implements OnInit {
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @ViewChild('orderDetail') orderDetail: ElementRef;

  isOpen = false;
  tabsetIndex = 0;
  nzZIndex = 800;
  isChngeThing = false;
  loading = false;
  isSubmitLoading = false;
  id = null;
  info = {};
  fileList = [];
  quoteList = {
    list: [],
    columns: [],
  };
  attachment = {
    list: {},
    columns: [],
    columns2: []
  };
  remarkModalData = {
    submitLoading: false,
    isShow: false,
    remark: '',
    file_id: '',
    file_name: '',
    fileList: []
  };
  changeData = {
    changeLoading: false,
    changeList: [],
    changeColumns: [],
    changePagination: {},
    quoteLoading: false,
    quoteList: [],
    quoteColumns: [],
    quotePagination: {},
    remarkLoading: false,
    remarkList: [],
    isAddRemark: '',
    remarkColumns: [],
    remarkPagination: {},
  };
  uploadModal = {
    isShow: false,
    percent: 0,
    msg: ''
  };
  syncModal = {
    isShow: false,
    list: [],
    isRecommend: false,
    onList: []
  };
  data: any[] = [];

  distance = {
    x: 0,
    y: 0
  }

  // 添加备注
  remark = null;
  isRemarkVisible = false;
  file_id = '';
  remark_list = [];
  thing_list = [];

  constructor(
    private http: HttpClient,
    private message: MessageService,
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    public cos: CosService,
    private cd: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.modalService.modal$.pipe(filter(item => {
      return item && item['key'] === 'order' && item['data']['id'];
    })).subscribe(item => {
      this.isOpen = true;
      this.nzZIndex = item['zIndex'];
      this.orderDetail['container']['overlayElement'].style.zIndex = this.nzZIndex;
      this.isSubmitLoading = false;
      this.id = item['data']['id'];
      this.info = {};
      this.loading = true;
      this.cd.markForCheck();
      this.getInfo(this.id);
    });
  }

  modalCancel() {
    this.isOpen = false;
    if (this.isChngeThing) {
      this.getList.emit();
    }
  }

  // 初始化数据
  getInfo(id) {
    this.http.get('web/order/order-detail', { params: {
      order_id: id
    }}).subscribe(results => {
      this.loading = false;
      if (results['code'] === 0 && results['data']) {
        this.info = results['data'];
        this.thing_list = results['data']['thing_list'] ? results['data']['thing_list']  : [];
        this.remark_list = results['data']['purchase_manager_remark_list'] ? results['data']['purchase_manager_remark_list']  : [];
      }
      this.cd.markForCheck();
    });
  }

  // 标签页选中
  tabsetChange(value) {
    if ('changeData' === value) {
      this.getChangeList();
      this.getQuiteList();
      this.getRemarkList();
    }
  }

  // 获取数据列表
  getChangeList() {
    this.changeData.changeList = [];
    this.changeData.changeLoading = true;
    this.cd.markForCheck();
    this.http.get('web/thing/change-list', { params: {
      id: this.id
    }}).subscribe(result => {
      this.changeData.changeLoading = false;
      this.changeData.changeList    = result['list'];
      this.changeData.changeColumns = result['columns'];
      this.cd.markForCheck();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }
  getQuiteList() {
    this.changeData.quoteLoading = true;
    this.changeData.quoteList = [];
    this.cd.markForCheck();
    this.http.get('web/thing/quote-list', { params: {
      id: this.id
    }}).subscribe(result => {
      this.changeData.quoteLoading  = false;
      this.changeData.quoteList     = result['list'];
      this.changeData.quoteColumns  = result['columns'];
      this.cd.markForCheck();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }
  getRemarkList() {
    this.changeData.remarkLoading = true;
    this.changeData.remarkList = [];
    this.cd.markForCheck();
    this.http.get('web/thing/remark-list', { params: {
      id: this.id
    }}).subscribe(result => {
      this.changeData.remarkLoading  = false;
      if (result['code'] === 0) {
        this.changeData.remarkList     = result['list'];
        this.changeData.isAddRemark    = result['isAddRemark'] ? result['isAddRemark'] : '';
        this.changeData.remarkColumns  = result['columns'];
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, err => {
      this.message.error(err['msg']);
      this.cd.markForCheck();
    });
  }

  // 添加物件备注
  addThingRemarkModal() {
    this.remarkModalData.isShow = true;
    this.remarkModalData.submitLoading = false;
    this.remarkModalData.remark = '';
    this.remarkModalData.file_id = '';
    this.remarkModalData.fileList = [];
    this.cd.markForCheck();
  }

  addThingRemarkModalOk() {
    if (this.remarkModalData.remark === '' || this.remarkModalData.remark.length === 0) {
      this.message.error('备注信息不能为空');
      return;
    }
    if (this.remarkModalData.fileList.length > 0) {
      this.remarkModalData.fileList.forEach(data => {
        if (data['id']) {
          this.remarkModalData.file_id = data['id'];
        }
      });
    }
    this.remarkModalData.submitLoading = true;
    this.cd.markForCheck();
    this.http.post('web/thing/add-thing-remark', {
      id : this.id,
      remark : this.remarkModalData.remark,
      file_id : this.remarkModalData.file_id
    }).subscribe(results => {
      this.remarkModalData.submitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.addThingRemarkModalCancel();
      this.getRemarkList();
      this.cd.markForCheck();
    });
  }
  addThingRemarkModalCancel() {
    this.remarkModalData.isShow = false;
    this.cd.markForCheck();
  }

  getAttachmentList() {
    this.http.get('web/thing/attachment-list', { params: {
      id: this.id
    }}).subscribe(results => {
      this.attachment.list['1000']   = results['data'][1000] ? results['data'][1000] : [];
      this.attachment.list['1005']   = results['data'][1005] ? results['data'][1005] : [];
      this.attachment.list['1010']   = results['data'][1010] ? results['data'][1010] : [];
      this.cd.markForCheck();
    });
  }



  cancelRemarkModel () {
    this.isRemarkVisible = false;
    this.cd.markForCheck();
  }


  addRemark () {
    this.isRemarkVisible = true;
    this.cd.markForCheck();
  }


  submitRemarkModel () {
    if (!this.remarkModalData.remark) {
      this.message.error('请填写备注');
      return;
    }
    this.cd.markForCheck();
    this.http.post('web/order/add-order-remark', {
      id: this.id,
      remark: this.remarkModalData.remark,
      file_id: this.remarkModalData.fileList.length > 0 ? this.remarkModalData.fileList[0].id : null
    }).subscribe(results => {
      if (results['code'] === 0 || results['code'] === 1) {
        this.message.success(results['msg']);
        this.getInfo(this.id);
        this.isRemarkVisible = false;
        this.cd.markForCheck();
      } else {
        this.message.error(results['msg']);
        this.cd.markForCheck();
      }
    });
  }

  // 显示明细
  showDetail (item, $event) {
    $event.stopPropagation();
    const pre_produce_breakdown = JSON.parse(item.pre_produce_breakdown);
    this.modalService.open('price-detail', {
      item: item,
      key: 'produce_breakdown',
      showCountPrice: true,
      workLoadInfo: pre_produce_breakdown
    });
    this.cd.markForCheck();
  }

  uploadRemarkChange ($event) {
    if ($event.file && $event.file.status === 'done') {
      this.remarkModalData.fileList = [];
      this.remarkModalData.fileList.push({
        id: $event.file.originFileObj.file_id,
        name: $event.file.name,
        status: 'done',
      });
      this.cd.markForCheck();
    }
  }

  openSupplierInfo (id) {
    this.openModal('supplier-info', id)
  }

  openContractInfo(id) {
    this.openModal('contract-price-info', id)
  }

  openThingInfo (id) {
    this.openModal('thing', id)
  }

  openModal (type = '', id = '') {
    if (type && id) {
      this.modalService.open(type, {
        id: id
      })
    }
  }

  trackByFn(index, item) {
    return item.id ? item.id : index; // or item.id
  }

  dragStarted($event: any) {
    
  }
 
   dragEnded ($event: any) {
 
   }
 
   dragMove ($event: any) {
     if ($event.event) {
       this.distance.x += $event.event.movementX
       this.distance.y += $event.event.movementY
   
       let translate = `translate3d(${this.distance.x}px, ${this.distance.y}px, 0px)`
       this.renderer.setStyle(this.orderDetail['modalContainer']['nativeElement'].getElementsByClassName('ant-modal-content')[0], 'transform', translate)  
     }
   }
}
