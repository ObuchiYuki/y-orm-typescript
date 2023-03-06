"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindingArray = void 0;
const mobx_1 = require("mobx");
const BindingMap_1 = require("./BindingMap");
class BindingArray {
    constructor(ElementType, storage) {
        this._bindableMap = new Map();
        this.ElementType = ElementType;
        this.storage = storage;
        const handler = () => atom.reportChanged();
        const atom = (0, mobx_1.createAtom)("BindingArray", () => storage.observe(handler), () => storage.unobserve(handler));
        this._atom = atom;
    }
    get length() {
        return this.storage.length;
    }
    insert(index, values) {
        console.assert(index < this.storage.length, "Index out of range");
        this.storage.insert(index, values.map(e => e.map.storage));
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e);
        });
    }
    push(values) {
        this.storage.push(values.map(e => e.map.storage));
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e);
        });
    }
    unshift(values) {
        this.storage.unshift(values.map(e => e.map.storage));
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e);
        });
    }
    delete(start, length) {
        const rlength = length !== null && length !== void 0 ? length : 1;
        for (let i = start; i < start + rlength; i++) {
            const map = this.storage.get(i);
            this._bindableMap.delete(map);
        }
        this.storage.delete(start, length);
    }
    clear() {
        this.storage.delete(0, this.storage.length);
        this._bindableMap.clear();
    }
    get(index) {
        this._atom.reportObserved();
        console.assert(index < this.storage.length, "Index out of range");
        const map = this.storage.get(index);
        return this._takeObject(map);
    }
    toArray() {
        this._atom.reportObserved();
        return this.storage
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
    filter(block) {
        const baseArray = this.toArray();
        const newArray = [];
        for (let i = 0; i < baseArray.length; i++) {
            if (block(baseArray[i], i, this)) {
                newArray.push(baseArray[i]);
            }
        }
        return newArray;
    }
    forEach(block) {
        const baseArray = this.toArray();
        for (let i = 0; i < baseArray.length; i++) {
            block(baseArray[i], i, this);
        }
    }
    assign(elements) {
        this.clear();
        const newStorage = [];
        for (const element of elements) {
            newStorage.push(element.map.storage);
            this._bindableMap.set(element.map.storage, element);
        }
        this.storage.push(newStorage);
    }
    removeWhere(block) {
        let i = 0;
        const newStorage = [];
        const newBindableMap = new Map();
        for (const map of this.storage) {
            const element = this._takeObject(map);
            if (!block(element, i, this)) {
                newStorage.push(map);
                newBindableMap.set(map, element);
            }
            i++;
        }
        this._bindableMap = newBindableMap;
        this.storage.delete(0, this.storage.length);
        this.storage.push(newStorage);
    }
    [Symbol.iterator]() {
        return this.toArray()[Symbol.iterator]();
    }
    _takeObject(map) {
        const cached = this._bindableMap.get(map);
        if (cached != null) {
            return cached;
        }
        // to make BindingMap constructor private
        const bindingMap = new BindingMap_1.BindingMap(map);
        const newValue = new this.ElementType(bindingMap);
        this._bindableMap.set(map, newValue);
        return newValue;
    }
    toString() {
        return this.storage.toJSON();
    }
}
exports.BindingArray = BindingArray;
