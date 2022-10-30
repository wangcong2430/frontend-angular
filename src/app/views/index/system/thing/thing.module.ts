import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './thing.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';

@NgModule({
  providers: [
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  imports: [
    NgZorroAntdModule,
    CommonModule,
    routing,
  ],
  declarations: [
  ],
  entryComponents: [],
})
export class ThingModule {}
