import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { BrowseComponent } from './browse/browse.component';

const routes: Routes = [

  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'browse',
        component: BrowseComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
