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
    static getRoot(document) {
        if (this._root != null)
            return this._root;
        const storage = new BindingMap(document.getMap(this.rootName));
        this._root = storage;
        return storage;
    }
    constructor(map) {
        this._objectMap = new Map();
        this._arrayMap = new Map();
        this.map = map;
        const handler = () => atom.reportChanged();
        const atom = (0, mobx_1.createAtom)("BindingMap", () => this.map.observe(handler), () => this.map.unobserve(handler));
        this._atom = atom;
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
    setObject(key, object) {
        if (object == null) {
            this._objectMap.delete(key);
            this.map.delete(key);
        }
        else {
            this._objectMap.set(key, object);
            this.map.set(key, object.storage.map);
        }
    }
    takeObject(Type, key, typeGuard = (value) => value instanceof Type) {
        this._atom.reportObserved();
        if (this._objectMap.has(key)) { // if exists in objectMap return it
            const value = this._objectMap.get(key);
            if (typeGuard(value)) {
                return value;
            }
        }
        let objectMap = this.map.get(key);
        if (!(objectMap instanceof Y.Map)) {
            const newObjectMap = new Y.Map();
            objectMap = newObjectMap;
            this.map.set(key, newObjectMap);
        }
        const value = new Type(objectMap);
        this._objectMap.set(key, value);
        return value;
    }
    getObject(Type, key, typeGuard = (value) => value instanceof Type) {
        this._atom.reportObserved();
        const value = this._objectMap.get(key);
        const map = this.map.get(key);
        if (value == null && map instanceof Y.Map) {
            const value = new Type(map);
            this._objectMap.set(key, value);
            return value;
        }
        if (value != null && typeGuard(value)) {
            return value;
        }
        return undefined;
    }
    getArray(Type, key) {
        this._atom.reportObserved();
        const cached = this._arrayMap.get(key);
        if (cached != null) {
            return cached;
        }
        let arrayValue = this.map.get(key);
        if (arrayValue == null || !(arrayValue instanceof Y.Array)) {
            arrayValue = new Y.Array();
            this.map.set(key, arrayValue);
        }
        const array = arrayValue;
        const arrayStorage = new BindingArray_1.BindingArray(Type, array);
        this._arrayMap.set(key, arrayStorage);
        return arrayStorage;
    }
}
exports.BindingMap = BindingMap;
BindingMap.rootName = "$_root";
