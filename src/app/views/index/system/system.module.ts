import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './system.routing';
import { UserResolve } from '../../../resolves/user';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';

import { SystemComponent } from './system.component';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { LayoutHeaderComponent } from '../../../components/layout-header/header.component';
import { LayoutFooterComponent } from '../../../components/layout-footer/footer.component';
import { BulletlinComponent } from '../../../containers/modal/bulletlin/bulletlin.component';
import { PhotoSwipeComponent } from '../../../containers/modal/photo-swipe/photo-swipe.component';
import { Common2Module } from '../../../modules/common2.module';
import { InvitationModalComponent } from '../../../containers/modal/invitation/invitation.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  providers: [
    UserResolve,
    {provide: NZ_I18N, useValue: zh_CN}
  ],
  imports: [
    CommonModule,
    NgZorroAntdModule,
    Common2Module,
    FormsModule,
    routing,
  ],
  declarations: [
    SystemComponent,
    LayoutComponent,
    LayoutHeaderComponent,
    LayoutFooterComponent,
    BulletlinComponent,
    PhotoSwipeComponent,
    InvitationModalComponent
  ],
  entryComponents: [],
})
export class SystemModule {
}
