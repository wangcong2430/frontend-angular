import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './perf.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NzModalModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';

import {DemandScoreComponent} from './demand-score/demandScore.component'
import {PurchasingScoreComponent} from './purchasing-score/purchasingScore.component'
import {AcceptanceApproveComponent} from './acceptance-approve/acceptanceApprove.component'
// import {TableGroupNewContainer} from '../../containers/table-group-new/table-group-new.container'


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
    NzModalModule
  ],
  declarations: [
    DemandScoreComponent,
    PurchasingScoreComponent,
    AcceptanceApproveComponent,
    // TableGroupNewContainer
  ],
  entryComponents: [],
})
export class PerfModule {
}
