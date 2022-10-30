import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class InstanceFieldService {

  product_id$: EventEmitter<any> = new EventEmitter();
  product_role_has_user: object = {
    id: null,
    promise: null,
  };
  work_flow_id;

  queryFields = [];

  constructor() {}

  find(key) {
    let result;
    this['queryFields'].forEach(item => {
      if (item.key === key) {
        result = item;
      }
    });
    if (result) {
      return result;
    }
  }
}

