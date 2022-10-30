import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { en_US, NzI18nService } from 'ng-zorro-antd';


@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
})
export class IndexComponent implements OnInit {
  user;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private i18n: NzI18nService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data['user'];
    if (this.user.supplier.status === 'applying') {
      this.router.navigate(['register/base-info']);
    }
  }
}
