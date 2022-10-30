import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupplierDetailComponent } from './detail/detail.component';
import { SupplierAbilityComponent } from "./ability/ability.component";
import { SupplierProductComponent } from "./product/product.component";
import { LeaveGuard } from 'src/app/resolves/leave';

const routes: Routes = [
  {
    path: 'detail',
    component: SupplierDetailComponent
  },
  {
    path: 'ability',
    component: SupplierAbilityComponent
  }
  ,
  {
    path: 'product',
    component: SupplierProductComponent,
    canDeactivate:[LeaveGuard]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
