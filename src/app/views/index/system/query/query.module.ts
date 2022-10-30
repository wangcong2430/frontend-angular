import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './query.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { OrderComponent } from './order/order.component';
import { SoaComponent } from './soa/soa.component';
import { Common2Module } from '../../../../modules/common2.module';
import { ApproveQueryComponent } from './approve-query/approve-query.component';
import { CommonPriceComponent } from './common-price/common-price.component';
import { LanguageService } from '../../../../services/language.service';
import { AwaitMailComponent } from './await-mail/await-mail.component';
import {FormsModule} from "@angular/forms";


@NgModule({
  providers: [
    LanguageService,
    {provide: NZ_I18N, useValue: zh_CN}
  ],
    imports: [
        NgZorroAntdModule,
        CommonModule,
        Common2Module,
        routing,
        FormsModule,
    ],
  declarations: [
    OrderComponent,
    SoaComponent,
    ApproveQueryComponent,
    CommonPriceComponent,
    AwaitMailComponent
  ],
  entryComponents: [],
})
export class QueryModule {
}
