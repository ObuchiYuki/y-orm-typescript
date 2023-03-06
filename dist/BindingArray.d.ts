import * as Y from "yjs";
import { YMap, BindableObject, BindableObjectType } from "./Types";
export declare class BindingArray<Element extends BindableObject> {
    array: Y.Array<YMap>;
    ElementType: BindableObjectType<Element>;
    private _bindableMap;
    private _atom;
    constructor(ElementType: BindableObjectType<Element>, array: Y.Array<YMap>);
    get length(): number;
    insert(index: number, values: Element[]): void;
    push(values: Element[]): void;
    unshift(values: Element[]): void;
    delete(start: number, length?: number): void;
    clear(): void;
    get(index: number): Element;
    toArray(): Element[];
    map<T>(block: (element: Element, index: number, array: BindingArray<Element>) => T): T[];
    forEach<T>(block: (element: Element, index: number, array: BindingArray<Element>) => void): void;
    [Symbol.iterator](): IterableIterator<Element>;
    private _takeObject;
    toString(): any[];
}
