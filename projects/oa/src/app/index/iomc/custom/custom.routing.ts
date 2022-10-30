import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttachmentInteractionComponent } from './attachment-interaction/attachment-interaction.component';

const routes: Routes = [
  {
    path: 'attachment-interaction',
    component: AttachmentInteractionComponent
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
