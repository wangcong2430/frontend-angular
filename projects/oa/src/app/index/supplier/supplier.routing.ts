/*
 * @Author: your name
 * @Date: 2022-03-31 17:33:21
 * @LastEditTime: 2022-04-01 10:50:53
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /csp/cpm/frontend/projects/oa/src/app/index/supplier/supplier.routing.ts
 */
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { ShortlistComponent } from './shortlist/shortlist.component';
import { ShortlistContentComponent } from './shortlistcontent/shortlistcontent.component';
import { ListComponent } from './list/list.component';
import { ContractComponent } from './contract/contract.component';
import { EmailComponent } from './email/email.component';
import { DetailComponent } from './detail/detail.component';
import {SupplierAbilityComponent} from "./ability/ability.component";

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'list',
        component: ListComponent
      },
      {
        path: 'shortlist',
        component: ShortlistComponent
      },
      {
        path: 'contract',
        component: ContractComponent
      },
      {
        path: 'email',
        component: EmailComponent
      },
      {
        path: 'detail',
        component: DetailComponent
      },
      {
        path: 'shortlistContent',
        component: ShortlistContentComponent
      },
      {
        path: 'ability',
        component: SupplierAbilityComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
