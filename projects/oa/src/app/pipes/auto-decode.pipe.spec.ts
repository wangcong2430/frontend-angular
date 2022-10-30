import { AutoDecodePipe } from './auto-decode.pipe';

describe('AutoDecodePipe', () => {
    it('create an instance', () => {
        const pipe = new AutoDecodePipe();
        expect(pipe).toBeTruthy();
    });
});
