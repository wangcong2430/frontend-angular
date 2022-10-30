import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { routing } from './supplier.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { SupplierDetailComponent } from './detail/detail.component';
import { Common2Module } from '../../../../modules/common2.module';
import { LanguageService } from '../../../../services/language.service';
import {SupplierAbilityComponent} from "./ability/ability.component";
import {SupplierProductComponent} from "./product/product.component";

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
    SupplierDetailComponent,
    SupplierAbilityComponent,
    SupplierProductComponent
  ],
  entryComponents: [],
})
export class SupplierModule {
}
