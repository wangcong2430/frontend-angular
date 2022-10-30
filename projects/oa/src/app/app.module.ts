import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpModule  } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';

import { LocalStorage } from '@ngx-pwa/local-storage';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS } from 'ng-zorro-antd';
import { IconDefinition } from '@ant-design/icons-angular';
import { AccountBookFill, AlertFill, AlertOutline } from '@ant-design/icons-angular/icons';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing';
import { httpInterceptorProviders } from './http-interceptors/index';
import { FormlyComponentModule } from './modules/formlyComponentModule';
import { ApiModule, BASE_PATH } from '../api-client';
import { CacheService } from './services/cache.service';
import { CosService } from './services/cos.service';

import { PiwikService } from './services/piwik.service';
import { FormService } from './services/form.service';
import { MessageService } from './services/message.service';
import { RestLinkService } from './services/rest-link.service';
import { MenuService } from './services/menu.service';
import { ScriptService } from './services/script.service';
import { UserInfoService } from './services/user-info.service';
import { UploadService } from './services/upload.service';
import { UploadsService } from './services/uploads.service';
import { DownloadService } from './services/download.service';
import { ListService } from './services/list.service';
import { Common2Module } from './modules/common2.module';

// we use the webpack raw-loader to return the content as a string

const icons: IconDefinition[] = [ AccountBookFill, AlertOutline, AlertFill ];
// import { NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS } from 'ng-zorro-antd';
// import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
// const icons: IconDefinition[] = [ AccountBookFill, AlertOutline, AlertFill ];

const locale = zh;
const zorro_locale = zh_CN;

registerLocaleData(locale);

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        AppRoutingModule,
        FormlyComponentModule,
        Common2Module,
        NgZorroAntdModule,
        BrowserAnimationsModule,
        ApiModule,
        BrowserModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        HttpModule,
        HttpClientModule
    ],
    providers: [
        httpInterceptorProviders,
        Common2Module,
        LocalStorage,
        PiwikService,
        CacheService,
        CosService,
        UserInfoService,
        RestLinkService,
        MessageService,
        UploadService,
        UploadsService,
        ScriptService,
        FormService,
        MenuService,
        ListService,
        DownloadService,
        { provide: BASE_PATH, useValue: '.'},
        { provide: NZ_I18N, useValue: zorro_locale },
        { provide: NZ_ICONS, useValue: icons },
        { provide: NZ_ICON_DEFAULT_TWOTONE_COLOR, useValue: '#00ff00' } // 不提供的话，即为 Ant Design 的主题蓝色
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
