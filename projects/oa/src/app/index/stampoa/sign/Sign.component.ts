import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from "@angular/platform-browser"
//import { LanguageService } from '../../../../../services/language.service';

@Component({
  templateUrl: './Sign.component.html',
  styleUrls  : ['./Sign.component.css']
})

export class SignStampoaComponent implements OnInit {
  src
  constructor(
    //private language: LanguageService,
    private translate: TranslateService,
    private domSanitizer: DomSanitizer
  ) {
    //this.translate.use(this.language.language);
    document.querySelector("html").setAttribute('data-theme', 'Sign')
  }

  ngOnInit () {
    this.src = this.domSanitizer.bypassSecurityTrustResourceUrl(window.location.origin + '/stampoa/#/oa/sign')
    console.log(this.src)
  }
  
  ngOnDestroy () {
    document.querySelector("html").setAttribute('data-theme', '')
  }
}
 