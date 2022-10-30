import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'list',
        component: ListComponent
      },
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
