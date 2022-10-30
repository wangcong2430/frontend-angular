import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './library.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';
import { PriceLibraryComponent } from './price-library/price-library.component';
import { PriceTemplateLibraryComponent } from './price-template-library/price-template-library.component';
import { LibraryComponent } from './library.component';
import { ContractPriceComponent } from './contract-price/contract-price.component';
import { CommonPriceComponent } from './common-price/common-price.component';
import { ContractApprovalComponent } from './contract-approval/contract-approval.component';
import { CommonApprovalComponent } from './common-approval/common-approval.component';

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
    PriceLibraryComponent,
    PriceTemplateLibraryComponent,
    LibraryComponent,
    ContractPriceComponent,
    CommonPriceComponent,
    ContractApprovalComponent,
    CommonApprovalComponent
  ],
  entryComponents: [],
})
export class LibraryModule {
}
