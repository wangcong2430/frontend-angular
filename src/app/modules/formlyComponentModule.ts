import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FileUploadModule } from 'ng2-file-upload';
import { ValidationService } from '../services/validation.service';

import { LabelWrapperComponent } from '../formly-fields/wrapper/wrapper-label'; // label重置
import { WrapperDescriptionComponent } from '../formly-fields/wrapper/wrapper-description'; // description重置
import { WrapperSingleComponent } from '../formly-fields/wrapper/wrapper-single';
import { FormlyFieldCheckList } from '../formly-fields/check-list/check-list';
import { FormlyFieldFile } from '../formly-fields/file/file';
import { FormlyFieldDate } from '../formly-fields/date/date';
import { FormlyFieldMultiSelect } from '../formly-fields/multi-select/multi-select';
import { FormlyFieldSearchSelect } from '../formly-fields/search-select/search-select.component';
import { FormlyFieldMonthSelect } from '../formly-fields/month-select/month-select.component';
import { FormlyFieldRadio } from '../formly-fields/radio/radio.component';
import { FormlyFieldsGroupInput } from "../formly-fields/group-input/group-input.component";
import { FormlyFieldSelect } from '../formly-fields/select/select.component';
import { FormlyFieldServiceType } from '../formly-fields/service-type/service-type.component';
import { FormlyFieldText } from '../formly-fields/text/text';
import { FormlyFieldCheckbox } from '../formly-fields/checkbox/checkbox';
import { FormlyFieldBtns } from '../formly-fields/btns/btns.component';
import { FormlyFieldTables } from '../formly-fields/tables/tables';
import { FormlyFieldMultiCheckListComponent } from '../formly-fields/multi-check-list/multi-check-list.component'
import { FormlyFieldLinkage } from '../formly-fields/linkage/linkage.component';
import { FormlyFieldTableData } from '../formly-fields/table-data/table-data';
import { FormlyFieldRepeatSection } from '../formly-fields/repeat-section/repeat-section.component';
import { FormlyHorizontalWrapper } from '../formly-fields/horizontal-wrapper/horizontal-wrapper';

import { LoadingComponent } from '../components/loading/loading.component';
import { SelectorComponent } from '../components/selector/selector.component';
import { SearchPipe } from '../pipes/search.pipe';
import { PreviewPipe } from '../pipes/preview.pipe';


import { FilterArrPipe } from '../pipes/filterArr.pipe';

import { PromptComponent } from "../components/prompt/prompt.component";
import { MonthRangeComponent } from "../components/month-range/month-range.component";
import { NgSelectModule } from '@ng-select/ng-select';
import { SvgComponent } from '../components/svg/svg.component';
import { NgZorroAntdModule } from "ng-zorro-antd";
import { FormlyFieldCascader } from "../formly-fields/nz-cascader/ng-cascader.component";
import { RepeatTypeComponent } from "../formly-fields/repeat/repeat";

