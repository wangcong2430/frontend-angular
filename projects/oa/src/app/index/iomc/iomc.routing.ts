import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { DemandAuditConfirmationComponent } from '../apply-change/demand-audit-confirmation/demand-audit-confirmation.component';
import { DemandPersonConfirmationComponent } from '../apply-change/demand-person-confirmation/demand-person-confirmation.component';
import { AcceptanceApproveComponent } from '../order/acceptance-approve/acceptance-approve.component';
import { ByAcceptanceComponent } from '../thing/by-acceptance/by-acceptance.component';
import { DemandAcceptanceComponent } from '../thing/demand-acceptance/demand-acceptance.component';
import { CustomModule } from './custom/custom.module'

const routes: Routes = [

  {
    path: 'by-acceptance',
    component: ByAcceptanceComponent
  },
  {
    path: 'demand-person-ponfirmation',
    component: DemandPersonConfirmationComponent
  },

  {
    path: 'demand-acceptance',
    component: DemandAcceptanceComponent
  },
  {
    path: 'demand-audit-confirmation',
    component: DemandAuditConfirmationComponent

  },
  {
    path: 'acceptance-approve',
    component: AcceptanceApproveComponent
  },
  {
    path: 'custom',
    loadChildren: 'projects/oa/src/app/index/iomc/custom/custom.module#CustomModule'
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
