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
const it = (value, block) => {
    block(value);
    return value;
};
class BindingMap {
    constructor(map) {
        this._bindableMap = new Map();
        this._bindableArrayMap = new Map();
        this.map = map;
        const handler = () => atom.reportChanged();
        const atom = (0, mobx_1.createAtom)("BindingMap", () => this.map.observe(handler), () => this.map.unobserve(handler));
        this._atom = atom;
    }
    static getRoot(document) {
        var _a;
        return (_a = this._rootBindingMap) !== null && _a !== void 0 ? _a : it(new BindingMap(document.getMap(this.rootName)), m => {
            this._rootBindingMap = m;
        });
    }
    set(key, value) {
        this.map.set(key, value);
    }
    get(key) {
        this._atom.reportObserved();
        return this.map.get(key);
    }
    getBoolean(key) {
        const value = this.get(key);
        if (value == null || typeof value != "boolean")
            return;
        return value;
    }
    getNumber(key) {
        const value = this.get(key);
        if (value == null || typeof value != "number")
            return;
        return value;
    }
    getString(key) {
        const value = this.get(key);
        if (value == null || typeof value != "string")
            return;
        return value;
    }
    setBindable(key, bindable) {
        if (bindable == null) {
            this._bindableMap.delete(key);
            this.map.delete(key);
        }
        else {
            this._bindableMap.set(key, bindable);
            this.map.set(key, bindable.storage.map);
        }
    }
    getBindable(Type, key) {
        this._atom.reportObserved();
        const bindable = this._bindableMap.get(key);
        const bindedMap = this.map.get(key);
        if (bindable == null && bindedMap instanceof Y.Map) {
            const bindable = new Type(bindedMap);
            this._bindableMap.set(key, bindable);
            return bindable;
        }
        if (bindable instanceof Type && bindedMap != null) {
            return bindable;
        }
        return undefined;
    }
    takeBindable(Type, key) {
        this._atom.reportObserved();
        if (this._bindableMap.has(key)) {
            const bindable = this._bindableMap.get(key);
            if (bindable instanceof Type)
                return bindable;
        }
        let bindedMap = this.map.get(key);
        if (!(bindedMap instanceof Y.Map)) {
            const newObjectMap = new Y.Map();
            bindedMap = newObjectMap;
            this.map.set(key, newObjectMap);
        }
        const bindable = new Type(bindedMap);
        this._bindableMap.set(key, bindable);
        return bindable;
    }
    // no element type check
    takeBindableArray(Type, key) {
        this._atom.reportObserved();
        if (this._bindableArrayMap.has(key)) {
            return this._bindableArrayMap.get(key);
        }
        let bindableArray = this.map.get(key);
        if (!(bindableArray instanceof Y.Array)) {
            bindableArray = new Y.Array();
            this.map.set(key, bindableArray);
        }
        const arrayStorage = new BindingArray_1.BindingArray(Type, bindableArray);
        this._bindableArrayMap.set(key, arrayStorage);
        return arrayStorage;
    }
    toString() {
        return this.map.toJSON();
    }
}
exports.BindingMap = BindingMap;
BindingMap.rootName = "$_root";
