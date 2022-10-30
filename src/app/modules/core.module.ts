import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../services/language.service';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forChild()
  ],
  exports: [ // components that we want to make available
  ],
  declarations: [ // components for use in THIS module
  ],
  providers: [ // singleton services
      LanguageService,
  ]
})
export class CoreModule { }
