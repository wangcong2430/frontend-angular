import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MicroComponent } from './micro.component';

const routes: Routes = [
  {
    path: '**',
    component: MicroComponent,
  },
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);