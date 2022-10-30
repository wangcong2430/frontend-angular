import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { BudgetComponent } from './budget.component';
import { ApplyComponent } from './apply/apply.component';
import { ApproveComponent } from './approve/approve.component';
import { ApproveLogComponent } from './approve-log/approve-log.component';

const routes: Routes = [

  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    component: BudgetComponent,
    children: [
      {
        path: 'apply',
        component: ApplyComponent
      },
      {
        path: 'approve',
        component: ApproveComponent
      },
      {
        path: 'approve-log',
        component: ApproveLogComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
