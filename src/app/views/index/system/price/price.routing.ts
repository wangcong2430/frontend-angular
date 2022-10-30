import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnswerComponent } from './answer/answer.component';

const routes: Routes = [
  {
    path: 'answer',
    component: AnswerComponent
  },
  {
    path: 'testAnswer',
    component: AnswerComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
