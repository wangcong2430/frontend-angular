import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { CreateStoryComponent } from './create-story/create-story.component';
import { AuditDemandComponent } from './audit-demand/audit-demand.component';
import { DemandAcceptanceComponent } from './demand-acceptance/demand-acceptance.component';
import { DemandAuditAcceptanceComponent } from './demand-audit-acceptance/demand-audit-acceptance.component';
import { ThingComponent } from './thing.component';
import { DraftComponent } from './draft/draft.component';
import { BrandAuditComponent } from './brand-audit/brand-audit.component';
import { CreateDemandComponent } from './create-demand/create-demand.component';
import { ByAcceptanceComponent } from './by-acceptance/by-acceptance.component';
import { BrandManagerAcceptanceComponent } from './brand-manager-acceptance/brand-manager-acceptance.component';
import { InDeliverableComponent } from './in-deliverable/in-deliverable.component';
import {RelatedReviewerAcceptanceComponent} from "./related-reviewer-acceptance/related-reviewer-acceptance.component";
import {RelatedReviewerAuditComponent} from "./related-reviewer-audit/related-reviewer-audit.component";

const routes: Routes = [

  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: '',
        redirectTo: '/bulletin/index',
        pathMatch: 'full'
      },
      {
        path: 'createStory',
        component: ThingComponent,
        children: [
          {
            path: '',
            component: CreateStoryComponent,
          },
          {
            path: ':storyId',
            component: CreateStoryComponent,
          }
        ]
      },
      {
        path: 'draft',
        component: DraftComponent
      },
      {
        path: 'auditDemand',
        component: AuditDemandComponent
      },
      {
        path: 'by-acceptance',
        component: ByAcceptanceComponent
      },
      {
        path: 'relatedReviewerAcceptance',
        component: RelatedReviewerAcceptanceComponent
      },
      {
        path: 'demandAcceptance',
        component: DemandAcceptanceComponent
      },
      {
        path: 'brandManagerAcceptance',
        component: BrandManagerAcceptanceComponent
      },
      {
        path: 'demandAuditAcceptance',
        component: DemandAuditAcceptanceComponent
      },
      {
        path: 'brandAudit',
        component: BrandAuditComponent
      },
      {
        path: 'createDemand',
        component: ThingComponent,
        children: [
          {
            path: '',
            component: CreateDemandComponent,
          },
          {
            path: ':storyId',
            component: CreateDemandComponent,
          }
        ]
      },
      {
        path: 'create',
        component: ThingComponent,
        children: [
          {
            path: '',
            component: CreateDemandComponent,
          },
          {
            path: ':storyId',
            component: CreateDemandComponent,
          }
        ]
      },
      {
        path: 'in-deliverable',
        component: InDeliverableComponent
      },
      {
        path: 'relatedReviewerAudit',
        component: RelatedReviewerAuditComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
