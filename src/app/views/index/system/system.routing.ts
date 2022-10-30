import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { UserResolve } from '../../../resolves/user';
import { SystemComponent } from './system.component';

const routes: Routes = [
  {
    path: '',
    component: SystemComponent,
    children: [
      {
        path: 'order',
        loadChildren: 'src/app/views/index/system/order/order.module#OrderModule'
      },
      {
        path: 'assess',
        loadChildren: 'src/app/views/index/system/assess/assess.module#AssessModule'
      },
      {
        path: 'price',
        loadChildren: 'src/app/views/index/system/price/price.module#PriceModule'
      },
      {
        path: 'query',
        loadChildren: 'src/app/views/index/system/query/query.module#QueryModule'
      },
      {
        path: 'bulletin',
        loadChildren: 'src/app/views/index/system/bulletin/bulletin.module#BulletinModule'
      },
      {
        path: 'supplier',
        loadChildren: 'src/app/views/index/system/supplier/supplier.module#SupplierModule'
      },
      {
        path: 'contract',
        loadChildren: 'src/app/views/index/system/contract/contract.module#ContractModule'
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
