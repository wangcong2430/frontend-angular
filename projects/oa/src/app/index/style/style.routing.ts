import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { StyleComponent } from './list/styleComponent';

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'list',
        component: StyleComponent
      },
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
