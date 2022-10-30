import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: 'projects/oa/src/app/index/index.module#IndexModule'
  },
  {
    path: '',
    redirectTo: '/bulletin/index',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/bulletin/index'
  }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
export class AppRoutingModule {}
