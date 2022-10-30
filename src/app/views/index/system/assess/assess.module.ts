import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { routing } from './assess.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { ConfirmComponent } from './confirm/confirm.component';
import { Common2Module } from '../../../../modules/common2.module';


@NgModule({
  providers: [
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
    ConfirmComponent,
  ],
  entryComponents: [],
})
export class AssessModule {}
