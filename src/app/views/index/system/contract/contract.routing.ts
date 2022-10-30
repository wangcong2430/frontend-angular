import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractStampComponent } from "./stamp/stamp.component";
import {SignStampComponent } from "./sign/sign.component";

const routes: Routes = [
  {
    path: 'stamp',
    component: ContractStampComponent
  },
  {
    path: 'sign',
    component: SignStampComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
