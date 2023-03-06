import * as Y from "yjs";
import { YElement, BindableObject, BindableObjectType, YPrimitive } from "./Types";
import { BindingArray } from "./BindingArray";
export declare class BindingMap {
    storage: Y.Map<YElement>;
    static rootName: string;
    private _bindableMap;
    private _bindableArrayMap;
    private _atom;
    private constructor();
    has(key: string): boolean;
    clear(): void;
    set(key: string, value: YPrimitive | undefined): void;
    setConst(key: string, value: YPrimitive): void;
    get(key: string): YElement | undefined;
    getConst(key: string): YElement;
    getBoolean(key: string): boolean | undefined;
    getConstBoolean(key: string): boolean;
    getNumber(key: string): number | undefined;
    getConstNumber(key: string): number;
    getString(key: string): string | undefined;
    getConstString(key: string): string;
    setBindable<T extends BindableObject>(key: string, bindable: T | undefined): void;
    setConstBindable<T extends BindableObject>(key: string, bindable: T): void;
    getBindable<T extends BindableObject>(Type: BindableObjectType<T>, key: string): T | undefined;
    getConstBindable<T extends BindableObject>(Type: BindableObjectType<T>, key: string): T;
    takeBindable<T extends BindableObject>(Type: BindableObjectType<T>, key: string): T;
    takeBindableArray<T extends BindableObject>(Type: BindableObjectType<T>, key: string): BindingArray<T>;
    toString(): {
        [x: string]: any;
    };
}
