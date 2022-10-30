/*
 * @Author: your name
 * @Date: 2022-03-31 17:33:21
 * @LastEditTime: 2022-04-01 11:23:09
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /csp/cpm/frontend/projects/oa/src/app/index/supplier/supplier.routing.ts
 */
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { DemandScoreComponent } from './demand-score/demandScore.component';
import {PurchasingScoreComponent} from './purchasing-score/purchasingScore.component';
import {AcceptanceApproveComponent} from './acceptance-approve/acceptanceApprove.component'

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'demand-score',
        component: DemandScoreComponent
      },
      {
        path: 'purchasing-score',
        component: PurchasingScoreComponent
      },
      {
        path: 'acceptance-approve',
        component: AcceptanceApproveComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
