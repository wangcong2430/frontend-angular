import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './apply-change.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';
import { DemandPersonConfirmationComponent } from './demand-person-confirmation/demand-person-confirmation.component';
import { BrandManagerConfirmationComponent } from './brand-manager-confirmation/brand-manager-confirmation.component';
import { DemandAuditConfirmationComponent } from './demand-audit-confirmation/demand-audit-confirmation.component';
import { SpmConfirmationComponent } from './spm-confirmation/spm-confirmation.component';
import { ChangeOrderApprovalComponent } from './change-order-approval/change-order-approval.component';
import { GmConfirmationComponent } from './gm-confirmation/gm-confirmation.component';
import { UpgradeOrderApprovalConfirmationComponent } from './upgrade-order-approval-confirmation/upgrade-order-approval-confirmation.component';
import { LabelChangeConfirmationComponent } from './label-change-confirmation/label-change-confirmation.component';


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
    DragDropModule,
    NgZorroAntdModule,
    routing,
    FormlyComponentModule,
    Common2Module
  ],
  declarations: [
    DemandPersonConfirmationComponent,
    BrandManagerConfirmationComponent,
    DemandAuditConfirmationComponent,
    SpmConfirmationComponent,
    ChangeOrderApprovalComponent,
    GmConfirmationComponent,
    UpgradeOrderApprovalConfirmationComponent,
    LabelChangeConfirmationComponent
  ],
  entryComponents: [],
})
export class ApplyChangeModule {
}
