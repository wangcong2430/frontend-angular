import { Component, OnInit } from '@angular/core';
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

    ::ng-deep .ant-card-body {
      padding: 0
    }


    :host ::ng-deep .ant-table-tbody > tr > td {
      padding: 16px 8px;
    }

    :host ::ng-deep tr.ant-table-expanded-row td > .ant-table-wrapper {
      margin: -1px -48px -2px -9px;
      z-index: 1;
    }

    :host ::ng-deep .ant-table-thead > tr.ant-table-row-hover:not(.ant-table-expanded-row) > td,
    :host ::ng-deep .ant-table-tbody > tr.ant-table-row-hover:not(.ant-table-expanded-row) > td,
    :host ::ng-deep .ant-table-thead > tr:hover:not(.ant-table-expanded-row) > td,
    :host ::ng-deep .ant-table-tbody > tr:hover:not(.ant-table-expanded-row) > td {
        background: unset;
    }
      :host ::ng-deep .ant-col-6 {
        min-height: 28px;
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
  loading: Boolean = true;
  query = {
    id: null
  };

  ngOnInit () {
    this.isVisible = false;
    this.route.queryParams.subscribe(item => {
      if (item.id) {
        this.query.id = item.id;
        this.http.get('web/supplier/info-new', {
          params: {
            id: item.id, isContract: '1'
          }
        }).subscribe(result => {
          this.message.isAllLoading = false;
          this.loading = false;
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

  getList () {
    this.http.get('web/supplier/info-new', {
      params: {
        id: this.query.id,
        isContract: '1'
      }
    }).subscribe(result => {
      this.message.isAllLoading = false;
      this.loading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      } else {
        this.dataModal = result['data'];
        this.isVisible = true;
      }
    });
  }
}

