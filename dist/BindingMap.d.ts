import * as Y from "yjs";
import { YElement, BindableObject, BindableObjectType } from "./Types";
import { BindingArray } from "./BindingArray";
export declare class BindingMap {
    map: Y.Map<YElement>;
    static rootName: string;
    private _bindableMap;
    private _bindableArrayMap;
    private _atom;
    private static _rootBindingMap;
    constructor(map: Y.Map<YElement>);
    static getRoot(document: Y.Doc): BindingMap;
    set(key: string, value: YElement): void;
    get(key: string): YElement | undefined;
    getBoolean(key: string): boolean | undefined;
    getNumber(key: string): number | undefined;
    getString(key: string): string | undefined;
    setBindable<T extends BindableObject>(key: string, bindable: T | undefined): void;
    getBindable<T extends BindableObject>(Type: {
        new (map: Y.Map<YElement>): T;
    }, key: string): T | undefined;
    takeBindable<T extends BindableObject>(Type: {
        new (map: Y.Map<YElement>): T;
    }, key: string): T;
    takeBindableArray<T extends BindableObject>(Type: BindableObjectType<T>, key: string): BindingArray<T>;
    toString(): {
        [x: string]: any;
    };
}
