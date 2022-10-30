import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './iframe.routing';

import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { Common2Module } from '../../modules/common2.module';
import {IframeComponent} from './iframe.component';

@NgModule({
  providers: [
    UserResolve,
    UserFormResolve,
  ],
  imports: [
    CommonModule,
    Common2Module,
    routing,
  ],
  declarations: [
    IframeComponent
  ],
  entryComponents: [],
})
export class IframeModule {
}
