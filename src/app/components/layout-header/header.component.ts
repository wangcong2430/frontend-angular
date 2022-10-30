import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { en_US, zh_CN, NzI18nService } from 'ng-zorro-antd';
import { delay } from 'rxjs/operators';
import { LanguageService } from '../../services/language.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class LayoutHeaderComponent implements OnInit {
  @Input() user;

  constructor(
    public language: LanguageService,
    private http: HttpClient,
    public translate: TranslateService,
    private i18n: NzI18nService,
    private modalService: ModalService
  ) {}

  count: Number = 0;
  lang: String = this.language.language_text[this.language.language] || '中文';

  async ngOnInit() {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    const timer = setTimeout(() => {
      clearTimeout(timer);
      this.http.get('/web/user/cpm-backlog').pipe(delay(5000)).subscribe(res => {
        if (res && res['total']) {
          this.count = res['total'];
        }
      });
    }, 5000);

    const currentLanguage = await localStorage.getItem('currentLanguage') || this.translate.getBrowserCultureLang();
    if (currentLanguage === 'zh-Hans' || currentLanguage === 'zh-CN') {
      this.i18n.setLocale(zh_CN);
      this.translate.use('zh-Hans');
    } else {
      this.i18n.setLocale(en_US);
      this.translate.use('en-Us');
    }
    this.translate.use(currentLanguage);

  }

  languageChange (lang) {
    if (lang === 'zh-Hans' || lang === 'zh-CN') {
      lang = 'en-Us';
    } else {
      lang = 'zh-Hans';
    }
    this.translate.use(lang);
    // 更新当前记录的语言
    localStorage.setItem('currentLanguage', lang);
    this.language.change(lang);
  }

  feedback(): void {
    this.modalService.open('form', {
      url: 'web/helpcenter/feedback/add',
      type: '1000'
    })
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
  logout(){
    localStorage.removeItem('user')
  }
}
