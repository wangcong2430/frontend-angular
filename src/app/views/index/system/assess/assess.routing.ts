import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmComponent } from './confirm/confirm.component';

const routes: Routes = [
  {
    path: 'confirm',
    component: ConfirmComponent
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
