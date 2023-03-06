import * as Y from "yjs";
import { YElement, BindableObject, BindableObjectType, YPrimitive } from "./Types";
import { BindingArray } from "./BindingArray";
type ConstMap<T> = {
    [P in keyof T]?: YPrimitive;
};
export declare class BindingMap {
    storage: Y.Map<YElement>;
    static rootName: string;
    private _bindableMap;
    private _bindableArrayMap;
    private _atom;
    private static _rootBindingMap;
    static make<T extends BindableObject>(Type: BindableObjectType<T>, properties?: Partial<T>): T;
    constructor(storage: Y.Map<YElement>);
    static getRoot(document: Y.Doc): BindingMap;
    static constants<T extends BindableObject & object>(value: T, properties: ConstMap<T>): void;
    static constants<T extends BindableObject & object>(value: T, properties: () => ConstMap<T>): void;
    has(key: string): boolean;
    set(key: string, value: YPrimitive | undefined): void;
    get(key: string): YElement | undefined;
    clear(): void;
    getBoolean(key: string): boolean | undefined;
    getNumber(key: string): number | undefined;
    getString(key: string): string | undefined;
    setBindable<T extends BindableObject>(key: string, bindable: T | undefined): void;
    getBindable<T extends BindableObject>(Type: BindableObjectType<T>, key: string): T | undefined;
    takeBindable<T extends BindableObject>(Type: BindableObjectType<T>, key: string): T;
    takeBindableArray<T extends BindableObject>(Type: BindableObjectType<T>, key: string): BindingArray<T>;
    toString(): {
        [x: string]: any;
    };
}
export {};
