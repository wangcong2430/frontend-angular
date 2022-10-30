import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-contract-price-info',
  templateUrl: './contract-price-info.component.html',
  styleUrls  : ['./contract-price-info.component.css']
})

export class ContractPriceInfoModalComponent implements OnInit {
  @ViewChild('contractDetail') contractDetail: ElementRef;
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() submit: EventEmitter<any> = new　EventEmitter();

  searchChange$ = new BehaviorSubject('');
  isOpen: Boolean = false;
  nzZIndex = 800;
  tabsetIndex = 0;
  loading = true;
  isSubmitLoading = false;
  dataModal;
  contractInfo = {};
  oldContract = {};
  is_show_apply = false;
  iomc_url = '';

  optionSearchs = { 'vendor_id': [] };
  isSearchSelect = { 'vendor_id': false };

  distance = {
    x: 0,
    y: 0
  }

  constructor(
    private http: HttpClient,
    private message: MessageService,
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    private renderer: Renderer2

  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'contract-price-info' && item['data']['id']) {
        this.isOpen = true;
        this.nzZIndex = item['zIndex'];
        this.contractDetail['container']['overlayElement'].style.zIndex = this.nzZIndex;
        this.initModal(item['data']);
      }
    });
  }

  // 获取数据列表
  getTableList() {
    this.getList.emit();
  }

  // 开打弹窗前先获取项目及预算
  initModal(item, tab = 0) {
    this.tabsetIndex = tab;
    this.dataModal = item;
    this.isSubmitLoading = false;
    this.contractInfo = {};
    this.oldContract = {};
    // 合同ID
    // 获取合同信息
    this.getContractInfo(item['id']);
  }

  modalCancel() {
    this.isOpen = false;
  }

  modalSubmit(type = 'pass') {
    if (this.dataModal.contract_apply_id) {
      this.isSubmitLoading = true;
      this.http.post('web/contract/contract-approval-submit', {id: this.dataModal.contract_apply_id, type: type} ).subscribe(result => {
        this.isSubmitLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.modalCancel();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
      });
    }
  }

  // 获取合同信息
  getContractInfo(id) {
    this.loading = true;
    this.http.get('web/contract/contract-info', { params: {
      id: id
    }}).subscribe(result => {
      this.loading = false;
      if (result['code'] == 0) {
        this.contractInfo = result['data']['info'];
        this.iomc_url = result['data']['info']['iomc_url'];
      } else {
        this.message.error(result['msg']);
      }
    }, () => {
      this.message.error('网络异常, 请联系管理员');
    });
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
    return item && item.id ? item.id : index; // or item.id
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
       this.renderer.setStyle(this.contractDetail['modalContainer']['nativeElement'].getElementsByClassName('ant-modal-content')[0], 'transform', translate)
     }
   }
}
