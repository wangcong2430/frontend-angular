import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RestComponent } from './rest.component';
import { ListComponent } from './list/list.component';
import { routing } from './rest.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';

import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';

import { FormlyComponentModule } from '../../modules/formlyComponentModule';
import { CategoryComponent } from './category/category.component';
import { Category2Component } from './category2/category.component';
import { AttributeComponent } from './attribute/attribute.component';

import { Common2Module } from '../../modules/common2.module';

import { LabelClassifyManagementModalComponent } from '../../containers/modal/label-classify-mangement/label-classify-mangement.component';

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
    Common2Module,
    NgZorroAntdModule,
    routing,
    FormlyComponentModule,
  ],
  declarations: [
    RestComponent,
    ListComponent,
    CategoryComponent,
    Category2Component,
    AttributeComponent,
    LabelClassifyManagementModalComponent
  ],
  entryComponents: [],
})
export class RestModule {
}
