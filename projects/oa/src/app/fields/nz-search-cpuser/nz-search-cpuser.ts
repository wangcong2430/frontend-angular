import { Component, ElementRef, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { debounceTime } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'formly-field-nz-search-cpuser',
  templateUrl: './nz-search-cpuser.html'
})
export class FormlyFieldNzSearchCpuser extends FieldType implements OnInit {
  searchChange$ = new BehaviorSubject('');
  isSearchSelect = false;
  is_input = true;
  i_num = 0;
  validating = '';
  optionSearchs = [];
  optionCache = [];
  isPull = true;

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

    if (typeof(this.model[this.key + '_options']) !== 'undefined' && this.model[this.key + '_options'] !== '') {
      this.optionSearchs = this.model[this.key + '_options'];
      this.isPull = false;
    }

    this.searchChange$.asObservable().pipe(debounceTime(500))
      .subscribe(name => {
        if (!this.isPull) {
          this.isPull = true;
          return false;
        }
        this.i_num ++;
        let options;
        options = {
          params: {
            'username': name,
          }
        };

        this.validating = 'validating';

        this.http.get('web/user/cp-user-list', options).subscribe(data => {
          this.optionSearchs = data['data'];
          this.optionCache = JSON.parse(JSON.stringify(data['data']));
          this.isSearchSelect = false;
          this.validating = '';
        });
    });
  }

  onSearchChange(value) {
    this.isSearchSelect = true;
    this.searchChange$.next(value);
  }

  onSelectChange(value) {}

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
