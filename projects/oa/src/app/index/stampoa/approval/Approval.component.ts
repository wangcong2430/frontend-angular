import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from "@angular/platform-browser"
//import { LanguageService } from '../../../../../services/language.service';

@Component({
  templateUrl: './Approval.component.html',
  styleUrls  : ['./Approval.component.css']
})

export class ApprovalStampoaComponent implements OnInit {

  src
  constructor(
    //private language: LanguageService,
    private translate: TranslateService,
    private domSanitizer: DomSanitizer
  ) {
    //this.translate.use(this.language.language);
    document.querySelector("html").setAttribute('data-theme', 'Approval')
  }

  ngOnInit () {
    this.src = this.domSanitizer.bypassSecurityTrustResourceUrl(window.location.origin + '/stampoa/#/oa/power')
    console.log(this.src)
  }
  
  ngOnDestroy () {
    document.querySelector("html").setAttribute('data-theme', '')
  }
}
 