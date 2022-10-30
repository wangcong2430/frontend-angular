import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { routing } from './routing';

import { ApiModule } from '../../../api-client/api.module';

import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { RegisterComponent } from './register/register.component';
import { BaseInfoComponent } from './register/base-info/base-info.component';
import { CategoryComponent } from './register/category/category.component';
import { StyleComponent } from './register/style/style.component';
import { WorkComponent } from './register/work/work.component';
import { IndexComponent } from './index.component';
import { UnComponent } from './errors/un/un.component';
import { ResponseInterceptorService } from '../../services/response-interceptor.service';
import { UserInfoService } from '../../services/user-info.service';
import { TreeService } from '../../services/tree.service';
import { BASE_PATH } from '../../../api-client';
import { UserResolve } from '../../resolves/user';
import { RecruitmentComponent } from './static/recruitment/recruitment.component';
import { LoginComponent } from './register/login/login.component';


@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptorService, multi: true },
    { provide: BASE_PATH, useValue: '.' },
    UserInfoService,
    UserResolve,
    TreeService,
  ],
  imports: [
    CommonModule,
    FormlyModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    routing,
    ApiModule,
    NgZorroAntdModule,
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
    IndexComponent,
    UnComponent,
    RegisterComponent,
    BaseInfoComponent,
    CategoryComponent,
    StyleComponent,
    WorkComponent,
    RecruitmentComponent,
    LoginComponent
  ],
  entryComponents: []
})
export class IndexModule {
}
