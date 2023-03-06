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
exports.Bindable = void 0;
const Y = __importStar(require("yjs"));
const BindingMap_1 = require("./BindingMap");
class Bindable {
    static make(Type, properties) {
        const empty = new BindingMap_1.BindingMap(new Y.Map());
        const bindable = new Type(empty);
        Object.assign(bindable, properties);
        return bindable;
    }
    static getRoot(document, rootName = "$__root") {
        if (this._rootBindingMap != null)
            return this._rootBindingMap;
        const newValue = new BindingMap_1.BindingMap(document.getMap(rootName));
        this._rootBindingMap = newValue;
        return newValue;
    }
}
exports.Bindable = Bindable;
