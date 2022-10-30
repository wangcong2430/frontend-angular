import {
  Component, EventEmitter, OnInit, Output,
  ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { MessageService } from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-modal-create-supplier',
  templateUrl: './create-supplier.component.html',
  styleUrls  : ['./create-supplier.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CreateSupplierModalComponent implements OnInit {
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() submit: EventEmitter<any> = new　EventEmitter();
  @ViewChild('createSupplier') createSupplier: ElementRef;

  searchChange$ = new BehaviorSubject('');
  isOpen: Boolean = false;
  nzZIndex = 800;
  tabsetIndex = 0;
  loading = true;
  isSubmitLoading = false;
  dataModal;
  qqUserList = [];
  labelList = [];
  styleList = [];
  filterOption = filterOption
  // qqUserData = {'is_add': true, 'qq': '', 'name': '', 'tel': '', 'email': '', 'role_1': false, 'role_2': false};
  requiredArr = [];
  where = { 'add': true, 'edit': false };
  edit = false;
  statusOptions = {
    '0': [
      {'label': '正常', 'value': '0'},
      {'label': '中止合作', 'value': '-1'},
      {'label': '已失效', 'value': '-2'},
    ],
    '-1': [
      {'label': '正常', 'value': '0'},
      {'label': '中止合作', 'value': '-1'},
      {'label': '已失效', 'value': '-2'},
    ],
    '-2': [
      {'label': '正常', 'value': '0'},
      {'label': '中止合作', 'value': '-1'},
      {'label': '已失效', 'value': '-2'},
    ]
  };
  formConfig = [
    {
      'key': 'vendor_id',
      'label': '供应商名称',
      'type': 'search-select',
      'searchUrl': 'web/pull-vendor/name-list',
      'required': true,
      'showWhere': 'add',
      'span': 6
    },
    {
      'key': 'name',
      'label': '供应商名称',
      'type': 'text',
      'disabled': true,
      'showWhere': 'edit',
      'span': 6
    },
    {
      'key': 'city',
      'label': '所在城市',
      'type': 'text',
      'required': true,
      'span': 6
    },
    {
      'key': 'address',
      'label': '公司地址',
      'type': 'text',
      'required': false,
      'span': 12
    },
    {
      'key': 'area_type',
      'label': '区域',
      'type': 'select',
      'required': true,
      'span': 6,
      'default': '',
      'options': [
        {'label': '大陆', 'value': '1'},
        {'label': '境外', 'value': '2'},
        {'label': '港澳台', 'value': '3'}
      ]
    },
    {
      'key': 'type',
      'label': '是否个人',
      'type': 'select',
      'required': true,
      'span': 6,
      'default': '',
      'options': [
        {'label': '否', 'value': '1'},
        {'label': '是', 'value': '2'},
      ]
    },
    {
      'key': 'status',
      'label': '可用状态',
      'type': 'select-status',
      'required': true,
      'span': 6,
      'default': '0',
      // 'showWhere': 'edit',
      'options': [
        {'label': '正常', 'value': '0'},
        {'label': '中止合作', 'value': '-1'},
      ]
    },
    {
      'key': 'is_online',
      'label': '是否支持线上',
      'type': 'radio',
      'required': true,
      'default': '0',
      'span': 6
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

  supplierUserModal = {
    isVisible: false,
    list: [],
    isOkLoading: false
  }

  constructor(
    private http: HttpClient,
    private message: MessageService,
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder) {
  }




  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'create-supplier') {
        this.nzZIndex = item['zIndex'];
        this.getSupplierInfo(item)
      }
    });

    this.searchChange$.asObservable().pipe(debounceTime(120)).subscribe(item => {
      if (item['url']) {
        this.http.get(item['url'], {
          params: {
            'name': item['value'],
          }
        }).subscribe(data => {
          this.optionSearchs[item['key']] = data['data'];
          this.isSearchSelect[item['key']] = false;
          this.cd.markForCheck();
        });
      }
    });
  }

  getSupplierInfo (item) {
    const messageId = this.message.loading('加载中', { nzDuration: 0 }).messageId;
    this.http.get('web/supplier/info-new', { params: {id: item['data'].id} }).subscribe(result => {
      if (result['code'] === 0) {

        this.message.remove(messageId);
        this.openModal(result['data']);
        this.initData(result['data']);
        this.cd.markForCheck();
      } else {
        this.message.remove(messageId);
        this.message.error(result['msg']);
        this.cd.markForCheck();
      }
    });
  }

  initData(item = {}) {
    this.qqUserList = [];
    this.labelList = [];
    this.styleList = [];
    this.requiredArr = [];
    if (item['id']) {
      this.where = { 'add': false, 'edit': true };
      this.edit = true;
    } else {
      this.where = { 'add': true, 'edit': false };
      this.edit = false;

    }
    this.formConfig.forEach(data => {
      if (!this.dataModal[data.key]) {
        this.dataModal[data.key] = data['default'] || '';
      }
      if (data['required']) {
        if (item['id'] && data.key === 'vendor_id') {

        } else {
          this.requiredArr.push({ 'field': data.key, 'label': data.label });
        }
      }
    });
    if (this.dataModal['userList']) {
      this.qqUserList = this.dataModal['userList'];

      let options = [{ label: 'CP商务', value: 'CP商务' }, { label: 'CP制作', value: 'CP制作' }];
      this.qqUserList = this.dataModal['userList'].map(value => {
        return {
          ...value,
          checkOptions: options.map(item => {
            return {
              ...item,
              checked: value['wbp_role'].some(i => i === item.value )
            }
          }),
          listOptions: this.dataModal['oldSupplierProduce'].filter(item => item.id !== value.id).map(item => {
            return {
              label: item.name,
              value: item.id,
              url: item.face
            }
          })
        }
      })
    }
    if (this.dataModal['labelList']) {
      this.labelList = this.dataModal['labelList'];
    }
    if (this.dataModal['styleList']) {
      this.styleList = this.dataModal['styleList'];
    }
    if (this.qqUserList.length === 0) {
      // this.qqUserList.push(JSON.parse(JSON.stringify(this.qqUserData)));
    }
    this.cd.markForCheck();
  }

  // 获取数据列表
  getTableList() {
    this.getList.emit();
  }

  // 开打弹窗前先获取项目及预算
  openModal(item, tab = 0) {
    this.isOpen = true;
    this.loading = false;

    this.tabsetIndex = tab;
    this.dataModal = item;
    this.isSubmitLoading = false;
    this.cd.markForCheck();
  }

  modalCancel() {
    this.isOpen = false;
    this.cd.markForCheck();
  }

  modalSubmit() {
    let isError, params;
    isError = false;
    // 验证必填项
    this.requiredArr.forEach(data => {
      if (data.field !== 'name' && (!this.dataModal[data.field] || this.dataModal[data.field] === '')) {
        this.message.error(data.label + '不能为空');
        isError = true;
        return false;
      }
    });


    this.cd.markForCheck();
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


    const userList = this.qqUserList.map(item => {
      return {
        id: item.id,
        qq: item.qq,
        tel: item.tel,
        wbp_role: item.wbp_role,
        relation_user_id: item.relation_user_id,
        is_sms_user: item.is_sms_user
      }
    })

    this.isSubmitLoading = true;
    this.cd.markForCheck();
    this.http.post('web/supplier/save-new-v2', {
      ...this.dataModal,
      'userList': userList,
      'styleIds': styleIds,
      'labelIds': labelIds
    }).subscribe(results => {
      if (results['code'] === 0) {
        this.message.success(results['msg']);
        this.modalCancel();
        this.modalService.complete('create-supplier', {
          code: 0
        });
      } else {
        this.message.error(results['msg']);
      }
      this.isSubmitLoading = false;
      this.cd.markForCheck();
    }, (err) => {
      this.isSubmitLoading = false;
      this.cd.markForCheck();
    });
  }

  // 添加一行
  addTableRow(type) {
    if (type === 1) {
      // this.qqUserList.push(JSON.parse(JSON.stringify(this.qqUserData)));
    }
    this.cd.markForCheck();
  }
  delTableRow(type, index) {
    if (type === 1) {
      if (this.qqUserList.length === 1) {
        this.message.error('最少保留一行');
        return false;
      }
      this.qqUserList.splice(index, 1);
    }
    this.cd.markForCheck();
  }

  // qq号码检测是否已绑定供应商
  checkQQ(value) {
    this.http.get('web/supplier/check-qq?qq=' + value).subscribe(result => {
      if (result['code'] === 0) {
        this.message.error(value + '账号已关联其他供应商');
        this.cd.markForCheck();
        return false;
      }
      this.cd.markForCheck();
    });
    this.cd.markForCheck();
  }

  // 搜索
  onSearchChange(value, key, url) {
    this.isSearchSelect[key] = true;
    let nItem;
    nItem = { value: value, key: key, url: url };
    this.searchChange$.next(nItem);
  }

  //
  checkboxChange ($event, data) {
    data['wbp_role'] = $event.filter(item => item.checked).map(item => item.label);
  }

  // 选中事件
  onSelectChange(value, key) {
    if (key === 'vendor_id') {
      const messageId = this.message.loading('正在获取供应商信息...', { nzDuration: 0 }).messageId;
      this.http.get('web/supplier/check-supplier', {params: {id: value}}).subscribe(res => {
        if (res['code'] === 0) {
          this.http.get('web/test-api/get-cp-address', {params: {id: value}}).subscribe(result => {
            this.message.remove(messageId);
            if (result['code'] === 0) {
              this.dataModal['city'] = result['data']['city'] || '';
              this.dataModal['address'] = result['data']['address'] || '';
              this.dataModal['area_type'] = result['data']['area_type'] || '';
              this.message.success('获取成功!');
            } else {
              this.message.success('获取失败!');
            }
            this.cd.markForCheck();
          }, err => {
            this.message.remove(messageId);
          });
        } else {
          this.message.remove(messageId);
          this.message.error('该供应商已创建');
          this.cd.markForCheck();
        }
      });
    } else if (key === 'invalid_date') {
      if (value && value !== '') {
        this.dataModal['invalid_date'] = formatDate(value, 'yyyy-MM-dd', 'zh');
      }
    } else if (key === 'status') {
      this.dataModal['invalid_date'] = null;
    }
    this.cd.markForCheck();
  }


  addSupplierUser () {
    const messageId = this.message.loading('数据获取中...', { nzDuration: 0 }).messageId
    this.cd.markForCheck();
    this.http.get('web/supplier/get-old-user-list', {
      params: {
        supplier_id: this.dataModal['id']
      }
    }).subscribe(result => {
      if (result['code'] === 0) {
        this.message.remove(messageId);
        this.supplierUserModal.list = result['data']['user_list'];
        this.supplierUserModal.isVisible = true;
        if ( this.supplierUserModal.list.length === 0) {
          this.addSupplierTableRow();
        }
        this.cd.markForCheck();
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.remove(messageId);
      this.cd.markForCheck();
    });
  }


  supplierUserModalCancel () {
    this.supplierUserModal.isVisible = false;
    this.cd.markForCheck();
  }

  supplierUserModalOk () {
    if (this.supplierUserModal.list.some(item => !item.name || !item.email)) {
      this.supplierUserModal.list.map(item => {
        if (!item.name || !item.email) {
          this.message.error('请补充' + item.qq + '的姓名/邮箱/角色')
        }
      })
      this.cd.markForCheck();
      return
    }

    this.supplierUserModal.isOkLoading = true;
    this.cd.markForCheck();
    this.http.post('web/supplier/save-old-user', {
      id: this.dataModal['id'],
      userList: this.supplierUserModal.list
    }).subscribe(result => {
      this.supplierUserModal.isOkLoading = false;
      if (result['code'] === 0) {
        this.supplierUserModal.isVisible = false;
        this.message.success(result['msg'])
        // this.getNewSupplierInfo();
        this.getSupplierInfo({
          data: {
            id: this.dataModal['id']
          }
        })
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, (err) => {
      this.supplierUserModal.isOkLoading = false;
      this.message.error('网络异常，请稍后再试');
      this.message.error(err['msg']);
      this.cd.markForCheck();
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

  // 添加一行
  addSupplierTableRow() {
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
    this.cd.markForCheck();
  }

  delSupplierRow(type, index) {
    if (type === 1) {
      if (this.supplierUserModal.list.length === 1) {
        this.message.error('最少保留一行');
        return false;
      }
      this.supplierUserModal.list =this.supplierUserModal.list.filter((item,i) => i !== index);
    }
    this.cd.markForCheck();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
