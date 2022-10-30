import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexComponent } from './index.component';
import { routing } from './index.routing';
import { UserResolve } from '../resolves/user';
import { TodoCountService } from '../services/toco.count.service';
import { HttpModule } from '@angular/http';
import { AuthService } from '../services/auth.service';

import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule, ModalModule, PaginationModule} from 'ngx-bootstrap';

import { LayoutComponent } from '../components/layout/layout.component';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { UnComponent } from './errors/un/un.component';
import { PhotoSwipeComponent } from '../containers/modal/photo-swipe/photo-swipe.component';
import { BulletlinComponent } from '../containers/modal/bulletlin/bulletlin.component';
import { PushEpoModalComponent } from '../containers/modal/push-epo/push-epo.component';


import { Common2Module } from '../modules/common2.module';
import { FormlyComponentModule } from '../modules/formlyComponentModule';

import { DetailComponent } from './page/detail/detail.component';
import { ThingModule } from './thing/thing.module';
import { CompleteComponent } from './errors/complete/complete.component';
import { QueryModule } from './query/query.module';
import { IomcComponent } from './iomc/iomc.component';
import { IeggComponent } from './iegg/iegg.component';


@NgModule({
  providers: [
    AuthService,
    TodoCountService,
    UserResolve,
  ],
  imports: [
    TranslateModule,
    BsDropdownModule.forRoot(),
    CommonModule,
    Common2Module,
    FormsModule,
    HttpModule,
    routing,
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    NgZorroAntdModule,
    FormlyComponentModule,
    ThingModule,
    QueryModule
  ],
  declarations: [
    IndexComponent,
    LayoutComponent,
    PhotoSwipeComponent,
    PushEpoModalComponent,
    BulletlinComponent,
    HeaderComponent,
    FooterComponent,
    UnComponent,
    DetailComponent,
    CompleteComponent,
    IomcComponent,
    IeggComponent
  ],
  entryComponents: [],
})
export class IndexModule {
}
