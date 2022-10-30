import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { TableContainer } from '../containers/table/table.container';
import { SearchFormContainer } from '../containers/search-form/search-form.container';
import { TableGroupContainer } from '../containers/table-group/table-group.container';
import { ThingDetailModalComponent } from '../containers/modal/thing-detail/thing-detail.component';
import { ThingPriceChangeModalComponent } from '../containers/modal/thing-price-change/thing-price-change.component';
import { TableGroupNewContainer } from '../containers/table-group-new/table-group-new.container';
import { CrumbComponent } from '../components/crumb/crumb.component';
import { LabelAditComponent } from '../components/label-edit/label-edit.component';
import { FilterListComponent } from '../components/fillter-list/filter-list.component';
import { PriceDetailModalComponent } from '../containers/modal/price-detail/price-detail.component';
import { ShowImgModalComponent } from '../containers/modal/show-img/show-img.component';
// import { UploadPlanModalComponent } from '../containers/modal/upload-plan/upload-plan.component';
import { UploadsPlanModalComponent } from '../containers/modal/uploads-plan/uploads-plan.component';
import { SomePipe } from '../pipes/some.pipe';
import { FileextsPipe } from '../pipes/fileext.pipe';
import { DateFormatPipe } from '../pipes/date-format.pipe';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { SecurityHtmlPipe } from '../pipes/security-html.pipe';
import { ThingLabelModalComponent } from '../containers/modal/thing-label/thing-label.component';
import { UserPipe } from '../pipes/user.pipe';
import { FormComponent } from '../containers/modal/form/form.component';

import { TableModalComponent } from '../containers/modal/table/table.component';

import { FormlyComponentModule } from './formlyComponentModule';
import { CurrencyPipe } from '@angular/common';
import { MycurrencyPipe } from '../pipes/mycurrency.pipe';
import { LabelPipe } from '../pipes/label.pipe';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    FormlyComponentModule,
    LazyLoadImageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    CrumbComponent,
    FilterListComponent,
    TableContainer,
    SearchFormContainer,
    TableGroupContainer,
    TableGroupNewContainer,
    ThingDetailModalComponent,
    ThingPriceChangeModalComponent,
    PriceDetailModalComponent,
    ShowImgModalComponent,
    UploadsPlanModalComponent,
    LabelAditComponent,
    SomePipe,
    FileextsPipe,
    UserPipe,
    DateFormatPipe,
    SecurityHtmlPipe,
    ThingLabelModalComponent,
    FormComponent,
    MycurrencyPipe,
    TableModalComponent,
    LabelPipe
  ],
  exports: [
    NgZorroAntdModule,
    FormlyComponentModule,
    CrumbComponent,
    FilterListComponent,
    SomePipe,
    UserPipe,
    DateFormatPipe,
    SecurityHtmlPipe,
    TableContainer,
    SearchFormContainer,
    TableGroupContainer,
    TableGroupNewContainer,
    ThingDetailModalComponent,
    ThingPriceChangeModalComponent,
    PriceDetailModalComponent,
    ShowImgModalComponent,
    UploadsPlanModalComponent,
    TranslateModule,
    LazyLoadImageModule,
    LabelAditComponent,
    ThingLabelModalComponent,
    FormComponent,
    MycurrencyPipe,
    TableModalComponent,
    LabelPipe
  ],
  providers   : [ CurrencyPipe ]
  // providers   : [ { provide: NZ_I18N, useValue: zh_CN } ]
})
export class Common2Module {}
