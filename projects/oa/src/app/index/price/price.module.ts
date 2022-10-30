import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './price.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { Common2Module } from '../../modules/common2.module';
import { InquiryComponent } from './inquiry/inquiry.component';
import { PriceComponent } from './price.component';
import { WaitQuoteComponent } from './wait-quote/wait-quote.component';
import { NuclearPriceComponent } from './nuclear-price/nuclear-price.component';
import { StoryPriceChangeComponent } from './story-price-change/story-price-change.component';
import { PriceChangeComponent } from './price-change/price-change.component';
import { PriceChangeSeniorComponent } from './price-change-senior/price-change-senior.component';
import { InquiryModalComponent } from '../../containers/modal/inquiry/inquiry.component';
import { GenerateOrderModalComponent } from '../../containers/modal/generate-order/generate-order.component';

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
    PriceComponent,
    InquiryComponent,
    WaitQuoteComponent,
    NuclearPriceComponent,
    StoryPriceChangeComponent,
    PriceChangeComponent,
    PriceChangeSeniorComponent,
    InquiryModalComponent,
    GenerateOrderModalComponent
  ],
  entryComponents: [],
})
export class PriceModule {
}
