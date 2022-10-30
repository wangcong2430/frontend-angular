import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { ExchangeRateComponent } from './exchange-rate/exchange-rate.component';
import { TaxRateComponent } from './tax-rate/tax-rate.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'exchange-rate',
        component: ExchangeRateComponent
      },
      {
        path: 'tax-rate',
        component: TaxRateComponent
      },
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
