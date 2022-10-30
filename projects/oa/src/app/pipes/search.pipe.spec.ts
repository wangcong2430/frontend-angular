import { SearchPipe } from './search.pipe';

describe('SearchPipe', () => {
    it('create an instance', () => {
        const pipe = new SearchPipe();
        expect(pipe).toBeTruthy();
    });

    it('transform', () => {
        const pipe = new SearchPipe();

        const preSearchList = [
            {
                orderKey: '3',
                value: 3
            },
            {
                orderKey: '2',
                value: 2
            },
            {
                orderKey: '1',
                value: 1
            }
        ];
        const searched_list = pipe.transform(preSearchList, 'value', '1', true);
        expect(searched_list[0]['value']).toBe(1);
    });

    it('no term', () => {
        const pipe = new SearchPipe();

        const preSearchList = [
            {
                orderKey: '3',
                value: 3
            },
            {
                orderKey: '2',
                value: 2
            },
            {
                orderKey: '1',
                value: 1
            }
        ];
        const searched_list = pipe.transform(preSearchList, 'value', null, true);
        expect(searched_list[0]['value']).toBe(3);
    });

    it('no flag', () => {
        const pipe = new SearchPipe();

        const preSearchList = [
            {
                orderKey: '3',
                value: 3
            },
            {
                orderKey: '2',
                value: 2
            },
            {
                orderKey: '1',
                value: 1
            }
        ];
        const searched_list = pipe.transform(preSearchList, 'value', '1', false);
        expect(searched_list[0]['value']).toBe(1);
    });
});
