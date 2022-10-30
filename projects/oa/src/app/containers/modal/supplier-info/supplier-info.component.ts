import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { UploadService} from '../../../services/upload.service';
import { MenuService} from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-modal-supplier-info',
  templateUrl: './supplier-info.component.html',
  styleUrls  : ['./supplier-info.component.css']
})

export class SupplierInfoModalComponent implements OnInit {
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() submit: EventEmitter<any> = new　EventEmitter();
  @ViewChild('supplierInfo') supplierInfo: ElementRef;

  
  distance = {
    x: 0,
    y: 0
  }

  searchChange$ = new BehaviorSubject('');
  isOpen: Boolean = false;
  nzZIndex = 800;
  tabsetIndex = 0;
  loading = true;
  isSubmitLoading = false;
  isCpm = false;
  dataModal;
  qqUserList = [];
  styleList = [];
  contractList = [];
  qqUserData = {'is_add': true, 'qq': '', 'name': '', 'tel': '', 'email': '', 'role_1': false, 'role_2': false};
  requiredArr = [];
  where = { 'add': true, 'edit': false };
  formConfig = [
    {
      'key': 'name',
      'label': '供应商名称',
      'type': 'input',
      'required': true,
      'disabled': true,
      'showWhere': 'edit',
      'span': 6
    },
    {
      'key': 'city',
      'label': '所在城市',
      'type': 'input',
      'required': true,
      'span': 6
    },
    {
      'key': 'address',
      'label': '公司地址',
      'type': 'input',
      'required': true,
      'span': 12
    },
    {
      'key': 'area_type_text',
      'label': '区域',
      'type': 'input',
      'span': 6,
      'default': '',
    },
    {
      'key': 'type_text',
      'label': '是否个人',
      'type': 'input',
      'span': 6,
      'default': '',
    },
    {
      'key': 'status_text',
      'label': '可用状态',
      'type': 'input',
      'span': 6,
      'default': '',
    },
    {
      'key': 'invalid_date',
      'label': '失效日期',
      'type': 'date-picker',
      'required': false,
      'span': 6
    },
    {
      'key': 'sign_category_names',
      'label': '签约范围',
      'type': 'input',
      'required': false,
      'span': 24
    },
    {
      'key': 'remark',
      'label': '备注',
      'type': 'textarea',
      'required': false,
      'span': 24
    }
  ];
  optionSearchs = { 'vendor_id': [] };
  isSearchSelect = { 'vendor_id': false };
  constructor(
    private http: HttpClient,
    private message: MessageService,
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'supplier-info' && item['data']['id']) {
        this.isOpen = true;

        this.nzZIndex = item['zIndex'];
        this.supplierInfo['container']['overlayElement'].style.zIndex = this.nzZIndex;

        this.http.get('web/supplier/info-new', { params: { id: item['data']['id'], isContract: '1' }}).subscribe(result => {
          this.message.isAllLoading = false;
          if (result['code'] !== 0) {
            this.message.error(result['msg']);
            return false;
          } else {
            this.openModal(result['data']);
            // this.initData(result['data']);
            this.loading = false;
          }
        });
      }
    });
  }

  initData(item = {}) {
    this.isCpm = true;
    this.qqUserList = [];
    this.styleList = [];
    this.contractList = [];
    this.requiredArr = [];
    if (item['id']) {
      this.where = { 'add': false, 'edit': true };
    } else {
      this.where = { 'add': true, 'edit': false };
    }
    if (this.dataModal['userList']) {
      this.qqUserList = this.dataModal['userList'];
    }
    if (this.dataModal['onStyleList'] && Array.isArray(this.dataModal['onStyleList'])) {
      this.styleList = this.dataModal['onStyleList'];
    }
    if (this.dataModal['contractList'] && Array.isArray(this.dataModal['contractList'])) {
      this.contractList = this.dataModal['contractList'];
    }
    if (this.qqUserList.length === 0) {
      this.qqUserList.push(JSON.parse(JSON.stringify(this.qqUserData)));
    }
  }



  // 开打弹窗前先获取项目及预算
  openModal(item, tab = 0) {
    this.tabsetIndex = tab;
    this.dataModal = item;
    this.isSubmitLoading = false;
  }

  modalCancel() {
    this.isOpen = false;
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
       this.renderer.setStyle(this.supplierInfo['modalContainer']['nativeElement'].getElementsByClassName('ant-modal-content')[0], 'transform', translate)  
     }
   }
}
