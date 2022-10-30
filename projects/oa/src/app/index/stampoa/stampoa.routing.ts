import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApprovalStampoaComponent } from "./approval/Approval.component";
import { ContractStampoaComponent } from "./contract/Contract.component";
import { SignStampoaComponent } from "./sign/Sign.component";

const routes: Routes = [
  {
    path: 'approval',
    component: ApprovalStampoaComponent
  },
  {
    path: 'contract',
    component: ContractStampoaComponent
  },
  {
    path: 'sign',
    component: SignStampoaComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);