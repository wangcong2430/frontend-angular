import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { OrderComponent } from './order.component';
import { CreateComponent } from './create/create.component';
import { ApproveComponent } from './approve/approve.component';
import { PurchaseAcceptanceComponent } from './purchase-acceptance/purchase-acceptance.component';
import { SeniorApproveComponent } from './senior-approver/senior-approver.component';
import { InProductionComponent } from './in-production/in-production.component';
import {AcceptanceApproveComponent} from './acceptance-approve/acceptance-approve.component';
import { AcceptanceEvaluateComponent } from './acceptance-evaluate/acceptance-evaluate.component';

const routes: Routes = [

  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    component: OrderComponent,
    children: [
      {
        path: 'create',
        component: CreateComponent
      },
      {
        path: 'testCreate',
        component: CreateComponent
      },
      {
        path: 'approve',
        component: ApproveComponent
      },
      {
        path: 'senior-approver',
        component: SeniorApproveComponent
      },
      {
        path: 'purchasingManagerAcceptance',
        component: PurchaseAcceptanceComponent
      },
      {
        path: 'in-production',
        component: InProductionComponent
      },
      {
        path: 'acceptance-approve',
        component: AcceptanceApproveComponent
      },
      {
        path: 'acceptance-evaluate',
        component: AcceptanceEvaluateComponent
      },
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
