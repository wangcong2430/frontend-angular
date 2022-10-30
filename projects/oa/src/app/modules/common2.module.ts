import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgZorroAntdModule, NzDropDownModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import { NumberPipe } from '../pipes/number.pipe';
import { SecurityHtmlPipe, SecurityUrlPipe } from '../pipes/security-html.pipe';
import { OrderByPipe } from '../pipes/order-by.pipe';
import { SearchPipe } from '../pipes/search.pipe';
import { SomePipe } from '../pipes/some.pipe';
import { FileextsPipe } from '../pipes/fileext.pipe';
import { UserPipe } from '../pipes/user.pipe';
import { LinkPipe } from '../pipes/link.pipe';
import { FormatPipe } from '../pipes/format.pipe';
import { DateFormatPipe } from '../pipes/date-format.pipe';
import { LabelPipe } from '../pipes/label.pipe';
import { OperatorPipe } from '../pipes/operator.pipe';
import { PreviewPipe } from '../pipes/preview.pipe';
import { MathPipe } from '../pipes/math.pipe';



import { LimitToPipe } from '../pipes/limit-to.pipe';
import { AutoDecodePipe } from '../pipes/auto-decode.pipe';
import { DelHtmlTagPipe } from '../pipes/del-html-tag.pipe';
import { OrderDetailIsRedPipe } from '../pipes/OrderDetailIsRed.pipe';

import { InfiniteScrollerDirective } from '../directive/infinite-scroller.directive';

import { FormlyComponentModule } from '../modules/formlyComponentModule';
import { TableContainer } from '../containers/table/table.container';
import { SearchFormContainer } from '../containers/search-form/search-form.container';
import { TableGroupContainer } from '../containers/table-group/table-group.container';
import { CreateOrderModalComponent } from '../containers/modal/create-order/create-order.component';
import { ApplyBudgeModalComponent } from '../containers/modal/apply-budge/apply-budge.component';
import { AdjustBudgeModalComponent } from '../containers/modal/adjust-budge/adjust-budge.component';
import { TableGroupNewContainer } from '../containers/table-group-new/table-group-new.container';
import { CrumbComponent } from '../components/crumb/crumb.component';
import { PriceDetailModalComponent } from '../containers/modal/price-detail/price-detail.component';

// 公用弹窗组件
import { SaveModalComponent } from '../containers/modal/save/save.component';
import { ShowImgModalComponent } from '../containers/modal/show-img/show-img.component';
import { UploadPlanModalComponent } from '../containers/modal/upload-plan/upload-plan.component';
import { UploadsPlanModalComponent } from '../containers/modal/uploads-plan/uploads-plan.component';
import { AcceptanceRateComponent } from '../containers/modal/acceptance-rate/acceptance-rate.component';
import { ProductBudgetModalComponent } from '../containers/modal/product-budget/product-budget.component';
import { ProductBudgetAdjustModalComponent } from '../containers/modal/product-budget-adjust/product-budget-adjust.component';
import { BudgetThingListComponent } from '../containers/modal/budget-thing-list/budget-thing-list.component';
import { NewThingDetailModalComponent } from '../containers/modal/new-thing-detail/new-thing-detail.component';
import { NewOrderDetailModalComponent } from '../containers/modal/new-order-detail/new-order-detail.component';
import { CreateSupplierModalComponent } from '../containers/modal/create-supplier/create-supplier.component';
import { OrderExportComponent } from '../containers/modal/order-export/order-export.component';
import { SupplierInfoModalComponent } from '../containers/modal/supplier-info/supplier-info.component';
import { CreateContractModalComponent } from '../containers/modal/create-contract/create-contract.component';
import { ContractPriceInfoModalComponent } from '../containers/modal/contract-price-info/contract-price-info.component';
import { ContractPriceApplyInfoModalComponent } from '../containers/modal/contract-price-apply-info/contract-price-apply-info.component';
import { DownloadModalComponent } from '../containers/modal/download/download.component';
import { ExportComponent } from '../containers/modal/export/export.component';
import { FormComponent } from '../containers/modal/form/form.component';
import { EditSecrecyFormModelComponent } from '../containers/modal/edit-secrecy-form/edit-secrecy-form.components';
import { DelayRemindModalComponent } from '../containers/modal/delay-remind/delay-remind.component';
import { TableModalComponent } from '../containers/modal/table/table.component';
import { ThingLabelModalComponent } from '../containers/modal/thing-label/thing-label.component';
import { DemandDetailModalComponent } from '../containers/modal/demand-detail/demand-detail.component';

