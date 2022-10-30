import { Component, OnInit } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserInfoService } from '../../../services/user-info.service';
import { UserService } from '../../../../api-client';

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

  constructor(
    private userService: UserService,
    public userInfoService: UserInfoService,
  ) {}


  ngOnInit() {
    this.userService.webUserInfoGet().subscribe(result => {
      if (result['code'] === 0) {
        if (result['data']['is_roles']) {
          location.href = '/';
          return;
        }
      }
    });
  }
}
