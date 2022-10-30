import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';


@Injectable()
export class CacheService {
    constructor(private storage: LocalStorage) {}

    remove(key) {
        return this.storage.removeItem(key); 
    }

    set(key, value) {
        this.storage.setItem(key, value);
        return this.storage.setItem(key, value);
    }

    getKey(id) {
        return  window.btoa(location.href + id)
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
                    callback().then(item => {
                        this.set(key, item).subscribe(res => {
                            subscribe.next(item);
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

