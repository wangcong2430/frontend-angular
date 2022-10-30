import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestLinkService } from '../../services/rest-link.service';

@Component({
  templateUrl: './statement.component.html',
})
export class StatementComponent implements OnInit {
  user;
  query;
  title;
  link_name_map;

  constructor(
    private route: ActivatedRoute,
    private restLinkService: RestLinkService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (!this.link_name_map) {
        this.restLinkService.link_name_map.subscribe(link_name_map => {
          this.link_name_map = link_name_map;
          this.title = link_name_map[params['modelClass']];
        });
      } else {
        this.title = this.link_name_map[params['modelClass']];
      }
    });
    this.user = JSON.stringify(this.route.snapshot.data['user'], null, 4);
  }

  getTitle(title) {
    this.title = title;
  }
}
