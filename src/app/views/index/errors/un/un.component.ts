import { Component, OnInit } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import {UserService} from '../../../../../api-client';
import {UserInfoService} from '../../../../services/user-info.service';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-index-register-base-info',
  templateUrl: './un.component.html',
  styleUrls: ['./un.component.css'],
})
export class UnComponent implements OnInit {

  type;
  tab_active_index;
  company_form = new FormGroup({});
  person_form = new FormGroup({});
  company_form_data = {};
  person_form_data = {};
  company_form_fields: FormlyFieldConfig[];
  person_form_fields: FormlyFieldConfig[];
  open_id = '';
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private userInfoService: UserInfoService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.open_id = params['open_id'];
    });
    // this.userService.webUserInfoGet().subscribe(result => {
    //   if (result['code'] === 0) {
    //     this.userInfoService.user = result['data'];
    //     if (result['data']['is_roles']) {
    //       //location.href = '/';
    //       return;
    //     }
    //   }
    // });
  }
}
