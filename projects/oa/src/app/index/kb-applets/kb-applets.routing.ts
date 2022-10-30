
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { ReportComponent } from './report/report.component';

const routes: Routes = [
  {
    path: 'report',
    component: ReportComponent
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
