import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import { HttpClientJsonpModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import zh from '@angular/common/locales/zh';

import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormlyModule } from '@ngx-formly/core';
import { FileUploadModule } from 'ng2-file-upload';

// 引入bootstrap formly模块
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

// 引入ant-design formly模块
import { FormlyNgxZorroModule } from './formly-ngx-zorro/formly-ngx-zorro.module';

// 引入自定义的formly模块
import { FormlyFieldNzSelect } from '../fields/nz-select/nz-select';
import { FormlyFieldRadio } from '../fields/radio/radio';
import { FormlyFieldDate } from '../fields/date/date';
import { FormlyFieldDateRange } from '../fields/date-range/date-range';
import { FormlyFieldCaptcha } from '../fields/captcha';
import { CaptchaService } from '../events/captcha.service';
import { FormlyFieldText } from '../fields/text';
import { FormlyFieldPre } from '../fields/pre';
import { FormlyHorizontalWrapper } from '../fields/horizontal-wrapper/horizontal-wrapper';
import { RepeatTypeComponent } from '../fields/repeat/repeat';
import { RepeatSectionComponent } from '../fields/repeat-section/repeat-section';
import { RepeatTabsTypeComponent } from '../fields/repeat-tabs/repeat-tabs';
import { SingleUploadComponent } from '../fields/single-upload/single-upload';
import { FormlyFieldNzInputNumber } from '../fields/nz-input-number/nz-input-number';
import { FormlyFieldNzSearchSelect } from '../fields/nz-search-select/nz-search-select';
import { FormlyFieldNzSearchOauser } from '../fields/nz-search-oauser/nz-search-oauser';
import { FormlyFieldNzSearchCpuser } from '../fields/nz-search-cpuser/nz-search-cpuser';
import { FormlyFieldSelectOaUserNew } from '../fields/select-oa-user-new/select-oa-user-new';

// 非公用的第三方模块
import { DynamicInputComponent } from '../components/fields/dynamic-input-section/dynamic-input-section';
import { FormlyFieldNzGroupSelectNumber } from '../fields/nz-group-select-number/nz-group-select-number';
import { RadioConfigComponent } from '../components/fields/radio-config-section/radio-config-section';
import { ProjectContentTabComponent } from '../components/fields/project-content-tab-section/project-content-tab-section';
import { CreateDemandUploadComponent } from '../components/fields/create-demand-upload-section/create-demand-upload-section';
import { CreateDemandBreakdownsComponent } from '../components/fields/create-demand-breakdowns/create-demand-breakdowns.component';
import { SelectTemplateComponent } from '../components/fields/select-template/select-template.component';
import { CreateDemandTabsComponent } from '../components/fields/create-demand-tab/create-demand-tab';
import { DescriptionRepeatComponent } from '../components/fields/description-repeat/description-repeat';
import { InquiryQuoteFormlyComponent } from '../components/fields/inquiry-quote/inquiry-quote';
import { FormlyFieldCollapseComponent } from '../components/fields/is-collapse/is-collapse';
import { SelectSupplierComponent } from '../components/fields/select-supplier/select-supplier.component';
import { TableListComponent } from '../components/fields/table-list/table-list.component';
import { FieldNameCheckboxComponent } from '../components/fields/field-name-checkbox/field-name-checkbox';
import { AttributeEditComponent } from '../components/fields/attribute-edit/attribute-edit.component';
import { NzSelectUserComponent } from '../fields/nz-select-user/nz-select-user-component';
import { AttributeInputComponent } from '../components/fields/attribute-input/attribute-input.component';

import { InquiryExchangeRateComponent } from '../components/fields/inquiry-exchange-rate/inquiry-exchange-rate';
import { InquiryTaxRateComponent } from '../components/fields/inquiry-tax-rate/inquiry-tax-rate';
import { DemandPresupplierSelectComponent } from '../components/fields/demand-presupplier-select/demand-presupplier-select';
import { InquiryBreakdownLabelComponent } from '../components/fields/inquiry-breakdown-label/inquiry-breakdown-label';
import { InquiryPushEpoComponent } from '../components/fields/inquiry-push-epo/inquiry-push-epo.component';

import { UploadService } from '../services/upload.service';
import { SelectOaUserComponent } from '../components/select-user/select-user.component';
import { ThingPriceEditComponent } from '../components/thing-price-edit/thing-price-edit.component';

import { LabelAditComponent } from '../components/label-edit/label-edit.component';
import { MycurrencyPipe } from '../pipes/mycurrency.pipe';
import { CurrencyPipe } from '@angular/common';
import { MultipleSelectComponent } from '../components/fields/multiple-select/multiple-select.component';

registerLocaleData(zh);

