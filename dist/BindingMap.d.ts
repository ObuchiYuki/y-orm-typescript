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
    set(key: string, value: YPrimitive | undefined): void;
    setInitialValueToConst(key: string, value: YPrimitive): void;
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
