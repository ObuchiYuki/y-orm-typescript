import * as Y from "yjs";
import { YElement, BindableObject, BindableObjectType } from "./Types";
import { BindingArray } from "./BindingArray";
export declare class BindingMap {
    map: Y.Map<YElement>;
    private _objectMap;
    private _arrayMap;
    private _atom;
    static rootName: string;
    private static _root;
    static getRoot(document: Y.Doc): BindingMap;
    constructor(map: Y.Map<YElement>);
    set(key: string, value: YElement): void;
    get(key: string): YElement | undefined;
    getBoolean(key: string): boolean | undefined;
    getNumber(key: string): number | undefined;
    getString(key: string): string | undefined;
    setObject<T extends BindableObject>(key: string, object: T | undefined): void;
    takeObject<T extends BindableObject>(Type: {
        new (map: Y.Map<YElement>): T;
    }, key: string, typeGuard?: ((value: unknown) => value is T)): T;
    getObject<T extends BindableObject>(Type: {
        new (map: Y.Map<YElement>): T;
    }, key: string, typeGuard?: ((value: unknown) => value is T)): T | undefined;
    getArray<T extends BindableObject>(Type: BindableObjectType<T>, key: string): BindingArray<T>;
}
