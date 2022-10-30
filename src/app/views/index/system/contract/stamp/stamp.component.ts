import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../../services/language.service';
import { DomSanitizer } from "@angular/platform-browser"

@Component({
  templateUrl: './stamp.component.html',
  styleUrls  : ['./stamp.component.css']
})

export class ContractStampComponent implements OnInit {
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
    this.src = this.domSanitizer.bypassSecurityTrustResourceUrl(window.location.origin + '/stamp/#/qq/contract')
    console.log(this.src)
  }
  
  ngOnDestroy () {
    document.querySelector("html").setAttribute('data-theme', '')
  }
}
