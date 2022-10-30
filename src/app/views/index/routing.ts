import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexComponent } from './index.component';
import { RegisterComponent } from './register/register.component';
import { BaseInfoComponent } from './register/base-info/base-info.component';
import { CategoryComponent } from './register/category/category.component';
import { StyleComponent } from './register/style/style.component';
import { WorkComponent } from './register/work/work.component';
import { UserResolve } from '../../resolves/user';
import { UnComponent } from './errors/un/un.component';
import { RecruitmentComponent } from './static/recruitment/recruitment.component';
import { LoginComponent } from './register/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    resolve: {
      user: UserResolve
    },
    children: [
      {
        path: '',
        redirectTo: '/system/bulletin/index',
        pathMatch: 'full'
      },
      {
        path: 'register',
        component: RegisterComponent,
        children: [
          {
            path: 'base-info',
            component: BaseInfoComponent,
          },
          {
            path: 'category',
            component: CategoryComponent,
          },
          {
            path: 'style',
            component: StyleComponent,
          },
          {
            path: 'work',
            component: WorkComponent,
          }
        ]
      },
    ]
  },
  {
    path: 'system',
    resolve: {
      user: UserResolve
    },
    loadChildren: 'src/app/views/index/system/system.module#SystemModule'
  },

  {
    path: 'un',
    component: UnComponent,
  },
  {
    path: 'recruitment',
    component: RecruitmentComponent
  },
  {
    path: 'qqLogin',
    component: LoginComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
