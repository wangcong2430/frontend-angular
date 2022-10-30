import {Component, Input, OnInit, Output} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestLinkService } from '../../services/rest-link.service';

@Component({
  templateUrl: './library.component.html',
})
export class LibraryComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private restLinkService: RestLinkService
  ) {}

  ngOnInit() {}
}
