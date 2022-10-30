import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './user.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';

import { Common2Module } from '../../modules/common2.module';
import { OaComponent } from './oa/oa.component';
import { QqComponent } from './qq/qq.component';
import { HelpComponent  } from './help/help.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { WorkComponent } from './work/work.component';



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
    OaComponent,
    QqComponent,
    HelpComponent,
    FeedbackComponent,
    WorkComponent
  ],
  entryComponents: [],
})
export class UserModule {}
