import { Component } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { UserInfoService } from '../../services/user-info.service';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent {
  constructor(
    public language: LanguageService,
    public userInfoService: UserInfoService,
    private modalService: ModalService
  ) {}

  feedback(): void {
    this.modalService.open('form', {
      url: 'web/helpcenter/feedback/add',
      type: '1000'
    })
  }
}