// 公用页面组件
import { SupplierInfoComponent } from '../components/supplier-info/supplier-info.component';

import { NewCreateOrderModalComponent } from '../containers/modal/new-create-order/new-create-order.component';

import { UserInfoComponent } from '../components/user/user-info.component';

import zh from '@angular/common/locales/zh';

registerLocaleData(zh);

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    NzDropDownModule,
    DragDropModule,
    LazyLoadImageModule,
    FormlyComponentModule,
    
  ],
  declarations: [
    CrumbComponent,
    TableContainer,
    SearchFormContainer,
    TableGroupContainer,
    TableGroupNewContainer,
    BudgetThingListComponent,
    NewThingDetailModalComponent,
    NewOrderDetailModalComponent,
    CreateSupplierModalComponent,
    CreateContractModalComponent,
    ContractPriceInfoModalComponent,
    ContractPriceApplyInfoModalComponent,
    SupplierInfoModalComponent,
    PriceDetailModalComponent,
    CreateOrderModalComponent,
    ApplyBudgeModalComponent,
    TableModalComponent,
    AdjustBudgeModalComponent,
    DownloadModalComponent,
    SaveModalComponent,
    ShowImgModalComponent,
    UploadPlanModalComponent,
    UploadsPlanModalComponent,
    ThingLabelModalComponent,
    NumberPipe,
    SecurityHtmlPipe,
    SecurityUrlPipe,
    OrderByPipe,
    SearchPipe,
    SomePipe,
    PreviewPipe,
    FileextsPipe,
    UserPipe,
    LinkPipe,
    FormatPipe,
    OperatorPipe,
    DateFormatPipe,
    LimitToPipe,
    OrderDetailIsRedPipe,
    AutoDecodePipe,
    DelHtmlTagPipe,
    LabelPipe,
    InfiniteScrollerDirective,
    AcceptanceRateComponent,
    ProductBudgetModalComponent,
    ProductBudgetAdjustModalComponent,
    OrderExportComponent,
    ExportComponent,
    EditSecrecyFormModelComponent,
    FormComponent,
    SupplierInfoComponent,
    NewCreateOrderModalComponent,
    DelayRemindModalComponent,
    UserInfoComponent,
    DemandDetailModalComponent,
    MathPipe
  ],
  exports: [
    LazyLoadImageModule,
    CrumbComponent,
    TableContainer,
    SearchFormContainer,
    TableGroupContainer,
    TableGroupNewContainer,
    BudgetThingListComponent,
    NewThingDetailModalComponent,
    NewOrderDetailModalComponent,
    CreateSupplierModalComponent,
    CreateContractModalComponent,
    ContractPriceInfoModalComponent,
    ContractPriceApplyInfoModalComponent,
    SupplierInfoModalComponent,
    PriceDetailModalComponent,
    CreateOrderModalComponent,
    ApplyBudgeModalComponent,
    AdjustBudgeModalComponent,
    ThingLabelModalComponent,
    SaveModalComponent,
    ShowImgModalComponent,
    UploadPlanModalComponent,
    UploadsPlanModalComponent,
    TableModalComponent,
    AcceptanceRateComponent,
    ProductBudgetModalComponent,
    ProductBudgetAdjustModalComponent,
    OrderExportComponent,
    DownloadModalComponent,
    SupplierInfoComponent,
    FormlyComponentModule,
    SomePipe,
    MathPipe,
    PreviewPipe,
    FileextsPipe,
    UserPipe,
    LinkPipe,
    LabelPipe,
    FormatPipe,
    OperatorPipe,
    DateFormatPipe,
    SecurityHtmlPipe,
    SecurityUrlPipe,
    // MycurrencyPipe,
    InfiniteScrollerDirective,
    NewCreateOrderModalComponent,
    DelayRemindModalComponent,
    ExportComponent,
    EditSecrecyFormModelComponent,
    FormComponent,
    UserInfoComponent,
    DemandDetailModalComponent
  ],
})
export class Common2Module {
}
