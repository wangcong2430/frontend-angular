import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { TaskComponent } from './task/task.component';
import { SystemConfigComponent } from './system-config/system-config.component';
import { ApiComponent } from './api/api.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'system-config',
        component: SystemConfigComponent
      },
      {
        path: 'api',
        component: ApiComponent
      },
      {
        path: 'task',
        component: TaskComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
