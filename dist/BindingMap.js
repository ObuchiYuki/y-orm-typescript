"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindingMap = void 0;
const Y = __importStar(require("yjs"));
const mobx_1 = require("mobx");
const BindingArray_1 = require("./BindingArray");
class BindingMap {
    constructor(storage) {
        this._bindableMap = new Map();
        this._bindableArrayMap = new Map();
        this.storage = storage;
        const handler = () => atom.reportChanged();
        const atom = (0, mobx_1.createAtom)("BindingMap", () => this.storage.observe(handler), () => this.storage.unobserve(handler));
        this._atom = atom;
    }
    has(key) {
        return this.storage.has(key);
    }
    clear() {
        this._bindableArrayMap.clear();
        this._bindableMap.clear();
        this.storage.clear();
    }
    set(key, value) {
        if (value == null) {
            this.storage.delete(key);
        }
        else {
            this.storage.set(key, value);
        }
    }
    setConst(key, value) {
        if (this.storage.has(key)) {
            throw new Error("Setting initial value twice is not allowed.");
        }
        this.storage.set(key, value);
    }
    get(key) {
        this._atom.reportObserved();
        return this.storage.get(key);
    }
    getConst(key) {
        if (!this.storage.has(key)) {
            throw new Error("Const value should not be empty.");
        }
        return this.storage.get(key);
    }
    getBoolean(key) {
        const value = this.get(key);
        if (value == null || typeof value != "boolean")
            return;
        return value;
    }
    getConstBoolean(key) {
        const value = this.getConst(key);
        if (value == null || typeof value != "boolean")
            throw new TypeError();
        return value;
    }
    getNumber(key) {
        const value = this.get(key);
        if (value == null || typeof value != "number")
            return;
        return value;
    }
    getConstNumber(key) {
        const value = this.getConst(key);
        if (value == null || typeof value != "number")
            throw new TypeError();
        return value;
    }
    getString(key) {
        const value = this.get(key);
        if (value == null || typeof value != "string")
            return;
        return value;
    }
    getConstString(key) {
        const value = this.get(key);
        if (value == null || typeof value != "string")
            throw new TypeError();
        return value;
    }
    setBindable(key, bindable) {
        if (bindable == null) {
            this._bindableMap.delete(key);
            this.storage.delete(key);
        }
        else {
            this._bindableMap.set(key, bindable);
            this.storage.set(key, bindable.map.storage);
        }
    }
    setConstBindable(key, bindable) {
        if (this.storage.has(key)) {
            throw new Error("Setting initial value twice is not allowed.");
        }
        this._bindableMap.set(key, bindable);
        this.storage.set(key, bindable.map.storage);
    }
    getBindable(Type, key) {
        this._atom.reportObserved();
        const bindable = this._bindableMap.get(key);
        const bindedMap = this.storage.get(key);
        if (bindable == null && bindedMap instanceof Y.Map) {
            const bindable = new Type(new BindingMap(bindedMap));
            this._bindableMap.set(key, bindable);
            return bindable;
        }
        if (bindable instanceof Type && bindedMap != null) {
            return bindable;
        }
        return undefined;
    }
    getConstBindable(Type, key) {
        const bindable = this._bindableMap.get(key);
        const bindedMap = this.storage.get(key);
        if (bindable == null && bindedMap instanceof Y.Map) {
            const bindable = new Type(new BindingMap(bindedMap));
            this._bindableMap.set(key, bindable);
            return bindable;
        }
        if (bindable instanceof Type && bindedMap != null) {
            return bindable;
        }
        throw new TypeError();
    }
    takeBindable(Type, key) {
        this._atom.reportObserved();
        if (this._bindableMap.has(key)) {
            const bindable = this._bindableMap.get(key);
            if (bindable instanceof Type)
                return bindable;
        }
        let bindedMap = this.storage.get(key);
        if (!(bindedMap instanceof Y.Map)) {
            const newObjectMap = new Y.Map();
            bindedMap = newObjectMap;
            this.storage.set(key, newObjectMap);
        }
        const bindable = new Type(new BindingMap(bindedMap));
        this._bindableMap.set(key, bindable);
        return bindable;
    }
    // no element type check
    takeBindableArray(Type, key) {
        this._atom.reportObserved();
        if (this._bindableArrayMap.has(key)) {
            return this._bindableArrayMap.get(key);
        }
        let bindableArray = this.storage.get(key);
        if (!(bindableArray instanceof Y.Array)) {
            bindableArray = new Y.Array();
            this.storage.set(key, bindableArray);
        }
        const arrayStorage = new BindingArray_1.BindingArray(Type, bindableArray);
        this._bindableArrayMap.set(key, arrayStorage);
        return arrayStorage;
    }
    toString() {
        return this.storage.toJSON();
    }
}
exports.BindingMap = BindingMap;
BindingMap.rootName = "$_root";
