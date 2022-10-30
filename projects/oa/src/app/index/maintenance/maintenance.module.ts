import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './maintenance.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';
import { TaskComponent } from './task/task.component';
import { SystemConfigComponent } from './system-config/system-config.component';
import { ApiComponent } from './api/api.component';


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
    TaskComponent,
    SystemConfigComponent,
    ApiComponent,
  ],
  entryComponents: [],
})
export class MaintenanceModule {
}
