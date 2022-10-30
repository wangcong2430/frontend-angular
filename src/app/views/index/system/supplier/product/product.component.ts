import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { MessageService } from '../../../../../services/message.service';
import { LanguageService } from '../../../../../services/language.service';
import { MenuService } from '../../../../../services/menu.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  templateUrl: './product.component.html',
  styleUrls  : ['./product.component.css']
})

export class SupplierProductComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private message: MessageService,
    private language: LanguageService,
    private translate: TranslateService,
    private menuService: MenuService,
    private modal: ModalService,
    private modalService: NzModalService
  ) {
    this.translate.use(this.language.language);
    document.querySelector("html").setAttribute('data-theme', 'artcool')
  }


  ngOnInit () {
  }
  ngOnDestroy () {
    document.querySelector("html").setAttribute('data-theme', '')
  }
}
