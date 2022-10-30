import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './micro.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';
import { MicroComponent } from './micro.component';

@NgModule({
  providers: [
    UserResolve,
    UserFormResolve,
    
  ],
  imports: [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    CommonModule,
    routing,
  ],
  declarations: [
    MicroComponent
  ],
  entryComponents: [],
})
export class MicroModule {
}
