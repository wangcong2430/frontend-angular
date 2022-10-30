import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { PriceLibraryComponent } from './price-library/price-library.component';
import { PriceTemplateLibraryComponent } from './price-template-library/price-template-library.component';
import { ContractPriceComponent } from './contract-price/contract-price.component';
import { CommonPriceComponent } from './common-price/common-price.component';
import { ContractApprovalComponent } from './contract-approval/contract-approval.component';
import { CommonApprovalComponent } from './common-approval/common-approval.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'Library',
        component: PriceLibraryComponent,
        children: [
          {
            path: ':modelClass',
          }
        ]
      },
      {
        path: 'LibraryTemplate',
        component: PriceTemplateLibraryComponent,
        children: [
          {
            path: '',
          }
        ]
      },
      {
        path: 'contract-price',
        component: ContractPriceComponent
      },
      {
        path: 'common-price',
        component: CommonPriceComponent
      },
      {
        path: 'common-approval',
        component: CommonApprovalComponent
      },
      {
        path: 'contract-price',
        component: ContractPriceComponent
      },
      {
        path: 'contract-approval',
        component: ContractApprovalComponent
      },
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
