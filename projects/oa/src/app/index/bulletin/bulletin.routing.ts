import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { IndexComponent } from './index/index.component';
import { RecruitComponent } from './recruit/recruit.component';
import { SystemComponent } from './system/system.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'index',
        component: IndexComponent
      },
      {
        path: 'recruit',
        component: RecruitComponent
      },
      {
        path: 'system',
        component: SystemComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
