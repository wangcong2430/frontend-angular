/**
 * Created by binghuiluo on 2017/9/30.
 */
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: 'src/app/views/index/module#IndexModule',
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
