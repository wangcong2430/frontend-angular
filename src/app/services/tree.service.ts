import { Injectable } from "@angular/core";

@Injectable()
export class TreeService {
    children_key = 'children';

    map(tree, callback, parent = null) {
        if (!(callback instanceof Function)) {
            return tree;
        }
        if (!Array.isArray(tree)) {
            return tree;
        }
        tree.forEach((node, index) => {
            if (Array.isArray(node[this.children_key])) {
                this.map(node[this.children_key], callback, node);
            }
            tree[index] = callback(node, parent);
        });
        return tree;
    }
}