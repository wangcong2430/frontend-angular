import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { UserService } from '../../api-client/api/user.service';
import { UserInfoService } from '../services/user-info.service';
import { ModalService } from '../services/modal.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Injectable()
export class UserResolve implements Resolve<any> {

  constructor(
    private userService: UserService,
    private userInfoService: UserInfoService,
    private modal: ModalService,
    private modalService: NzModalService,
    private router: Router
  ) {
  }

  resolve(route: ActivatedRouteSnapshot) {
    return Observable.create(observer => {
      this.userService.webUserInfoGet().subscribe(result => {
        if (result['code'] === 0) {
          this.userInfoService.user = result['data'];
          observer.next(result['data']);

          let dialog = result['data']['dialog'];

          // dialog['dialog_type'] = 'get_invitation_code'
          // dialog['text_type'] = 5

          if (dialog['dialog_type'] == 'config_wbp_auth') {
            this.modalService.create({
              nzTitle: '请配置WBP系统权限',
              //nzContent: `<p class="mb-5">您好, 您没有外包平台权限, 请前往"供应商详情"页面,  点击“编辑”按钮配置 </p>`,
              nzContent: `<p class="mb-5">您好，您没有外包平台权限，请前往“供应商详情”页面，点击<a href="/system/supplier/detail">编辑</a>按钮配置商务和制作角色权限。 </p>`,
              nzClosable: true,
              nzMaskClosable: false,
              nzKeyboard: false,
              nzOkText: '编辑',
              nzCancelText: null,
              nzOnOk: () => {
                this.router.navigateByUrl('system/supplier/detail');
              }
            });
          } else if (dialog['dialog_type'] == 'connect_admin' || dialog['dialog_type'] == 'connect_admin_8') {

            if (!dialog['admin_info']) {
              dialog['admin_info'] = {
                name: '',
                tel: '',
                email: '',
                login_type: ''
              }
            }

            let admin_info = dialog['admin_info'];
            var title = '';
            var content = '';
            if (dialog['dialog_type'] == 'connect_admin') {
              title = '请联系管理员配置WBP系统权限';
              content = '您好, 您没有外包平台权限, 请前往“供应商详情”页面, 点击“编辑”按钮配置\n                管理员信息如下:';
            } else {
              title = '请联系管理员配置门户网站账号制作权限';
              //content = '您好, 贵公司门户网站账号都没有制作权限, 将无法接收订单, 请联系管理员前往“供应商详情”页面, 点击“编辑”按钮配置\n                管理员信息如下:';
              content = '您好，贵公司未指定订单制作人员，将导致无法执行接收订单操作，请联系管理员前往“供应商详情”页面，点击编辑按钮配置制作人员；或联系采购经理为制作人员发起门户网站邀请注册，完成邀请注册后，联系管理员为新注册的门户账号分配制作权限。管理员信息如下:';
            }
            this.modalService.create({
              nzTitle: title,
              nzContent: `${content}
                <ul class="pl-3 mt-2">
                  <li>- 管理员姓名: ${admin_info['name']}</li>
                  <li>- 管理员手机: ${admin_info['tel']}</li>
                  <li>- 管理员邮箱: ${admin_info['email']}</li>
                  <li>- 管理员门户网站登录方式:${admin_info['login_type']}</li>
                </ul>
              `,
              nzClosable: true,
              nzMaskClosable: true,
              nzOkText: '确定',
              nzCancelText: '取消',
              nzOnOk: () => {

              }
            });
          } else if (dialog['dialog_type'] == 'get_invitation_code') {

            if (dialog['text_type'] == 1) {
              this.modalService.create({
                nzTitle: '获取邀请码',
                nzContent: `
                  您好，根据腾讯集团供应商管理规范要求，腾讯供应商门户将作为腾讯集团面向供应商的唯一门户。
                  贵公司制作人员没有门户网站账号，请点击获取邀请码完成门户网站邀请注册，完成注册后请联系贵公司管理员在门户网站中确认，确认后的账号状态为有效。
                  具体操作请下载<a target="_blank" href="https://wbp-1258344700.cos.ap-guangzhou.myqcloud.com/public/static/%E4%BA%92%E5%A8%B1%E5%A4%96%E5%8C%85%E5%B9%B3%E5%8F%B0%E4%BE%9B%E5%BA%94%E5%95%86%E5%8F%91%E9%80%81%E9%82%80%E8%AF%B7%E7%A0%81%E6%93%8D%E4%BD%9C%E6%96%87%E6%A1%A3.pdf">操作文档</a>
                `,
                nzClosable: true,
                nzMaskClosable: false,
                nzOkText: '获取邀请码',
                nzKeyboard: false,
                nzCancelText: '退出系统',
                nzOnOk: () => {
                  this.modal.open('invitation');
                },
                nzOnCancel: () => {
                  console.log('获取邀请码3')
                  window.location.href="/qqLogin"
                }
              });
            } else if (dialog['text_type'] == 5) {
              this.modalService.create({
                nzTitle: '获取邀请码',
                nzContent: `
                  您好，根据腾讯集团供应商管理规范要求，腾讯供应商门户将作为腾讯集团面向供应商的唯一门户。
                  请使⽤门户网站账号登录，如没有门户网站账号，请点击获取邀请码完成门户网站邀请注册，完成注册后请等待腾讯公司经办人确认，确认后的账号状态为有效，请使用新注册的门户网站账号登录。
                  具体操作请下载<a target="_blank" href="https://wbp-1258344700.cos.ap-guangzhou.myqcloud.com/public/static/%E4%BA%92%E5%A8%B1%E5%A4%96%E5%8C%85%E5%B9%B3%E5%8F%B0%E4%BE%9B%E5%BA%94%E5%95%86%E5%8F%91%E9%80%81%E9%82%80%E8%AF%B7%E7%A0%81%E6%93%8D%E4%BD%9C%E6%96%87%E6%A1%A3.pdf">操作文档</a>
                `,
                nzClosable: true,
                nzMaskClosable: false,
                nzKeyboard: false,
                nzOkText: '获取邀请码',
                nzCancelText: '退出系统',
                nzOnOk: () => {
                  this.modal.open('invitation', {
                    reload: true
                  });
                },
                nzOnCancel: () => {
                  console.log('获取邀请码2')
                  window.location.href="/qqLogin"
                }
              });
            } else if (dialog['text_type'] == 6){
              this.modalService.create({
                nzTitle: '获取邀请码',
                nzContent: `
                  您好，根据腾讯集团供应商管理规范要求，腾讯供应商门户将作为腾讯集团面向供应商的唯一门户。
                  请使⽤门户网站账号登录，如没有门户网站账号，请点击获取邀请码完成门户网站邀请注册，完成注册后请联系贵公司管理员在门户网站中确认，确认后的账号状态为有效，请使用新注册的门户网站账号登录。
                  具体操作请下载<a target="_blank" href="https://wbp-1258344700.cos.ap-guangzhou.myqcloud.com/public/static/%E4%BA%92%E5%A8%B1%E5%A4%96%E5%8C%85%E5%B9%B3%E5%8F%B0%E4%BE%9B%E5%BA%94%E5%95%86%E5%8F%91%E9%80%81%E9%82%80%E8%AF%B7%E7%A0%81%E6%93%8D%E4%BD%9C%E6%96%87%E6%A1%A3.pdf">操作文档</a>
                `,
                nzClosable: true,
                nzMaskClosable: false,
                nzKeyboard: false,
                nzOkText: '获取邀请码',
                nzCancelText: '退出系统',
                nzOnOk: () => {
                  // this.router.navigateByUrl('system/supplier/detail');
                  this.modal.open('invitation');
                },
                nzOnCancel: () => {
                  console.log('获取邀请码1')
                  window.location.href="/qqLogin"
                }
              });
            }

          } else if (dialog['dialog_type'] == 'connect_business') {

            if (!dialog['business_list']) {
              dialog['business_list'] = []
            }

            const list = dialog['business_list'].map(item =>
            `<tr>
              <td>${item.name}</td>
              <td>${item.qq}</td>
              <td>${item.tel}</td>
              <td>${item.email}</td>
            </tr>`
            ).join('')

            this.modalService.create({
              nzTitle: '请联系商务获取邀请码',
              nzContent: `您好, 根据腾讯集团供应商管理规范要求, 腾讯供应商门户将作为腾讯集团面向供应商的唯一门户。请使用门户网站账号, 如果没有门户网站账号,
                请联系商务"获取邀请码"完成门户网站邀请注册, 具体操作请下载<a target="_blank" href="https://wbp-1258344700.cos.ap-guangzhou.myqcloud.com/public/static/%E4%BA%92%E5%A8%B1%E5%A4%96%E5%8C%85%E5%B9%B3%E5%8F%B0%E4%BE%9B%E5%BA%94%E5%95%86%E5%8F%91%E9%80%81%E9%82%80%E8%AF%B7%E7%A0%81%E6%93%8D%E4%BD%9C%E6%96%87%E6%A1%A3.pdf">操作文档</a>。商务信息如下:
                <table  border="1" class="table table-bordered mt-2 w-100" style="width: 100%">
                <tr>
                  <th>商务姓名</th>
                  <th>商务QQ</th>
                  <th>商务手机</th>
                  <th>商务邮箱</th>
                </tr>

                ${list}
              </table>
                `,
              nzClosable: true,
              nzMaskClosable: false,
              nzKeyboard: false,
              nzOkText: '退出系统',
              nzCancelText: null,
              nzOnOk: () => {
                window.location.href="/qqLogin"
              },
            });
          } else if (dialog['dialog_type'] == 'config_wbp_producer') {
            this.modalService.create({
              nzTitle: '请配置门户网站制作权限',
              nzContent: `<p class="mb-5">您好，贵公司未指定订单制作人员，将导致无法执行接收订单操作，请前往“供应商详情”页面，点击编辑按钮配置制作人员。或联系采购经理为制作人员发起门户网站邀请注册，完成邀请注册后，给新注册的门户账号分配制作权限。 </p>`,
              nzClosable: true,
              nzMaskClosable: false,
              nzKeyboard: false,
              nzOkText: '编辑',
              nzCancelText: null,
              nzOnOk: () => {
                this.router.navigateByUrl('system/supplier/detail');
              }
            });
          } else if (dialog['dialog_type'] == 'connect_purchase_manager') {
            this.modalService.create({
              nzTitle: '请使用门户网站账号登录',
              nzContent: `您好，根据腾讯集团供应商管理规范要求，腾讯供应商门户将作为腾讯集团面向供应商的唯一门户。请使⽤门户网站账号登录，如没有门户网站账号，请联系采购经理发起门户网站邀请注册，完成邀请注册后，请等待采购经理确认，确认后的账号状态为有效，请使用新注册的门户网站账号登录。`,
              nzClosable: true,
              nzMaskClosable: false,
              nzKeyboard: false,
              nzOkText: '退出系统',
              nzCancelText: null,
              nzOnOk: () => {
                window.location.href="/qqLogin"
              },
            });
          }
        }
        observer.complete();
      });
    });
  }
}
