import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { WaitGenerateStatementComponent } from './wait-generate-statement/wait-generate-statement.component';
import { ProjectLeaderApproveComponent } from './project-leader-approve/project-leader-approve.component';
import { AuthGmApproveComponent } from './auth-gm-approve/auth-gm-approve.component';
import { GmApproveComponent } from './gm-approve/gm-approve.component';
import { PushEpoComponent } from './push-epo/push-epo.component';
import { PushEpoErrorComponent } from './push-epo-error/push-epo-error.component';

const routes: Routes = [

  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'waitGenerateStatement',
        component: WaitGenerateStatementComponent
      },
      {
        path: 'projectLeaderApprove',
        component: ProjectLeaderApproveComponent
      },
      {
        path: 'authorizeGmApprove',
        component: AuthGmApproveComponent
      },
      {
        path: 'gmApprove',
        component: GmApproveComponent
      },
      {
        path: 'pushEpo',
        component: PushEpoComponent
      },
      {
        path: 'pushEpoCreatePoError',
        component: PushEpoComponent
      },
      {
        path: 'pushEpoError',
        component: PushEpoErrorComponent
      },
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
