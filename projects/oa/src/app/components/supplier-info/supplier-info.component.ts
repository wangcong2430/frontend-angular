import {Component, EventEmitter, OnInit, Output, ViewChild, ElementRef, Input} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import {FormBuilder} from '@angular/forms';
import {formatDate} from '@angular/common';

import { MessageService } from '../../services/message.service';
import { UploadService } from '../../services/upload.service';
import { MenuService } from '../../services/menu.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-supplier-info-detail',
  templateUrl: './supplier-info.component.html',
  styleUrls  : ['./supplier-info.component.css']
})

export class SupplierInfoComponent implements OnInit {
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() submit: EventEmitter<any> = new　EventEmitter();

  @Input() dataModal: Object = {};
  @ViewChild('supplierInfo') supplierInfo: ElementRef;

  searchChange$ = new BehaviorSubject('');
  isOpen: Boolean = false;
  nzZIndex = 800;
  loading = true;
  isSubmitLoading = false;
  isEditContract = false;
  isEditSupplier = false;
  qqUserList = [];
  styleList = [];
  labelList = [];
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
      'span': 5
    },
    {
      'key': 'city',
      'label': '所在城市',
      'type': 'input',
      'required': true,
      'span': 5
    },
    {
      'key': 'address',
      'label': '公司地址',
      'type': 'input',
      'required': true,
      'span': 14
    },
    {
      'key': 'area_type_text',
      'label': '区域',
      'type': 'input',
      'span': 5,
      'default': '',
    },
    {
      'key': 'type_text',
      'label': '是否个人',
      'type': 'input',
      'span': 5,
      'default': '',
    },
    {
      'key': 'status_text',
      'label': '可用状态',
      'type': 'input',
      'span': 5,
      'default': '',
    },
    {
      'key': 'invalid_date',
      'label': '失效日期',
      'type': 'date-picker',
      'required': false,
      'span': 5
    },
    {
      'key': 'is_online_text',
      'label': '是否支持在线',
      'type': 'input',
      'required': true,
      'span': 4
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

  // addSupplierUser

  supplierUserModal = {
    isVisible: false,
    list: [],
    isOkLoading: false
  }

  supplierUserModalCancel () {
    this.supplierUserModal.isVisible = false;
  }

  supplierUserModalOk () {
    if (this.supplierUserModal.list.some(item => !item.name || !item.email)) {
      this.supplierUserModal.list.map(item => {
        if (!item.name || !item.email) {
          this.message.error('请补充' + item.qq + '的姓名/邮箱/角色')
        }
      })
      return
    }

    this.supplierUserModal.isOkLoading = true;
    this.http.post('web/supplier/save-old-user', {
      id: this.dataModal['id'],
      userList: this.supplierUserModal.list
    }).subscribe(result => {
      this.supplierUserModal.isOkLoading = false;
      if (result['code'] === 0) {
        this.supplierUserModal.list = result['data']['user_list']
        this.supplierUserModal.isVisible = false;
        this.getNewSupplierInfo();
      } else {
        this.message.error(result['msg'])
      }
    }, (err) => {
      this.supplierUserModal.isOkLoading = false;
      this.message.error('网络异常，请稍后再试');
      this.message.error(err['msg'])
    });
  }

  getNewSupplierInfo () {
    this.http.get('web/supplier/get-all-user-list', {
      params: {
        supplier_id: this.dataModal['id']
      }
    }).subscribe(result => {
      if (result['code'] === 0) {
        this.qqUserList = result['data']['user_list'];
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  addSupplierUser () {
    const messageId = this.message.loading('数据获取中...', { nzDuration: 0 }).messageId
    this.http.get('web/supplier/get-old-user-list', {
      params: {
        supplier_id: this.dataModal['id']
      }
    }).subscribe(result => {
      if (result['code'] === 0) {
        this.message.remove(messageId);
        this.supplierUserModal.list = result['data']['user_list']
        this.supplierUserModal.isVisible = true;
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.remove(messageId);
    });
  }

  // 添加一行
  addTableRow() {
    this.supplierUserModal.list = [...this.supplierUserModal.list, {
        email: "",
        id: "",
        name: "",
        nickname: "",
        qq: "",
        role_1: false,
        role_2: false,
        tel: "",
        username: "",
    }]
  }
  
  delTableRow(type, index) {
    if (type === 1) {
      if (this.supplierUserModal.list.length === 1) {
        this.message.error('最少保留一行');
        return false;
      }
      this.supplierUserModal.list.splice(index, 1);
    }
  }

  constructor(
    private http: HttpClient,
    private message: MessageService,
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.initData(this.dataModal);
    this.modalService.complete$
      .pipe(filter(item => item && (item['key'] === 'create-supplier' || item['key'] === 'create-contract')))
      .subscribe(item => {
      this.getTableList();
    });
  }


  // 获取数据列表
  getTableList() {
    this.getList.emit();
  }

  initData(item = {}) {
    this.qqUserList = [];
    this.styleList = [];
    this.labelList = [];
    this.contractList = [];
    this.requiredArr = [];
    this.isEditContract = this.dataModal['isEditContract'] || 0;
    this.isEditSupplier = this.dataModal['isEditSupplier'] || 0;
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
    if (this.dataModal['onLabelList'] && Array.isArray(this.dataModal['onLabelList'])) {
      this.labelList = this.dataModal['onLabelList'];
    }
    if (this.dataModal['contractList'] && Array.isArray(this.dataModal['contractList'])) {
      this.contractList = this.dataModal['contractList'];
    }
    if (this.qqUserList.length === 0) {
      this.qqUserList.push(JSON.parse(JSON.stringify(this.qqUserData)));
    }
  }


  modalCancel() {
    this.isOpen = false;
  }


  // 点击事件
  clickEvent($event, item) {
    // return
    let obj = {}
    if (item['flow_step'] && (item['flow_step'].toString() === '0' || item['flow_step'].toString() === '5')) {
      obj = { id: item['id']};
      this.modalService.open('contract-price-apply-info', obj);
    } else if (item['is_apply_step'] && item['is_apply_step'].toString() === '1') {
      obj = { id: item['apply_id']};
      this.modalService.open('contract-price-apply-info', obj);
    } else {
      obj = { id: item['id'] }
      this.modalService.open('contract-price-info', obj);
    }
  }



  modalSubmit() {
    let isError, params;
    isError = false;
    // 验证必填项
    this.requiredArr.forEach(data => {
      if (!this.dataModal[data.field] || this.dataModal[data.field] === '') {
        this.message.error(data.label + '不能为空');
        isError = true;
        return false;
      }
    });
    // 人员信息必填项检测
    this.qqUserList.forEach((data, index) => {
      if (!data['qq'] || data['qq'] === '') {
        this.message.error('人员信息，第' + (index + 1) + '行：qq 不能为空');
        isError = true;
        return false;
      }
      if (!data['name'] || data['name'] === '') {
        this.message.error('人员信息，第' + (index + 1) + '行：姓名 不能为空');
        isError = true;
        return false;
      }
      if (!data['email'] || data['email'] === '') {
        this.message.error('人员信息，第' + (index + 1) + '行：邮箱 不能为空');
        isError = true;
        return false;
      }
      if (!data['role_1'] && !data['role_2']) {
        this.message.error('人员信息，第' + (index + 1) + '行：角色 不能为空');
        isError = true;
        return false;
      }
    });
    if (isError) {
      return false;
    }
    let styleIds, labelIds;
    styleIds = [];
    this.styleList.forEach(data => {
      data['styleList'].forEach(data2 => {
        data2['children'].forEach(data3 => {
          if (data3['checked']) {
            styleIds.push(data3['value']);
          }
        });
      });
    });
    labelIds = [];
    this.labelList.forEach(data => {
      data['children'].forEach(data3 => {
        if (data3['checked']) {
          labelIds.push(data3['value']);
        }
      });
    });

    params = {
      ...this.dataModal,
      'userList': this.qqUserList,
      'styleIds': styleIds,
      'labelIds': labelIds
    };
    this.http.post('web/supplier/save-new', params).subscribe(results => {
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.modalCancel();
      this.getTableList();
    }, (err) => {
      this.isSubmitLoading = false;
    });
  }

  // 修改CP
  updateSupplier() {
    this.message.isAllLoading = true;
    this.http.get('web/supplier/info-new', { params: {id: this.dataModal['id']} }).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.modalService.open('create-supplier', result['data']);
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  copySupplier () {

  }

  // 修改合同
  updateContract(data) {
    this.modalService.open('create-contract', {
      params: {
        id: data['id']
      }
    });
  }

  copyContract (data) {
    this.modalService.open('create-contract', {
      params: {
        type: 'copy',
        title: '复制合同',
        id: data['id']
      }
    });
  }

  // 搜索
  onSearchChange(value, key, url) {
    this.isSearchSelect[key] = true;
    let nItem;
    nItem = { value: value, key: key, url: url };
    this.searchChange$.next(nItem);
  }

  // 选中事件
  onSelectChange(value, key) {
    if (key === 'vendor_id') {
      let params;
      params = {
        'id':  value,
      };
      this.http.get('web/test-api/get-cp-address', { params: params }).subscribe(result => {
        if (result['code'] === 0) {
          this.dataModal['city'] = result['data']['city'] || '';
          this.dataModal['address'] = result['data']['address'] || '';
        }
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
      });
    } else if (key === 'invalid_date') {
      this.dataModal['invalid_date'] = formatDate(value, 'yyyy-MM-dd', 'zh');
    }
  }

  onContractChildren(item) {
    if (!item.expand) {
      item.expand = true;
    } else {
      item.expand = false;
    }
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }

  addUser () {
    // console.log('添加用户')
  }
}
