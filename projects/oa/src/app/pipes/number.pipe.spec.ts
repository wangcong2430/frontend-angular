import { NumberPipe } from './number.pipe';

describe('NumberPipe', () => {
    it('create an instance', () => {
        const pipe = new NumberPipe();
        expect(pipe).toBeTruthy();
    });

    it('transform', () => {
        const pipe = new NumberPipe();
        expect(pipe.transform(1.12345, 2)).toBe('1.12');
    });
});
