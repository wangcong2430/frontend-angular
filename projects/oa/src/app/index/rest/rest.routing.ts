import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RestComponent } from './rest.component';
import { ListComponent } from './list/list.component';
import { UserResolve } from '../../resolves/user';
import { CategoryComponent } from './category/category.component';
import { Category2Component } from './category2/category.component';
import { AttributeComponent } from './attribute/attribute.component';

const routes: Routes = [

  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'Category2',
        component: RestComponent,
        children: [
          {
            path: '',
            component: CategoryComponent,
          },
        ]
      },
      {
        path: 'Category',
        component: RestComponent,
        children: [
          {
            path: '',
            component: Category2Component,
          },
        ]
      },
      {
        path: 'Attribute',
        component: RestComponent,
        children: [{
          path: '',
          component: AttributeComponent
        }]
      },
      {
        path: ':modelClass',
        component: RestComponent,
        children: [
          {
            path: '',
            component: ListComponent,
          },
        ]
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
