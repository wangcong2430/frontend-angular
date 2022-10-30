import { Injectable } from "@angular/core";
import { LocalStorage } from '@ngx-pwa/local-storage' 
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class LanguageService {

    private list = [];

    constructor(
        private storage: LocalStorage,
        private http: HttpClient,
    ) {
        // console.log('language: constructor', this.language)
    }


    getList(url, params) {
      return this.http.get(url, params).subscribe(result => {

      });
    }
    
}