import { FormlyNgxZorroModule } from '../../../projects/oa/src/app/modules/formly-ngx-zorro/formly-ngx-zorro.module'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FileUploadModule,
        NgSelectModule,
        FormlyNgxZorroModule,
        NgZorroAntdModule,
        FormlyModule.forRoot({
            types: [
                {name: 'check-list', component: FormlyFieldCheckList, extends: 'input'},
                {name: 'file', component: FormlyFieldFile},
                {name: 'nz-cascader', component: FormlyFieldCascader, extends: 'input'},
                {name: 'date', component: FormlyFieldDate, extends: 'input'},
                {name: 'multi-select', component: FormlyFieldMultiSelect, extends: 'input'},
                {name: 'search-select', component: FormlyFieldSearchSelect, extends: 'input'},
                {name: 'month-select', component: FormlyFieldMonthSelect, extends: 'input'},
                {name: 'radio', component: FormlyFieldRadio, extends: 'input'},
                {name: 'group-input', component: FormlyFieldsGroupInput, extends: 'input'},
                {name: 'select', component: FormlyFieldSelect, extends: 'input'},
                {name: 'service-type', component: FormlyFieldServiceType, extends: 'input'},
                {name: 'text', component: FormlyFieldText, extends: 'input'},
                {name: 'checkbox-default', component: FormlyFieldCheckbox, extends: 'input'},
                {name: 'btns', component: FormlyFieldBtns, extends: 'input'},
                {name: 'tables', component: FormlyFieldTables, extends: 'input'},
                {name: 'multi-check-list', component: FormlyFieldMultiCheckListComponent, extends: 'input'},
                {name: 'linkage', component: FormlyFieldLinkage, extends: 'input'},
                {name: 'table-data', component: FormlyFieldTableData, extends: 'input'},
                {name: 'repeat-section', component: FormlyFieldRepeatSection},
                {name: 'repeat', component: RepeatTypeComponent},
            ],
            validators: [
                {name: 'complete', validation: ValidationService.completeValidation},
                {name: 'input-number', validation: ValidationService.numberValidation},
            ],
            validationMessages: [
                {
                    name: 'required',
                    message: '必填'
                },
                {
                    name: 'complete',
                    message: '信息填写不完整'
                },
                {
                    name: 'input-number',
                    message: '请输入合法整数'
                }
            ],
            wrappers: [
                { name: 'label', component: LabelWrapperComponent },
                { name: 'description', component: WrapperDescriptionComponent },
                { name: 'single', component: WrapperSingleComponent },
                { name: 'form-field-horizontal', component: FormlyHorizontalWrapper }
            ]
        }),
    ],
    declarations: [
        LabelWrapperComponent,
        WrapperDescriptionComponent,
        WrapperSingleComponent,
        FormlyFieldCheckList,
        FormlyFieldFile,
        FormlyFieldCascader,
        FormlyFieldDate,
        FormlyFieldMultiSelect,
        FormlyFieldSearchSelect,
        FormlyFieldMonthSelect,
        FormlyFieldRadio,
        FormlyFieldsGroupInput,
        FormlyFieldSelect,
        FormlyFieldServiceType,
        FormlyFieldText,
        FormlyFieldCheckbox,
        FormlyFieldBtns,
        FormlyFieldTables,
        FormlyFieldMultiCheckListComponent,
        FormlyFieldLinkage,
        FormlyFieldTableData,
        FormlyFieldRepeatSection,
        RepeatTypeComponent,
        FormlyHorizontalWrapper,

        LoadingComponent,
        SelectorComponent,
        SearchPipe,
        PreviewPipe,
        FilterArrPipe,
        PromptComponent,
        MonthRangeComponent,
        SvgComponent,

    ],
    exports: [
        LoadingComponent,
        SelectorComponent,
        SearchPipe,
        PreviewPipe,
        FilterArrPipe,
        PromptComponent,
        MonthRangeComponent,
        NgSelectModule,
        SvgComponent,
        LabelWrapperComponent,
        WrapperDescriptionComponent,
        WrapperSingleComponent,
        FormlyFieldCheckList,
        FormlyFieldFile,
        FormlyFieldCascader,
        FormlyFieldDate,
        FormlyFieldMultiSelect,
        FormlyFieldSearchSelect,
        FormlyFieldMonthSelect,
        FormlyFieldRadio,
        FormlyFieldsGroupInput,
        FormlyFieldSelect,
        FormlyFieldServiceType,
        FormlyFieldText,
        FormlyFieldCheckbox,
        FormlyFieldBtns,
        FormlyFieldTables,
        FormlyFieldMultiCheckListComponent,
        FormlyFieldLinkage,
        FormlyFieldTableData,
        FormlyFieldRepeatSection,
        RepeatTypeComponent,
        FormlyNgxZorroModule
    ]
})
export class FormlyComponentModule {
}

