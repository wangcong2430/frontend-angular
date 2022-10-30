import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { DemandPersonConfirmationComponent } from './demand-person-confirmation/demand-person-confirmation.component';
import { BrandManagerConfirmationComponent } from './brand-manager-confirmation/brand-manager-confirmation.component';
import { DemandAuditConfirmationComponent } from './demand-audit-confirmation/demand-audit-confirmation.component';
import { SpmConfirmationComponent } from './spm-confirmation/spm-confirmation.component';
import { ChangeOrderApprovalComponent } from './change-order-approval/change-order-approval.component';
import { GmConfirmationComponent } from './gm-confirmation/gm-confirmation.component';
import {
  UpgradeOrderApprovalConfirmationComponent
} from './upgrade-order-approval-confirmation/upgrade-order-approval-confirmation.component';
import { LabelChangeConfirmationComponent } from './label-change-confirmation/label-change-confirmation.component';


const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'demandPersonConfirmation',
        component: DemandPersonConfirmationComponent
      },
      {
        path: 'brandManagerConfirmation',
        component: BrandManagerConfirmationComponent
      },
      {
        path: 'demandAuditConfirmation',
        component: DemandAuditConfirmationComponent
      },
      {
        path: 'spmConfirmation',
        component: SpmConfirmationComponent
      },
      {
        path: 'changeOrderApproval',
        component: ChangeOrderApprovalComponent
      },
      {
        path: 'changeGmConfirmation',
        component: GmConfirmationComponent
      },
      {
        path: 'changeUpgradeOrderApproval',
        component: UpgradeOrderApprovalConfirmationComponent
      },
      {
        path: 'labelChangeConfirmation',
        component: LabelChangeConfirmationComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
