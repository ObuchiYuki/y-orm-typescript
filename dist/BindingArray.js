"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindingArray = void 0;
const mobx_1 = require("mobx");
class BindingArray {
    constructor(ElementType, array) {
        this._objectMap = new Map();
        this.ElementType = ElementType;
        this.backingArray = array;
        const handler = () => atom.reportChanged();
        const atom = (0, mobx_1.createAtom)("array", () => array.observe(handler), () => array.unobserve(handler));
        this._atom = atom;
    }
    get(index) {
        this._atom.reportObserved();
        console.assert(index < this.backingArray.length, "index outof range");
        const map = this.backingArray.get(index);
        return this._takeObject(map);
    }
    toArray() {
        this._atom.reportObserved();
        return this.backingArray
            .toArray()
            .map(e => this._takeObject(e));
    }
    insert(index, values) {
        console.assert(index < this.backingArray.length, "index outof range");
        this.backingArray.insert(index, values.map(e => e.storage.map));
        values.forEach(e => {
            this._objectMap.set(e.storage.map, e);
        });
    }
    push(values) {
        this.backingArray.push(values.map(e => e.storage.map));
        values.forEach(e => {
            this._objectMap.set(e.storage.map, e);
        });
    }
    clear() {
        this.backingArray.delete(0, this.backingArray.length);
        this._objectMap.clear();
    }
    _takeObject(map) {
        const cached = this._objectMap.get(map);
        if (cached != null) {
            return cached;
        }
        const newValue = new this.ElementType(map);
        this._objectMap.set(map, newValue);
        return newValue;
    }
}
exports.BindingArray = BindingArray;
