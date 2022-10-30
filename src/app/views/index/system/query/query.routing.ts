import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SoaComponent } from './soa/soa.component';
import { OrderComponent } from './order/order.component';
import { ApproveQueryComponent } from './approve-query/approve-query.component';
import { CommonPriceComponent } from './common-price/common-price.component';
import { AwaitMailComponent } from './await-mail/await-mail.component';


const routes: Routes = [
  {
    path: 'order',
    component: OrderComponent
  },
  {
    path: 'soa',
    component: SoaComponent
  },
  {
    path: 'approve-query',
    component: ApproveQueryComponent
  },
  {
    path: 'common-price',
    component: CommonPriceComponent
  },
  {
    path: 'await-mail',
    component: AwaitMailComponent
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
