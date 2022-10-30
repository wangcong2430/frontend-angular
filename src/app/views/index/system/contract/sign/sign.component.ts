import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../services/language.service';
import { DomSanitizer } from "@angular/platform-browser"

@Component({
  templateUrl: './sign.component.html',
  styleUrls  : ['./sign.component.css']
})

export class SignStampComponent implements OnInit {
  src
  constructor(
    private language: LanguageService,
    private translate: TranslateService,
    private domSanitizer: DomSanitizer
  ) {
    this.translate.use(this.language.language);
    document.querySelector("html").setAttribute('data-theme', 'stamp')
  }

  ngOnInit () {
    this.src = this.domSanitizer.bypassSecurityTrustResourceUrl(window.location.origin + '/stamp/#/qq/sign')
    console.log(this.src)
  }
  
  ngOnDestroy () {
    document.querySelector("html").setAttribute('data-theme', '')
  }
}
