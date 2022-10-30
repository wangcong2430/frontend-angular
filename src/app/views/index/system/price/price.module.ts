import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { routing } from './price.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { AnswerComponent } from './answer/answer.component';
import { Common2Module } from '../../../../modules/common2.module';
import { FormsModule } from '@angular/forms';


@NgModule({
  providers: [
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  imports: [
    DragDropModule,
    NgZorroAntdModule,
    CommonModule,
    Common2Module,
    FormsModule,
    routing,
  ],
  declarations: [
    AnswerComponent,
  ],
  entryComponents: [],
})

export class PriceModule {}
