import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { routing } from './order.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';

import { OrderComponent } from './order.component';
import { CreateComponent } from './create/create.component';
import { ApproveComponent } from './approve/approve.component';

import { Common2Module } from '../../modules/common2.module';
import { PurchaseAcceptanceComponent } from './purchase-acceptance/purchase-acceptance.component';
import { SeniorApproveComponent } from './senior-approver/senior-approver.component';
import { InProductionComponent } from './in-production/in-production.component';
import { AcceptanceApproveComponent } from './acceptance-approve/acceptance-approve.component';
import { AcceptanceEvaluateComponent } from './acceptance-evaluate/acceptance-evaluate.component';

@NgModule({
  providers: [
    UserResolve,
    UserFormResolve,
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  imports: [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    NgZorroAntdModule,
    CommonModule,
    DragDropModule,
    routing,
    FormlyComponentModule,
    Common2Module
  ],
  declarations: [
    OrderComponent,
    CreateComponent,
    ApproveComponent,
    SeniorApproveComponent,
    PurchaseAcceptanceComponent,
    AcceptanceApproveComponent,
    AcceptanceEvaluateComponent,
    InProductionComponent,
  ],
  entryComponents: [],
})
export class OrderModule {
}
