import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class RestLinkService {
  public link_name_map: EventEmitter<number>;

  constructor() {
    this.link_name_map = new EventEmitter();
  }

  public update(count) {
    this.link_name_map.emit(count);
  }
}
