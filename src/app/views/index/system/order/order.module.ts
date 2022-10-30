import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { routing } from './order.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { DistributeComponent } from './distribute/distribute.component';
import { FabricationComponent } from './fabrication/fabrication.component';
import { Common2Module } from '../../../../modules/common2.module';
import { PriceChangeComponent } from './price-change/price-change.component';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../../services/language.service';

@NgModule({
  providers: [
    LanguageService,
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  imports: [
    CommonModule,
    Common2Module,
    FormsModule,
    DragDropModule,
    routing,
    NgZorroAntdModule,
  ],
  declarations: [
    DistributeComponent,
    FabricationComponent,
    PriceChangeComponent
  ],
  entryComponents: [],
})
export class OrderModule {
}
