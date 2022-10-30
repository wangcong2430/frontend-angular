import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { DemandAuditConfirmationComponent } from '../apply-change/demand-audit-confirmation/demand-audit-confirmation.component';
import { DemandPersonConfirmationComponent } from '../apply-change/demand-person-confirmation/demand-person-confirmation.component';
import { AcceptanceApproveComponent } from '../order/acceptance-approve/acceptance-approve.component';
import { ProjectLeaderApproveComponent } from '../statement/project-leader-approve/project-leader-approve.component';
import { ByAcceptanceComponent } from '../thing/by-acceptance/by-acceptance.component';
import { DemandAcceptanceComponent } from '../thing/demand-acceptance/demand-acceptance.component';
import { DemandAuditAcceptanceComponent } from '../thing/demand-audit-acceptance/demand-audit-acceptance.component';
import { RelatedReviewerAcceptanceComponent } from '../thing/related-reviewer-acceptance/related-reviewer-acceptance.component';

const routes: Routes = [


  {
    path: 'demand-person-ponfirmation',
    component: DemandPersonConfirmationComponent
  },
  {
    path: 'demand-audit-confirmation',
    component: DemandAuditConfirmationComponent
  },

  {
    path: 'by-acceptance',
    component: ByAcceptanceComponent
  },

  {
    path: 'demandAcceptance',
    component: DemandAcceptanceComponent
  },

  {
    path: 'relatedReviewerAcceptance',
    component: RelatedReviewerAcceptanceComponent
  },

  {
    path: 'demandAuditAcceptance',
    component: DemandAuditAcceptanceComponent
  },

  {
    path: 'projectLeaderApprove',
    component: ProjectLeaderApproveComponent
  },


];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
