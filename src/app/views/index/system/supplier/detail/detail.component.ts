import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ThingDetailModalComponent } from '../../../../../containers/modal/thing-detail/thing-detail.component';
import { MessageService } from '../../../../../services/message.service';
import { LanguageService } from '../../../../../services/language.service';
import { MenuService } from '../../../../../services/menu.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  templateUrl: './detail.component.html',
  styleUrls  : ['./detail.component.css']
})

export class SupplierDetailComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private message: MessageService,
    private language: LanguageService,
    private translate: TranslateService,
    private menuService: MenuService,
    private modal: ModalService,
    private modalService: NzModalService
  ) {
    this.translate.use(this.language.language);
  }

  dataModal: Object = {};
  isVisible: Boolean = false;
  loading: Boolean = true;
  isSubmitLoading = false;
  isEditContract = false;
  isEditSupplier = false;
  inviteLoading = false;
  qqUserList = [];
  styleList = [];
  labelList = [];
  contractList = [];
  qqUserData = {'is_add': true, 'qq': '', 'name': '', 'tel': '', 'email': '', 'role_1': false, 'role_2': false};
  requiredArr = [];
  where = { 'add': true, 'edit': false };
  formConfig = [
    {
      'key': 'cp_code',
      'label': 'SUPPLIER_CODE',
      'type': 'input',
      'disabled': true,
      'span': 6
    },
    {
      'key': 'name',
      'label': 'SUPPLIER_NAME',
      'type': 'input',
      'required': true,
      'disabled': true,
      'showWhere': 'edit',
      'span': 6
    },
    {
      'key': 'city',
      'label': 'CITY',
      'type': 'input',
      'required': true,
      'span': 6
    },
    {
      'key': 'address',
      'label': 'ADDRESS',
      'type': 'input',
      'required': true,
      'span': 12
    },
  ];
  optionSearchs = { 'vendor_id': [] };
  isSearchSelect = { 'vendor_id': false };

  // ????????????


  validateForm: FormGroup;

  // ??????????????????
  userModal = {
    isVisible: false,
    okLoading: false,
    list: [],
  }

  // ?????????
  invitationModal = {
    isVisible: false,
    okLoading: false,
  }

  inviteData = null;
  supplier_category_list = [];

  closeInvitationModal () {
    this.invitationModal.isVisible = false
  }

  initInviteData () {
    this.validateForm = this.fb.group({
      handler_user_id: [''],
      handler_user_name: ['warrenwange(?????????)'],
      invite_bg_name: ['IEG?????????????????????'],
      invite_bg: [''],
      invite_department_name: ['???????????????????????????'],
      invite_department: [''],
      contact_person: ['?????????'],
      contact_email: ['448030817@163.com'],
      contact_tel: ['13316460376'],
      contract_address: ['???????????????c???2F'],
      supplier_type: [1],
      supplier_name: [''],
      supplier_category: ['', [Validators.required]],
      supplier_email: ['', [Validators.required]],
      certificate_type: [10, [Validators.required]],
      certificate_no: [''],
    });
  }

  invitationModalOk (tplContent) {
    for (const i in this.validateForm.controls) {
        this.validateForm.controls[i].markAsDirty();
        this.validateForm.controls[i].updateValueAndValidity();
    }
    if (!this.validateForm.valid ) {
      return
    }

    if (this.validateForm.get('supplier_type').value === 2 && !this.validateForm.get('certificate_no').value) {
      this.message.error('?????????????????????');
      return
    }
    // ????????????
    // if (!this.inviteData.supplier_type) {
    //   this.message.error('????????????????????????');
    //   return
    // }

    // if (!this.inviteData.supplier_category) {
    //   this.message.error('????????????????????????');
    //   return
    // }

    // if (!this.inviteData.supplier_email) {
    //   this.message.error('??????????????????????????????');
    //   return
    // }

    // if (this.inviteData.supplier_type === 2 && !this.inviteData.certificate_type) {
    //   this.message.error('?????????????????????');
    //   return
    // }

    // if (this.inviteData.supplier_type === 2 && !this.inviteData.certificate_no) {
    //   this.message.error('?????????????????????');
    //   return
    // }

    this.modalService.create({
      nzTitle: '?????????????????????, ???????????????"????????????", ??????????????????????????????????????????????????????',
      nzContent: tplContent,
      nzClosable: false,
      nzOnOk: () => new Promise(resolve => {
        this.invitationModal.okLoading = true;
        this.http.post('web/supplier/save-sms-invite', this.validateForm.value).subscribe(result => {
          this.invitationModal.okLoading = false;
          if (result['code'] === 0) {
            this.message.success(result['msg']);
            this.invitationModal.isVisible = false;
            this.getInfo();
            this.menuService.getMenu();
            resolve()
          } else {
            this.message.error(result['msg']);
            resolve()
          }
        }, error => {
          this.invitationModal.isVisible = false;
          this.invitationModal.okLoading = false;
          resolve()
        });
      }),
    });


  }

  invitationSupplier () {
    this.modal.open('invitation');
    return
    this.inviteLoading = true;
    this.initInviteData();
    this.http.get('web/supplier/sms-invite').subscribe(result => {
      this.inviteLoading = false;
      if (result['code'] === 0 ) {
        this.inviteData = {
          handler_user_name:  result['data']['handler_user_name'] || 'warrenwange(?????????)',
          handler_user_id: result['data']['handler_user_id'] || 1,
          invite_bg: result['data']['invite_bg'] || 'IEG',
          invite_bg_name:  result['data']['invite_bg_name'] || 'IEG?????????????????????',
          invite_department: result['data']['invite_department'],
          invite_department_name: result['data']['invite_department_name'] || '???????????????????????????',
          contact_person: result['data']['contact_person'] || '?????????',
          contact_email: result['data']['contact_email'] || '448030817@163.com',
          contact_tel: result['data']['contact_tel'] || '13316460376',
          contract_address: result['data']['contract_address'] || '???????????????c???2F',
          supplier_type: result['data']['supplier_type'] || 1,
          supplier_name: result['data']['supplier_name'] || '',
          supplier_category: '',
          supplier_email: '',
          certificate_type: result['data']['certificate_type'] || 10,
          certificate_no: '',
        }
        this.supplier_category_list = result['data']['supplier_category_list'];
      }

      this.validateForm.setValue(this.inviteData);
      this.invitationModal.isVisible = true;
    }, error => {
      this.inviteLoading = false;
    });
  }

  ngOnInit () {
    this.isVisible = false;
    this.getInfo();
    this.initInviteData();
  }

  getInfo(){
    this.http.get('web/supplier/info').subscribe(result => {
      this.message.isAllLoading = false;
      this.loading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      } else {
        this.dataModal = result['data'];
        this.initData(result['data']);
        this.isVisible = true;
      }
    });
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

  updateSupplier() {

    this.http.get('/web/supplier/user-edit', { params: {
        id: this.dataModal['id']
      }}).subscribe(result => {
      if (result['code'] === 0) {
        // ?????????????????????
        let options = [{ label: 'CP??????', value: 'CP??????' }, { label: 'CP??????', value: 'CP??????' }];
        this.userModal.list = result['data']['sms_user_list'].map(value => {

          const listOptions = result['data']['old_cp_user_list'].filter(item => item.id !== value.id).map(item => {
            return {
              label: item.name,
              value: item.id,
              url: item.face
            }
          })

          return {
            ...value,
            checkOptions: options.map(item => {
              return {
                ...item,
                checked: value['wbp_role'].some(i => i === item.value )
              }
            }),
            listOptions: listOptions
          }
        })
        this.showUserModal();
      } else {
        this.message.error(result['msg']);
      }
    });
  }

  onContractChildren(item) {
    if (!item.expand) {
      item.expand = true;
    } else {
      item.expand = false;
    }
  }

  // ??????????????????
  showUserModal(): void {
    this.userModal.isVisible = true;
  }

  closeUserModal(): void {
    this.userModal.isVisible = false;
  }

  handleOk () {
    //this.userModal.okLoading = true;
    const data = this.userModal.list.map(item => {
      return {
        id: item.id,
        tel: item.tel,
        qq: item.qq,
        wbp_role: item['wbp_role'],
        relation_user_id: item['relation_user_id']
      };
    });
    this.userModal.okLoading = true;
    //return false;
    this.http.post('web/supplier/user-edit-save', data).subscribe(result => {

      if (result['code'] === 0) {
        this.userModal.isVisible = false;
        this.userModal.okLoading = false;
        this.message.success(result['msg']);
        this.getInfo();
        this.menuService.getMenu();
      } else {
        this.message.error(result['msg']);
      }
    });
  }

  some (arr, str) {
    if (arr instanceof Array) {
      return arr.some(item => item == str)
    }
    return false
  }

  checkboxChange ($event, data) {
    data.wbp_role = $event.filter(item => item.checked).map(item => item.label);

    if (!(data.relation_user_id && data.relation_user_id.length)) {
      data.relation_user_id = data.listOptions.length == 1 ? [data.listOptions[0].value] : data.relation_user_id
    }
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
