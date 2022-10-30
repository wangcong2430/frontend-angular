import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './query.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';
import { QueryComponent } from './query.component';
import { StoryComponent } from './story/story.component';
import { ThingComponent } from './thing/thing.component';
import { LabelComponent } from './label/label.component';
import { OrderComponent } from './order/order.component';
import { SoaComponent } from './soa/soa.component';
import { ProcessComponent } from './process/process.component';
import { ApproveQueryComponent } from './approve-query/approve-query.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { RoleComponent } from './role/role.component';

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
    Common2Module
  ],
  declarations: [
    StoryComponent,
    QueryComponent,
    ThingComponent,
    OrderComponent,
    SoaComponent,
    ProcessComponent,
    ApproveQueryComponent,
    StatisticsComponent,
    RoleComponent,
    LabelComponent
  ],
  entryComponents: [],
})
export class QueryModule {
}