@NgModule({
  imports: [
    HttpModule,
    HttpClientJsonpModule,
    CommonModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    FormlyBootstrapModule,
    FormlyNgxZorroModule,
    FormlyModule.forRoot({
      types: [
        {name: 'captcha', component: FormlyFieldCaptcha},
        {name: 'date', component: FormlyFieldDate, extends: 'input' },
        {name: 'date-range', component: FormlyFieldDateRange, extends: 'input'},
        {name: 'radio', component: FormlyFieldRadio},
        {name: 'text', component: FormlyFieldText, extends: 'input'},
        {name: 'pre', component: FormlyFieldPre, extends: 'input'},
        {name: 'nz-input-number', component: FormlyFieldNzInputNumber, extends: 'input'},
        {name: 'nz-search-select', wrappers: ['field-wrapper'], component: FormlyFieldNzSearchSelect, extends: 'input'},
        {name: 'nz-search-oauser', wrappers: ['field-wrapper'], component: FormlyFieldNzSearchOauser, extends: 'input'},
        {name: 'nz-search-cpuser', wrappers: ['field-wrapper'], component: FormlyFieldNzSearchCpuser, extends: 'input'},
        {name: 'select-oa-user-new', wrappers: ['field-wrapper'], component: FormlyFieldSelectOaUserNew, extends: 'input'},
        {name: 'nz-group-select-number', component: FormlyFieldNzGroupSelectNumber, extends: 'input'},
        {name: 'repeat', component: RepeatTypeComponent},
        {name: 'repeat-section', component: RepeatSectionComponent},
        {name: 'repeat-tabs', component: RepeatTabsTypeComponent},
        {name: 'single-upload', component: SingleUploadComponent},
        {name: 'dynamic-input-section', component: DynamicInputComponent},
        {name: 'radio-config-section', component: RadioConfigComponent, wrappers: ['field-wrapper']},
        {name: 'project-content-tab-section', component: ProjectContentTabComponent},
        {name: 'create-demand-upload-component', component: CreateDemandUploadComponent, wrappers: ['field-wrapper']},
        {name: 'create-demand-breakdowns', component: CreateDemandBreakdownsComponent},
        {name: 'select-template-component', component: SelectTemplateComponent},
        {name: 'create-demand-tabs', component: CreateDemandTabsComponent},
        {name: 'description-repeat', component: DescriptionRepeatComponent},
        {name: 'inquiry-quote', component: InquiryQuoteFormlyComponent},
        {name: 'is-collapse', component: FormlyFieldCollapseComponent},
        {name: 'select-supplier', wrappers: ['field-wrapper'],  component: SelectSupplierComponent},
        {name: 'nz-table-list', component:  TableListComponent},
        {name: 'field-name-checkbox', component: FieldNameCheckboxComponent},
        {name: 'nz-select-user', component: NzSelectUserComponent},
        {name: 'create-demand-attribute-edit', component: AttributeEditComponent},
        {name: 'attribute-input', component: AttributeInputComponent },
        {name: 'inquiry-exchange-rate', component: InquiryExchangeRateComponent },
        {name: 'inquiry-tax-rate', component: InquiryTaxRateComponent },
        {name: 'demand-presupplier-select', component: DemandPresupplierSelectComponent },
        {name: 'inquiry-breakdown-label', component: InquiryBreakdownLabelComponent },
        {name: 'inquiry-push-epo', component: InquiryPushEpoComponent},
        {name: 'multiple-select', component: MultipleSelectComponent}
      ]
    }),

  ],
  providers: [
    CaptchaService,
    UploadService,
    {provide: NZ_I18N, useValue: zh_CN},
    CurrencyPipe
  ],
  declarations: [
    LabelAditComponent,
    ThingPriceEditComponent,
    FormlyFieldDate,
    FormlyFieldDateRange,
    FormlyFieldRadio,
    FormlyFieldText,
    FormlyFieldPre,
    FormlyFieldNzInputNumber,
    FormlyFieldNzSelect,
    FormlyFieldNzSearchSelect,
    FormlyFieldNzSearchOauser,
    FormlyFieldNzSearchCpuser,
    FormlyFieldSelectOaUserNew,
    FormlyFieldNzGroupSelectNumber,
    FormlyFieldCaptcha,
    FormlyHorizontalWrapper,
    RepeatTypeComponent,
    RepeatSectionComponent,
    RepeatTabsTypeComponent,
    SingleUploadComponent,
    DynamicInputComponent,
    RadioConfigComponent,
    ProjectContentTabComponent,
    CreateDemandUploadComponent,
    CreateDemandBreakdownsComponent,
    SelectTemplateComponent,
    DescriptionRepeatComponent,
    CreateDemandTabsComponent,
    InquiryQuoteFormlyComponent,
    FormlyFieldCollapseComponent,
    SelectSupplierComponent,
    TableListComponent,
    FieldNameCheckboxComponent,
    NzSelectUserComponent,
    SelectOaUserComponent,
    AttributeEditComponent,
    AttributeInputComponent,
    InquiryExchangeRateComponent,
    InquiryTaxRateComponent,
    DemandPresupplierSelectComponent,
    InquiryBreakdownLabelComponent,
    InquiryPushEpoComponent,
    MycurrencyPipe,
    MultipleSelectComponent
  ],
  exports: [
    LabelAditComponent,
    FormlyNgxZorroModule,
    ThingPriceEditComponent,
    FormlyFieldDate,
    FormlyFieldDateRange,
    FormlyFieldRadio,
    FormlyFieldText,
    FormlyFieldPre,
    FormlyFieldNzInputNumber,
    FormlyFieldNzSelect,
    FormlyFieldNzSearchSelect,
    FormlyFieldNzSearchCpuser,
    FormlyFieldSelectOaUserNew,
    FormlyFieldNzGroupSelectNumber,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    DynamicInputComponent,
    FormlyFieldCaptcha,
    RepeatTypeComponent,
    RepeatSectionComponent,
    RepeatTabsTypeComponent,
    SingleUploadComponent,
    RadioConfigComponent,
    ProjectContentTabComponent,
    CreateDemandUploadComponent,
    CreateDemandBreakdownsComponent,
    SelectTemplateComponent,
    CreateDemandTabsComponent,
    DescriptionRepeatComponent,
    InquiryQuoteFormlyComponent,
    FormlyFieldCollapseComponent,
    SelectSupplierComponent,
    TableListComponent,
    NzSelectUserComponent,
    AttributeEditComponent,
    AttributeInputComponent,
    InquiryExchangeRateComponent,
    InquiryTaxRateComponent,
    DemandPresupplierSelectComponent,
    InquiryBreakdownLabelComponent,
    SelectOaUserComponent,
    InquiryPushEpoComponent,
    MycurrencyPipe
  ],
})
export class FormlyComponentModule {
}

