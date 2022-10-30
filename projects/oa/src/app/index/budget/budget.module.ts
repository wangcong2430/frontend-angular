import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './budget.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';

import { BudgetComponent } from './budget.component';
import { ApplyComponent } from './apply/apply.component';
import { ApproveComponent } from './approve/approve.component';
import { ApproveLogComponent } from './approve-log/approve-log.component';

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
    BudgetComponent,
    ApplyComponent,
    ApproveComponent,
    ApproveLogComponent,
  ],
  entryComponents: [],
})
export class BudgetModule {
}
