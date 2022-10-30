import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './thing.routing';
import { UserResolve } from '../../resolves/user';
import { UserFormResolve } from '../../resolves/userForm';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyComponentModule } from '../../modules/formlyComponentModule';

import { CreateStoryComponent } from './create-story/create-story.component';
import { AuditDemandComponent } from './audit-demand/audit-demand.component';
import { Common2Module } from '../../modules/common2.module';
import { DemandAcceptanceComponent } from './demand-acceptance/demand-acceptance.component';
import { DemandAuditAcceptanceComponent } from './demand-audit-acceptance/demand-audit-acceptance.component';
import { ThingComponent } from './thing.component';
import { DraftComponent } from './draft/draft.component';
import { BrandAuditComponent } from './brand-audit/brand-audit.component';
import { CreateDemandComponent } from './create-demand/create-demand.component';
import { CreateComponent } from './create/create-component';
import { ByAcceptanceComponent } from './by-acceptance/by-acceptance.component';
import { BrandManagerAcceptanceComponent } from './brand-manager-acceptance/brand-manager-acceptance.component';
import { InDeliverableComponent } from './in-deliverable/in-deliverable.component';
import {RelatedReviewerAcceptanceComponent} from "./related-reviewer-acceptance/related-reviewer-acceptance.component";
import {RelatedReviewerAuditComponent} from "./related-reviewer-audit/related-reviewer-audit.component";

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
    NgZorroAntdModule,
    routing,
    FormlyComponentModule,
    Common2Module
  ],
  declarations: [
    ThingComponent,
    CreateStoryComponent,
    AuditDemandComponent,
    DemandAcceptanceComponent,
    DemandAuditAcceptanceComponent,
    DraftComponent,
    BrandAuditComponent,
    CreateDemandComponent,
    CreateComponent,
    ByAcceptanceComponent,
    BrandManagerAcceptanceComponent,
    InDeliverableComponent,
    RelatedReviewerAcceptanceComponent,
    RelatedReviewerAuditComponent
  ],
  exports: [
    ByAcceptanceComponent,
  ],
  entryComponents: [],
})
export class ThingModule {
}
