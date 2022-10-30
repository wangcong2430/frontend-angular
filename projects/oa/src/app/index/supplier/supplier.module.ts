/*
 * @Author: your name
 * @Date: 2022-03-31 17:35:35
 * @LastEditTime: 2022-04-01 10:49:26
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /csp/cpm/frontend/projects/oa/src/app/index/supplier/supplier.module.ts
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './supplier.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';
import { ShortlistComponent } from './shortlist/shortlist.component';
import { ShortlistContentComponent } from './shortlistcontent/shortlistcontent.component'

import { ListComponent } from './list/list.component';
import { ContractComponent } from './contract/contract.component';
import { EmailComponent } from './email/email.component'

import { DetailComponent } from './detail/detail.component'
import {SupplierAbilityComponent} from "./ability/ability.component";




@NgModule({
  providers: [
    UserResolve,
    UserFormResolve,
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  imports: [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    CommonModule,
    NgZorroAntdModule,
    routing,
    FormlyComponentModule,
    Common2Module,
  ],
  declarations: [
    ShortlistComponent,
    ShortlistContentComponent,
    ListComponent,
    ContractComponent,
    EmailComponent,
    DetailComponent,
    SupplierAbilityComponent
  ],
  entryComponents: [],
})
export class SupplierModule {
}
