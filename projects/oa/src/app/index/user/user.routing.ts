import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { OaComponent } from './oa/oa.component';
import { QqComponent } from './qq/qq.component';
import { HelpComponent } from './help/help.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { WorkComponent } from './work/work.component';

const routes: Routes = [

  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'oa',
        component: OaComponent
      },
      {
        path: 'qq',
        component: QqComponent
      },
      {
        path: 'help',
        component: HelpComponent
      },
      {
        path: 'feedback',
        component: FeedbackComponent
      },
      {
        path: 'work',
        component: WorkComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
