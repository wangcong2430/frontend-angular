/*
 * @Author: v_hhlihuang 1724690469@qq.com
 * @Date: 2022-06-14 10:46:14
 * @LastEditors: v_hhlihuang 1724690469@qq.com
 * @LastEditTime: 2022-06-14 10:46:14
 * @FilePath: /csp/cpm/frontend/src/app/views/index/system/supplier/ability/ability.component.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  templateUrl: './ability.component.html',
  styleUrls  : ['./ability.component.css']
})

export class SupplierAbilityComponent implements OnInit, OnDestroy {
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
