import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { routing } from './stampoa.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { Common2Module } from '../../modules/common2.module';
//import { LanguageService } from '../../../../services/language.service';
import { ApprovalStampoaComponent } from "./approval/Approval.component";
import { ContractStampoaComponent } from "./contract/Contract.component";
import { SignStampoaComponent } from "./sign/Sign.component";

@NgModule({
  providers: [
    //LanguageService,
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
    ApprovalStampoaComponent,
    ContractStampoaComponent,
    SignStampoaComponent
  ],
  exports: [
    ApprovalStampoaComponent,
    ContractStampoaComponent,
    SignStampoaComponent
  ],
  entryComponents: [],
})
export class StampoaModule {
}
