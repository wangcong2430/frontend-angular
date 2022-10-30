import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { routing } from './app.routing';
import { AppComponent } from './app.component';
import { UtilsService } from './services/utils.service';

import { CacheService } from './services/cache.service';
import { CosService } from './services/cos.service';
import { MessageService } from './services/message.service';
import { MenuService } from './services/menu.service';
import { UploadService } from './services/upload.service';
import { UploadsService } from './services/uploads.service';
import { ResponseInterceptorService } from './services/response-interceptor.service';
import zh from '@angular/common/locales/zh';
import { Common2Module } from './modules/common2.module';
import { CoreModule } from './modules/core.module';

registerLocaleData(zh);

// AoT requires an exported function for factories
// export function HttpLoaderFactory(http: HttpClient) {
//     return new TranslateHttpLoader(http);
// }

@NgModule({
    declarations: [
      AppComponent,
    ],
    imports: [
      BrowserModule,
      HttpClientModule,
      BrowserAnimationsModule,
      routing,
      FormsModule,
      NgZorroAntdModule,
      Common2Module,
      CoreModule,

      TranslateModule.forRoot(),
    ],
    providers: [
      CacheService,
      CosService,
      LocalStorage,
      UtilsService,
      MessageService,
      UploadService,
      UploadsService,
      MenuService,
      { provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptorService, multi: true },
      { provide: NZ_I18N, useValue: zh_CN },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
