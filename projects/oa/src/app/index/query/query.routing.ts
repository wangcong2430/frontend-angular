import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoryComponent } from './story/story.component';
import { ThingComponent } from './thing/thing.component';
import { LabelComponent } from './label/label.component';
import { OrderComponent } from './order/order.component';
import { SoaComponent } from './soa/soa.component';
import { ProcessComponent } from './process/process.component';
import { ApproveQueryComponent } from './approve-query/approve-query.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { RoleComponent } from './role/role.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'story',
        component: StoryComponent
      },
      {
        path: 'thing',
        component: ThingComponent
      },
      {
        path: 'order',
        component: OrderComponent
      },
      {
        path: 'soa',
        component: SoaComponent
      },
      {
        path: 'process',
        component: ProcessComponent
      },
      {
        path: 'approve-query',
        component: ApproveQueryComponent
      },
      {
        path: 'statistics',
        component: StatisticsComponent
      },
      {
        path: 'role',
        component: RoleComponent
      },
      {
        path: 'used-statistics',
        component: StatisticsComponent
      },
      {
        path: 'label',
        component: LabelComponent
      }
    ]
  }
];
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
