import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserResolve } from '../../resolves/user';
import { InquiryComponent } from './inquiry/inquiry.component';
import { WaitQuoteComponent } from './wait-quote/wait-quote.component';
import { NuclearPriceComponent } from './nuclear-price/nuclear-price.component';
import { StoryPriceChangeComponent } from './story-price-change/story-price-change.component';
import { PriceChangeComponent } from './price-change/price-change.component';
import { PriceChangeSeniorComponent } from './price-change-senior/price-change-senior.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      user: UserResolve,
    },
    children: [
      {
        path: 'inquiry',
        component: InquiryComponent
      },
      {
        path: 'testInquiry',
        component: InquiryComponent
      },
      {
        path: 'waitQuote',
        component: WaitQuoteComponent
      },
      {
        path: 'nuclearPrice',
        component: NuclearPriceComponent
      },
      {
        path: 'testNuclearPrice',
        component: NuclearPriceComponent
      },
      {
        path: 'demandSideConfirm',
        component: InquiryComponent
      },
      {
        path: 'story-price-change',
        component: StoryPriceChangeComponent
      },
      {
        path: 'price-change',
        component: PriceChangeComponent
      },
      {
        path: 'price-change-senior',
        component: PriceChangeSeniorComponent
      },
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
