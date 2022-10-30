import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { ModalService } from '../../../services/modal.service';

const fakeDataUrl = '/web/thing/resources-browse';

@Component({
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrowseComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    private modal: ModalService,
  ) {}

  column;
  initLoading = true; // bug
  loadingMore = false;
  data: any[] = [];
  list: any[] = [];

  loading = true;
  queryFields = [];

  params;

  pageSize = 20;
  pageIndex = 1;

  subscribeScoll;

  flag;

  currentPage = 1;
  news: Array<any> = [];

  loaded = false;

  ngOnInit ()  {
    this.initLoading = true;
    this.loaded = false;
    this.http.get('web/thing/resources-browse-config').subscribe(result => {
      this.initLoading          = false;
      this.queryFields      = result['search_form'];
      this.cd.markForCheck();
    });
  }

  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.pageIndex = 1;
      this.params = Object.assign({}, value['value'], {
        page_index: this.pageIndex,
        page_size: this.pageSize
      });
      this.loading = true;
      this.loaded = false;
      this.getResourcesBrowse();
    }
  }

  getResourcesBrowse () {
    this.data = [];
    this.list = [];
    this.scrollCallback().subscribe(res => {
      console.log(res);
    });
  }


  scrollCallback = () => {
    this.params = Object.assign({}, this.params, {
      page_index: this.pageIndex,
      page_size: this.pageSize
    });

    return this.http.get(fakeDataUrl, {params: this.params}).pipe(tap(res => {
      this.loading = false;
      if (res['data'] && res['data'].length > 0) {
        this.pageIndex++;
        this.data = this.data.concat(res['data'].map(item => {
          return {
            ...item,
            loading: true
          };
        }));
        this.list = [...this.data];
        this.list.forEach(item => {
          const newImg = new Image();
          newImg.src = location.origin + item.thumb;
          newImg.onload = (r) => {
            item.loading = false;
            item.imgInfo = r['path'][0];
            this.cd.markForCheck();
          };
        });
        this.cd.markForCheck();
      } else {
        this.loaded = true;
        this.cd.markForCheck();
      }
    }));
  }

  seachThing($event) {
    this.modal.open('thing', $event);
  }

  preview (item) {
    this.modal.open('photo', {
      url: item.img,
      thing_name: item.thing_name
    });
  }
}
