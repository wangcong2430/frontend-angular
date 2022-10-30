import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

import { MessageService } from '../../../services/message.service';
import { LanguageService } from '../../../services/language.service';
import { MenuService } from '../../../services/menu.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})

export class InvitationModalComponent implements OnInit {
  showImg = {
    loading: false,
    isVisible: false,
    url: ''
  };
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private message: MessageService,
    private language: LanguageService,
    private translate: TranslateService,
    private menuService: MenuService,
    private modal: ModalService,
    private modalService: NzModalService,
    private router: Router
  ) {}

    ngOnInit() {
      this.modal.modal$.subscribe(item => {
        if (item && item['key'] === 'invitation') {
          if (item['data'] && item['data']['reload']) {
            this.reload = item['data']['reload'] || false
          }
          this.invitationSupplier()
        }
      });
     }

  // 开打弹窗
  openModal(url) {
    this.showImg.url = '';
    this.showImg.loading = true;
    this.showImg.isVisible = true;
    this.showImg.url = url;
  }

  changeLoad() {
    this.showImg.loading = false;
  }

  onCancel() {
    this.showImg.url = '';
    this.showImg.isVisible = false;
  }


  // 邀请码
  invitationModal = {
    isVisible: false,
    okLoading: false,
  }

  inviteData = null;
  supplier_category_list = [];

  reload: boolean = false;

  closeInvitationModal () {
    if (this.reload) {
      location.reload()
      return 
    }
    this.invitationModal.isVisible = false
  }

  validateForm: FormGroup;

  initInviteData () {
    this.validateForm = this.fb.group({
      handler_user_id: [''],
      handler_user_name: ['warrenwange(王博强)'],
      invite_bg_name: ['IEG互动娱乐事业群'],
      invite_bg: [''],
      invite_department_name: ['互动娱乐服务采购部'],
      invite_department: [''],
      contact_person: ['许晓瑞'],
      contact_email: ['448030817@163.com'],
      contact_tel: ['13316460376'],
      contract_address: ['科兴科技园c座2F'],
      supplier_type: [1],
      supplier_name: [''],
      supplier_category: [null, [Validators.required]],
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
      this.message.error('请输入证件号码');
      return
    }
    // 先做校验
    // if (!this.inviteData.supplier_type) {
    //   this.message.error('请选择供应商性质');
    //   return
    // }

    // if (!this.inviteData.supplier_category) {
    //   this.message.error('请选择供应商类别');
    //   return
    // }

    // if (!this.inviteData.supplier_email) {
    //   this.message.error('请输入供应商电子邮箱');
    //   return
    // }

    // if (this.inviteData.supplier_type === 2 && !this.inviteData.certificate_type) {
    //   this.message.error('请选择证件类型');
    //   return
    // }

    // if (this.inviteData.supplier_type === 2 && !this.inviteData.certificate_no) {
    //   this.message.error('请输入证件号码');
    //   return
    // }

    this.modalService.create({
      nzTitle: '确认邀请信息后, 请点击下方"确定按钮", 生成邀请码并向供应商发送注册邀请邮件',
      nzContent: tplContent,
      nzClosable: false,
      nzOnOk: () => new Promise(resolve => {
        this.invitationModal.okLoading = true;

        let params = {
          ...this.validateForm.value,
          supplier_category: this.validateForm.value.supplier_category.filter(item => item)
        }
        this.http.post('web/supplier/save-sms-invite', params).subscribe(result => {
          this.invitationModal.okLoading = false;
          if (result['code'] === 0) {
            this.message.success(result['msg']);
            this.closeInvitationModal();
            resolve()
          } else {
            this.message.error(result['msg']);
            resolve()
          }
        }, error => {
          this.message.error(error['msg'] || '网络异常, 请稍后再试');
          this.invitationModal.okLoading = false;
          resolve()
        });
      }),
    });
  }


  inviteLoading = false

  invitationSupplier () {

    // console.log()


    this.inviteLoading = true;
    this.initInviteData();
    this.http.get('web/supplier/sms-invite').subscribe(result => {
      this.inviteLoading = false;
      if (result['code'] === 0 ) {
        this.inviteData = {
          handler_user_name:  result['data']['handler_user_name'] || 'warrenwange(王博强)',
          handler_user_id: result['data']['handler_user_id'] || 1,
          invite_bg: result['data']['invite_bg'] || 'IEG',
          invite_bg_name:  result['data']['invite_bg_name'] || 'IEG互动娱乐事业群',
          invite_department: result['data']['invite_department'],
          invite_department_name: result['data']['invite_department_name'] || '互动娱乐服务采购部',
          contact_person: result['data']['contact_person'] || '许晓瑞',
          contact_email: result['data']['contact_email'] || '448030817@163.com',
          contact_tel: result['data']['contact_tel'] || '13316460376',
          contract_address: result['data']['contract_address'] || '科兴科技园c座2F',
          supplier_type: result['data']['supplier_type'] || 1,
          supplier_name: result['data']['supplier_name'] || '',
          supplier_category: '',
          supplier_email: '',
          certificate_type: result['data']['certificate_type'] || 10,
          certificate_no: '',
        }
        this.supplier_category_list = result['data']['supplier_category_list'];
      } else {
        this.message.error(result['msg'] || '网络异常稍后重试');
      }

      this.validateForm.setValue(this.inviteData);
      this.invitationModal.isVisible = true;

      console.log(location)
      // this.router.navigate(['/thing/draft']);
    }, error => {
      this.inviteLoading = false;
    });


  }

}
