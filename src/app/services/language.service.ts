import { Injectable } from "@angular/core";
import { LocalStorage } from '@ngx-pwa/local-storage'
import { TranslateService } from '@ngx-translate/core';


@Injectable({
    providedIn: 'root'
})
export class
LanguageService {

    public language = 'zh-Hans';

    public languages = [
        'en-Us',
        'zh-Hans'
    ];

    public language_text = {
        'en-Us': '中文',
        'zh-Hans': 'English',
    };

    public source_language = 'zh-Hans';

    constructor(
        private storage: LocalStorage,
        public translate: TranslateService
    ) {
        storage.getItem('_lang').subscribe((lang) => {
            if (this.languages.indexOf(lang) > -1) {
                this.language = lang;
                this.translate.use(lang);
            } else {
                this.language = this.source_language;
                this.translate.use(this.language);
            }
        });
    }

    change(item) {
      if (this.languages.indexOf(item) > -1) {
        this.language = item;
        this.storage.setItem('_lang', this.language).subscribe(() => {
          location.reload();
        });
      }
    }

    getTranslate (key) {
        return this.translate.get(key);
    }

    getLanguage () {
      return this.language;
    }
}
