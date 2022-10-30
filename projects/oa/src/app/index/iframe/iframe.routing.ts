import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IframeComponent } from './iframe.component';

const routes: Routes = [
  {
    path: '**',
    component: IframeComponent,
  },
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);