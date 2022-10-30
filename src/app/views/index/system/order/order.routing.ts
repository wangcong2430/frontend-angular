import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DistributeComponent } from './distribute/distribute.component';
import { FabricationComponent } from './fabrication/fabrication.component';
import { PriceChangeComponent } from './price-change/price-change.component';

const routes: Routes = [
  {
    path: 'distribute',
    component: DistributeComponent
  },
  {
    path: 'fabrication',
    component: FabricationComponent
  },
  {
    path: 'price-change',
    component: PriceChangeComponent
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
