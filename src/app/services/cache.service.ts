import {Injectable} from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';


@Injectable()
export class CacheService {
    constructor(
      private storage: LocalStorage
    ) {}

    remove(key) {
        return this.storage.removeItem(key);
    }

    set(key, value) {
        return this.storage.setItem(key, value);
    }

    get(key) {
        return this.storage.getItem(key);
    }

    from(key, callback) {
        return new Observable(subscribe => {
            this.get(key).subscribe(result => {
                if (result) {
                    subscribe.next(result);
                    subscribe.complete();
                } else {
                    callback().then(result => {
                        this.set(key, result).subscribe(res => {
                            subscribe.next(result);
                            subscribe.complete();
                        });
                    });
                }
            });
        });
    }

    clear() {
        return this.storage.clear();
    }
}

