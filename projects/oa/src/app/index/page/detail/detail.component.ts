import { Component, OnInit} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../services/message.service';

@Component({
  templateUrl: './detail.component.html',
  styles: [
    `
    :host {
      background-color: #f1f1f7;
    }
    `
  ]
})

export class DetailComponent  implements OnInit {
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private message: MessageService
  ) {}

  dataModal: Object = {};
  isVisible: Boolean = false;

  ngOnInit () {
    this.isVisible = false;
    this.route.queryParams.subscribe(item => {
      if (item.id) {
        this.http.get('web/supplier/info-new', { params: { id: '2', isContract: '1' }}).subscribe(result => {
          this.message.isAllLoading = false;
          if (result['code'] !== 0) {
            this.message.error(result['msg']);
            return false;
          } else {
            this.dataModal = result['data'];
            this.isVisible = true;
          }
        });
      }
    });
  }
}

