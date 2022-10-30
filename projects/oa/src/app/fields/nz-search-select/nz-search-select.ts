import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'formly-field-nz-search-select',
  templateUrl: './nz-search-select.html'
})
export class FormlyFieldNzSearchSelect extends FieldType implements OnInit {
  searchChange$ = new BehaviorSubject('');
  isSearchSelect = false;
  optionSearchs = [];
  optionCache = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    super();
  }

  get labelProp(): string {
    return this.to['labelProp'] || 'label';
  }

  get valueProp(): string {
    return this.to['valueProp'] || 'value';
  }

  get mode(): string {
    return this.to['mode'] || 'default';
  }

  ngOnInit() {
    // 监听输入框输入的最后的值，500ms监听一次
    this.searchChange$.asObservable().pipe(debounceTime(500)).subscribe(name => {
      if (this.to['searchUrl']) {
        this.http.get(this.to['searchUrl'], {
          params: {
            'name': name,
          }
        }).subscribe(data => {
          this.to['option'] = data['data'];
          this.optionSearchs = data['data'];
          this.optionCache = JSON.parse(JSON.stringify(data['data']));
          this.isSearchSelect = false;
        });
      }
    });
  }

  onSearchChange(value) {
    this.isSearchSelect = true;
    this.searchChange$.next(value);
  }

  onSelectChange (value) {

  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
