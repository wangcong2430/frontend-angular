import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from "@angular/platform-browser"
//import { LanguageService } from '../../../../../services/language.service';

@Component({
  templateUrl: './Contract.component.html',
  styleUrls  : ['./Contract.component.css']
})

export class ContractStampoaComponent implements OnInit {
  src
  constructor(
    //private language: LanguageService,
    private translate: TranslateService,
    private domSanitizer: DomSanitizer
  ) {
    //this.translate.use(this.language.language);
    document.querySelector("html").setAttribute('data-theme', 'Contract')
  }

  ngOnInit () {
    this.src = this.domSanitizer.bypassSecurityTrustResourceUrl(window.location.origin + '/stampoa/#/oa/contract')
    console.log(this.src)
  }
  
  ngOnDestroy () {
    document.querySelector("html").setAttribute('data-theme', '')
  }
}
 