import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './statement.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';
import { StatementComponent } from './statement.component';
import { WaitGenerateStatementComponent } from './wait-generate-statement/wait-generate-statement.component';
import { ProjectLeaderApproveComponent } from './project-leader-approve/project-leader-approve.component';
import { GmApproveComponent } from './gm-approve/gm-approve.component';
import { AuthGmApproveComponent } from './auth-gm-approve/auth-gm-approve.component';
import { PushEpoComponent } from './push-epo/push-epo.component';
import { PushEpoErrorComponent } from './push-epo-error/push-epo-error.component';
import { StatementPushEpoModalComponent } from '../../containers/modal/statement-push-epo/statement-push-epo.component';


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
    StatementComponent,
    WaitGenerateStatementComponent,
    ProjectLeaderApproveComponent,
    GmApproveComponent,
    AuthGmApproveComponent,
    PushEpoComponent,
    PushEpoErrorComponent,
    StatementPushEpoModalComponent
  ],
  entryComponents: [],
})
export class StatementModule {
}
