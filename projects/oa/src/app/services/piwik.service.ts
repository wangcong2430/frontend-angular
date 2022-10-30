import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../api-client';

@Injectable()
export class PiwikService {
  _apiUrl;
  _id;

  constructor(
    private cache: CacheService,
    private http: HttpClient
  ) {}

  getParams() {
    return {
      idsite: this._id,
      rec: 1,
      url: location.href,
      res: window.screen.width + 'x' + window.screen.height
    };
  }

  getEventParams (category, action, name, value) {
    const params = this.getParams();
    params['e_c'] = category;
    params['e_a'] = action;
    params['e_n'] = name;
    params['e_v'] = value;
    return params;
  }

  _request(params) {
    if (this._apiUrl) {
      const user = this.cache.get('user');
      if (user) {
        params['uid'] = user['username'];
        params['rand'] = Math.random();
        this.http.get(this._apiUrl, {
          params: params
        }).subscribe();
      }
    }
  }

  init(apiUrl, id) {
    this._apiUrl = apiUrl;
    this._id = id;
  }

  track() {
    const params = this.getParams();
    this._request(params);
  }

  trackEvent(category, action, name, value) {
    const params = this.getEventParams(category, action, name, value);
    this._request(params);
  }
}
