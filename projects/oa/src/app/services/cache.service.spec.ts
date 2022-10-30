import { TestBed, inject, async } from '@angular/core/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {

    it('should be created', inject([CacheService], (service: CacheService) => {
        expect(service).toBeTruthy();
    }));

    it('should be from', async(inject([CacheService], (service: CacheService) => {
        service.clear();
        const cacheString = 'test';
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                resolve(cacheString);
            }, 1000);
        });
        const start_time = (new Date()).getTime();
    })));
});
