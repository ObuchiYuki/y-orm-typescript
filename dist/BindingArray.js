"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindingArray = void 0;
const mobx_1 = require("mobx");
const BindingMap_1 = require("./BindingMap");
function deleted(map) {
    return map._deletedOnce;
}
function setDeleted(map) {
    if (map) {
        map._deletedOnce = true;
    }
}
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
        console.assert(values.every(e => !deleted(e.map)), "Value must not be deleted once.");
        this.storage.insert(index, values.map(e => e.map.storage));
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e);
        });
    }
    push(values) {
        console.assert(values.every(e => !deleted(e.map)), "Value must not be deleted once.");
        this.storage.push(values.map(e => e.map.storage));
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e);
        });
    }
    unshift(values) {
        console.assert(values.every(e => !deleted(e.map)), "Value must not be deleted once.");
        this.storage.unshift(values.map(e => e.map.storage));
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e);
        });
    }
    delete(start, length) {
        var _a;
        const rlength = length !== null && length !== void 0 ? length : 1;
        for (let i = start; i < start + rlength; i++) {
            const map = this.storage.get(i);
            setDeleted((_a = this._bindableMap.get(map)) === null || _a === void 0 ? void 0 : _a.map);
            this._bindableMap.delete(map);
        }
        this.storage.delete(start, length);
    }
    clear() {
        this.delete(0, this.length);
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
    removeWhere(block) {
        const oldArray = this.storage.toArray();
        let removeElements = [];
        for (let i = 0; i < oldArray.length; i++) {
            const map = oldArray[i];
            const element = this._takeObject(map);
            if (block(element, i, this)) {
                removeElements.push(i);
            }
        }
        removeElements = removeElements.reverse();
        for (const i of removeElements) {
            const map = this.storage.get(i);
            this._bindableMap.delete(map);
            this.storage.delete(i);
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
