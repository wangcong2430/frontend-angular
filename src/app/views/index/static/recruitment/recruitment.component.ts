import { Component, OnInit } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import {UserService} from '../../../../../api-client';
import {UserInfoService} from '../../../../services/user-info.service';

@Component({
  selector: 'app-index-recruitment',
  templateUrl: './recruitment.component.html',
  styleUrls: ['./recruitment.component.less'],
})
export class RecruitmentComponent implements OnInit {

  constructor(
    private userService: UserService,
    private userInfoService: UserInfoService,
  ) {}

  ngOnInit() {
    document.title = 'Tencent IEG Service Procurement';
  }
}
