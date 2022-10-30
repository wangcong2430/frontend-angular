import { Injectable } from '@angular/core';

@Injectable()
export class TableService {

    private _list = [];

    public setList (list) {
        this._list = list;
    }

    public getList () {
        return this._list;
    }

    // 全部展开、全部收起
    public openOrCloseAll(bool = true) {
        this._list = this._list.map(data => {
            data.expand = bool;
            return data;
        });
    }

    // 表格全选
    public checkAll(value: boolean): void {
        this._list = this._list.map(data => {
            data.checked = value;
            data.indeterminate = false;
            data.children = data.children ? data.children.map(item => {
                item.checked = value;
                return item;
            }) : null;
            return data;
        });
    }

    // 取反
    public checkReverse(): void {
        this._list.map(data => {
            data.checked = !data.checked;
            data.children = data.children ? data.children.map (item => {
                item.checked = !item.checked;
                return item;
            }) : null;
            return data;
        });
    }

    // 复制一行
    public copyLine (id: string, key: string = 'id'): void {
        // this._list.
        const item = this._list.find(item => item[key] === id);
        this._list = [...this._list, item];
    }

    // 删除
    public deleteLine (id: string, key: string = 'id'): void {
        this._list.filter(item => item[key] !== id);
    }
}
