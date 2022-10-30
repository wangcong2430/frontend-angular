import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ApproveComponent } from './approve/approve.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create',
        component: CreateComponent
      },
      {
        path: 'approve',
        component: ApproveComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
