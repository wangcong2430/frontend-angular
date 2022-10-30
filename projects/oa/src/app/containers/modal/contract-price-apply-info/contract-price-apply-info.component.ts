import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-contract-price-apply-info',
  templateUrl: './contract-price-apply-info.component.html',
  styleUrls  : ['./contract-price-apply-info.component.css']
})

export class ContractPriceApplyInfoModalComponent implements OnInit {
  @ViewChild('contractDetail') contractDetail: ElementRef;
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() submit: EventEmitter<any> = new　EventEmitter();

  searchChange$ = new BehaviorSubject('');
  isOpen: Boolean = false;
  nzZIndex = 800;
  tabsetIndex = 0;
  loading = true;
  isSubmitLoading = false;
  contractInfo = {};
  oldContract = {};
  is_show_apply = false;
  apply_id = '';

  optionSearchs = { 'vendor_id': [] };
  isSearchSelect = { 'vendor_id': false };
  constructor(
    private http: HttpClient,
    private message: MessageService,
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'contract-price-apply-info' && item['data']['id']) {
        this.isOpen = true;
        this.nzZIndex = item['zIndex'];

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
    // 数据初始化
    this.tabsetIndex = tab;
    this.isSubmitLoading = false;
    this.contractInfo = {};
    this.oldContract = {};
    this.is_show_apply = item['is_show_apply'] || false;
    this.apply_id = item['id'] || '';

    // 获取合同信息
    this.getContractApplyInfo();
  }

  modalCancel() {
    this.isOpen = false;
  }

  modalSubmit(type = 'pass') {
    if (this.apply_id && !this.isSubmitLoading) {
      this.isSubmitLoading = true;
      this.http.post('web/contract/contract-approval-submit', {id: this.apply_id, type: type} ).subscribe(result => {
        this.isSubmitLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.modalService.complete('contract-price-apply-info', {code: '0'});
        this.modalCancel();
      }, () => {
        this.isSubmitLoading = false;
      });
    }
  }

  modalDel() {
    if (this.apply_id && !this.isSubmitLoading) {
      this.isSubmitLoading = true;
      this.http.post('web/contract/contract-apply-del', {id: this.apply_id} ).subscribe(result => {
        this.isSubmitLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.modalService.complete('contract-price-apply-info', {code: '0'});
        this.modalCancel();
      }, () => {
        this.isSubmitLoading = false;
      });
    }
  }

  // 获取合同信息
  getContractApplyInfo() {
    this.loading = true;
    this.http.get('web/contract/contract-apply-info', { params: {
      id: this.apply_id + ''
    }}).subscribe(result => {
      this.loading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.contractInfo = result['data']['apply'] || {};
      this.oldContract  = result['data']['contract'] || {};
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
}
