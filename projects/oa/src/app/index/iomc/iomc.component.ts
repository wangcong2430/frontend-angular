import {Component, Input, Output} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestLinkService } from '../../services/rest-link.service';

@Component({
    templateUrl: './iomc.component.html',
    styleUrls: ['./iomc.component.less']
})
export class IomcComponent {
  constructor(
    private route: ActivatedRoute,
    private restLinkService: RestLinkService
  ) {
    document.querySelector("html").setAttribute('data-theme', 'iomc')
  }

  ngOnInit() {

  }
}
