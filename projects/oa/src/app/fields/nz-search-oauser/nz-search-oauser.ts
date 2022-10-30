import { Component, ElementRef, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'formly-field-nz-search-oauser',
  templateUrl: './nz-search-oauser.html'
})
export class FormlyFieldNzSearchOauser extends FieldType implements OnInit {
  searchChange$ = new BehaviorSubject('');
  isSearchSelect = false;
  is_input = true;
  i_num = 0;
  validating = '';
  optionSearchs = [];
  optionCache = [];

  constructor(
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
    // 是否有初始化字符串
    if (typeof(this.model[this.key + '_text']) === 'undefined' || this.model[this.key + '_text'] === '') {
      this.i_num ++;
    }
    this.searchChange$.asObservable().pipe(debounceTime(500))
      .subscribe(name => {
        if (!name || name.length === 0) {
          this.optionSearchs = [];
          this.optionCache = [];
          this.isSearchSelect = false;
          return false;
        }
        this.i_num ++;
        let options;
        if (this.i_num === 1) {
          options = {
            params: {
              'names': name,
            }
          };
        } else {
          options = {
            params: {
              'enName': name,
            }
          };
        }

        this.validating = 'validating';

        this.http.get('web/user/search-names', options).subscribe(data => {
          this.optionSearchs = data['data'];
          this.optionCache = JSON.parse(JSON.stringify(data['data']));
          this.isSearchSelect = false;
          this.validating = '';
        });
    });
  }

  onSearchSelect(value) {
    this.isSearchSelect = true;
    this.searchChange$.next(value);
  }

  onSearchChange(value) {}

  onSearchInput() {
    this.is_input = false;
    if (typeof(this.model[this.key + '_text']) !== 'undefined' && this.model[this.key + '_text'] !== '') {
      this.isSearchSelect = true;
      this.searchChange$.next(this.model[this.key + '_text']);
    }
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
