import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { routing } from './contract.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
//import { SupplierDetailComponent } from './detail/detail.component';
import { Common2Module } from '../../../../modules/common2.module';
import { LanguageService } from '../../../../services/language.service';
//import {SupplierAbilityComponent} from "./ability/ability.component";
import { ContractStampComponent } from "./stamp/stamp.component";
import {SignStampComponent } from "./sign/sign.component";

@NgModule({
  providers: [
    LanguageService,
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  imports: [
    NgZorroAntdModule,
    CommonModule,
    Common2Module,
    FormsModule,
    routing,
  ],
  declarations: [
    ContractStampComponent,
    SignStampComponent
  ],
  entryComponents: [],
})
export class ContractModule {
}
