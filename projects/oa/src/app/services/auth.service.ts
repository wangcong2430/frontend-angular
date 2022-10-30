import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PermissionService } from '../../api-client';

@Injectable()
export class AuthService {

  private promises = {};
  constructor(
    private permissionService: PermissionService
  ) {}

  has(name, data = null) {
    if (!this.promises[name]) {
      this.promises[name] = new Promise(resolve => {
        this.permissionService.webPermissionHasPost({
          name: name,
          data: data
        }).subscribe(result => {
          if (result['code'] === 0) {
              resolve(result['data']);
          }
        });
      });
    }
    return this.promises[name];
  }
}
