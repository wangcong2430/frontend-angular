import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { RecruitComponent } from './recruit/recruit.component';
import { SystemComponent } from './system/system.component';

const routes: Routes = [
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
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
