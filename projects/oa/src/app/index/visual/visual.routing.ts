import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { ApiLogComponent } from './api-log/api-log.component';
import { ApiSettingComponent } from './api-setting/api-setting.component';
import { AppidSettingComponent } from './appid-setting/appid-setting.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'api-setting',
        component: ApiSettingComponent
      },
      {
        path: 'api-log',
        component: ApiLogComponent
      },
      {
        path: 'appid-setting',
        component: AppidSettingComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
