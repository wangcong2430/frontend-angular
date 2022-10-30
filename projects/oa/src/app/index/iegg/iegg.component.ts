import {Component, Input, Output} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestLinkService } from '../../services/rest-link.service';

@Component({
    templateUrl: './iegg.component.html',
    styleUrls: ['./iegg.component.less']
})
export class IeggComponent {
  constructor(
    private route: ActivatedRoute,
    private restLinkService: RestLinkService
  ) {
    document.querySelector("html").setAttribute('data-theme', 'iegg')
  }
}
