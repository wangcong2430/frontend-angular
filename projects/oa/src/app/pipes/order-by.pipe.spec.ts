import { OrderByPipe } from './order-by.pipe';

describe('OrderByPipe', () => {
    it('create an instance', () => {
        const pipe = new OrderByPipe();
        expect(pipe).toBeTruthy();
    });

    it('transform', () => {
        const pipe = new OrderByPipe();
        const preOrderList = [
            {
                orderKey: '3',
                value: 2
            },
            {
                orderKey: '2',
                value: 2
            },
            {
                orderKey: '1',
                value: 2
            }
        ];
        const orderedList = pipe.transform(preOrderList, 'orderKey');
        expect(orderedList[0]['orderKey']).toBe('1');
    });

    it('no key', () => {
        const pipe = new OrderByPipe();
        const preOrderList = [
            {
                orderKey: '3',
                value: 2
            },
            {
                orderKey: '2',
                value: 2
            },
            {
                orderKey: '1',
                value: 2
            }
        ];
        const orderedList = pipe.transform(preOrderList, null);
        expect(orderedList[0]['orderKey']).toBe('3');
    });

    it('no key', () => {
        const pipe = new OrderByPipe();
        const preOrderList = [
            {
                orderKey: '1',
                value: 2
            },
            {
                orderKey: '3',
                value: 2
            },
            {
                orderKey: '2',
                value: 2
            },
        ];
        const orderedList = pipe.transform(preOrderList, '-orderKey');
        expect(orderedList[0]['orderKey']).toBe('3');
    });

    it('no order', () => {
        const pipe = new OrderByPipe();
        const preOrderList = [
            {
                orderKey: '1',
                value: 2
            },
            {
                orderKey: '3',
                value: 2
            },
            {
                orderKey: '2',
                value: 2
            },
            {
                value: 4
            },
            {
                value: 5
            },
        ];
        const orderedList = pipe.transform(preOrderList, '-orderKey');
        expect(orderedList[0]['orderKey']).toBe('3');
    });
});
