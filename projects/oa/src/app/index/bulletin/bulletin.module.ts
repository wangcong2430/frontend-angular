import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './bulletin.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';
import { IndexComponent } from './index/index.component';
import { RecruitComponent } from './recruit/recruit.component';
import { SystemComponent } from './system/system.component';


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
    IndexComponent,
    RecruitComponent,
    SystemComponent
  ],
  entryComponents: [],
})
export class BulletinModule {
}
