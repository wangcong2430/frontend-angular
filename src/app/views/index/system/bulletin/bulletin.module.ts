import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { routing } from './bulletin.routing';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { IndexComponent } from './index/index.component';
import { RecruitComponent } from './recruit/recruit.component';
import { SystemComponent } from './system/system.component';
import { Common2Module } from '../../../../modules/common2.module';

import { LanguageService } from '../../../../services/language.service';

@NgModule({
  providers: [
    LanguageService,
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  imports: [
    NgZorroAntdModule,
    CommonModule,
    routing,
    Common2Module,
    FormsModule
  ],
  declarations: [
    IndexComponent,
    RecruitComponent,
    SystemComponent
  ],
  entryComponents: [],
})
export class BulletinModule {
}
