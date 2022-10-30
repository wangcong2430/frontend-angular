import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './iegg.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';

import { Common2Module } from '../../modules/common2.module';
// import { DemandAuditConfirmationComponent } from '../apply-change/demand-audit-confirmation/demand-audit-confirmation.component';
// import { DemandPersonConfirmationComponent } from '../apply-change/demand-person-confirmation/demand-person-confirmation.component';
// import { AcceptanceApproveComponent } from '../order/acceptance-approve/acceptance-approve.component';
// import { ByAcceptanceComponent } from '../thing/by-acceptance/by-acceptance.component';
// import { DemandAcceptanceComponent } from '../thing/demand-acceptance/demand-acceptance.component';
import { ApplyChangeModule } from '../apply-change/apply-change.module';
import { OrderModule } from '../order/order.module';
import { ThingModule } from '../thing/thing.module';
import { StatementModule } from '../statement/statement.module';

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
    ApplyChangeModule,
    OrderModule,
    ThingModule,
    Common2Module,
    StatementModule
  ],
  entryComponents: [],
})
export class IeggModule {}
