import { Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ApplyBudgeModalComponent } from '../../../containers/modal/apply-budge/apply-budge.component';
import { AdjustBudgeModalComponent } from '../../../containers/modal/adjust-budge/adjust-budge.component';

@Component({
  templateUrl: './apply.component.html'
})

export class ApplyComponent implements OnInit {
  @ViewChild(ApplyBudgeModalComponent)
  private budgeModal: ApplyBudgeModalComponent;
  @ViewChild(AdjustBudgeModalComponent)
  private adjustModal: AdjustBudgeModalComponent;
  loading;
  columns;
  data;
  isConfirmLoading = false;
  pagination = {
    previous_text: 'previous',
    next_text: 'next',
    total_count: null,
    page_size: null,
  };
  query = {
    page: 1,
    'per-page': null
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    forkJoin([
      this.translate.get('previous'),
      this.translate.get('next'),
      this.http.get('web/project/config')
    ]).subscribe(results => {
      const [previous_text, next_text, config] = results;
      this.pagination.previous_text = previous_text;
      this.pagination.next_text = next_text;
      this.columns = config['columns'];
    });
    this.getList();
  }

  getList() {
    this.loading = true;
    this.route.queryParams.subscribe(params => {
      this.query = JSON.parse(JSON.stringify(params));
      if (this.query.page) {
        this.query.page = +this.query.page;
      }
      this.http.post('web/project/list', this.query, {
        observe: 'response',
      }).subscribe(response => {
        this.loading = false;
        this.data = response.body;
        this.pagination.total_count = response.headers.get('x-pagination-total-count');
        this.query['per-page'] = response.headers.get('x-pagination-per-page');
      });
    });
  }

  openApplyBudgeModal(item) {
    this.budgeModal.openModal(item);
  }

  openAdjustBudgeModal(item) {
    this.adjustModal.openModal(item);
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
