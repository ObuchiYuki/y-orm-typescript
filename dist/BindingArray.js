"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindingArray = void 0;
const mobx_1 = require("mobx");
class BindingArray {
    constructor(ElementType, array) {
        this._bindableMap = new Map();
        this.ElementType = ElementType;
        this.array = array;
        const handler = () => atom.reportChanged();
        const atom = (0, mobx_1.createAtom)("BindingArray", () => array.observe(handler), () => array.unobserve(handler));
        this._atom = atom;
    }
    get length() {
        return this.array.length;
    }
    insert(index, values) {
        console.assert(index < this.array.length, "Index out of range");
        this.array.insert(index, values.map(e => e.storage.map));
        values.forEach(e => {
            this._bindableMap.set(e.storage.map, e);
        });
    }
    push(values) {
        this.array.push(values.map(e => e.storage.map));
        values.forEach(e => {
            this._bindableMap.set(e.storage.map, e);
        });
    }
    unshift(values) {
        this.array.unshift(values.map(e => e.storage.map));
        values.forEach(e => {
            this._bindableMap.set(e.storage.map, e);
        });
    }
    delete(start, length) {
        const rlength = length !== null && length !== void 0 ? length : 1;
        for (let i = start; i < start + rlength; i++) {
            const map = this.array.get(i);
            this._bindableMap.delete(map);
        }
        this.array.delete(start, length);
    }
    clear() {
        this.array.delete(0, this.array.length);
        this._bindableMap.clear();
    }
    get(index) {
        this._atom.reportObserved();
        console.assert(index < this.array.length, "Index out of range");
        const map = this.array.get(index);
        return this._takeObject(map);
    }
    toArray() {
        this._atom.reportObserved();
        return this.array
            .toArray()
            .map(e => this._takeObject(e));
    }
    map(block) {
        const baseArray = this.toArray();
        const newArray = new Array(baseArray.length);
        for (let i = 0; i < baseArray.length; i++) {
            newArray[i] = block(baseArray[i], i, this);
        }
        return newArray;
    }
    forEach(block) {
        const baseArray = this.toArray();
        for (let i = 0; i < baseArray.length; i++) {
            block(baseArray[i], i, this);
        }
    }
    [Symbol.iterator]() {
        return this.toArray()[Symbol.iterator]();
    }
    _takeObject(map) {
        const cached = this._bindableMap.get(map);
        if (cached != null) {
            return cached;
        }
        const newValue = new this.ElementType(map);
        this._bindableMap.set(map, newValue);
        return newValue;
    }
    toString() {
        return this.array.toJSON();
    }
}
exports.BindingArray = BindingArray;
