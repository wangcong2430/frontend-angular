import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index.component';
import { UserResolve } from '../resolves/user';
import { AuthGuard } from '../resolves/auth';
import { UnComponent } from './errors/un/un.component';
import { DetailComponent } from './page/detail/detail.component';
import { CreateDemandComponent } from './thing/create-demand/create-demand.component';
import { CompleteComponent} from './errors/complete/complete.component';
import { StoryComponent } from './query/story/story.component';

import { IomcComponent  } from './iomc/iomc.component';
import { IeggComponent  } from './iegg/iegg.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    canActivate: [AuthGuard],
    resolve: {
      user: UserResolve
    },
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        redirectTo: '/bulletin/index',
        pathMatch: 'full'
      },
      {
        path: 'rest-new',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/rest-new/rest-new.module#RestNewModule'
      },
      {
        path: 'rest',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/rest/rest.module#RestModule'
      },
      {
        path: 'budget',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/budget/budget.module#BudgetModule'
      },
      {
        path: 'thing',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/thing/thing.module#ThingModule'
      },
      {
        path: 'price',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/price/price.module#PriceModule'
      },
      {
        path: 'order',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/order/order.module#OrderModule'
      },
      {
        path: 'query',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/query/query.module#QueryModule'
      },
      {
        path: 'statement',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/statement/statement.module#StatementModule'
      },
      {
        path: 'project',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/project/project.module#ProjectModule'
      },
      {
        path: 'library',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/library/library.module#LibraryModule'
      },
      {
        path: 'perf',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/perf/perf.module#PerfModule'
      },
      {
        path: 'supplier',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/supplier/supplier.module#SupplierModule'
      },
      {
        path: 'orderSenior',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/order-senior/order-senior.module#OrderSeniorModule'
      },
      {
        path: 'user',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/user/user.module#UserModule'
      },
      {
        path: 'department',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/department/department.module#DepartmentModule'
      },
      {
        path: 'style',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/style/style.module#StyleModule'
      },
      {
        path: 'maintenance',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/maintenance/maintenance.module#MaintenanceModule'
      },
      {
        path: 'bulletin',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/bulletin/bulletin.module#BulletinModule'
      },
      {
        path: 'applyChange',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/apply-change/apply-change.module#ApplyChangeModule'
      },
      {
        path: 'me',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/me/me.module#MeModule'
      },
      {
        path: 'resources',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/resources/resources.module#ResourcesModule'
      },
      {
        path: 'visual',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/visual/visual.module#VisualModule'
      },
      {
        path: 'micro',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/micro/micro.module#MicroModule'
      },
      {
        path: 'KbApplets',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/kb-applets/kb-applets.module#KbAppletsModule'
      },
      {
        path: 'stamp',
         canActivateChild: [AuthGuard],
         loadChildren: 'projects/oa/src/app/index/stampoa/stampoa.module#StampoaModule'
      },
      {
        path: 'iframe',
        canActivateChild: [AuthGuard],
        loadChildren: 'projects/oa/src/app/index/iframe/iframe.module#IframeModule'
      }


    ]
  },
  {
    path: 'thing/createDemandExtend',
    canActivateChild: [AuthGuard],
    component: CreateDemandComponent,
  },
  {
    path: 'thing/createDemandExtend/:storyId',
    canActivateChild: [AuthGuard],
    component: CreateDemandComponent,
  },
  {
    path: 'query/storyExtend',
    canActivateChild: [AuthGuard],
    component: StoryComponent,
  },
  {
    path: 'un',
    component: UnComponent
  },
  {
    path: 'thing/complete',
    component: CompleteComponent
  },
  {
    path: 'pages/details',
    component: DetailComponent
  },
  {
    path: 'iomc',
    component: IomcComponent,
    loadChildren: 'projects/oa/src/app/index/iomc/iomc.module#IomcModule'
  },
  {
    path: 'iegg',
    component: IeggComponent,
    loadChildren: 'projects/oa/src/app/index/iegg/iegg.module#IeggModule'
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
