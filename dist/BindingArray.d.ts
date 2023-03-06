import * as Y from "yjs";
import { YMap, BindableObject, BindableObjectType } from "./Types";
export declare class BindingArray<Element extends BindableObject> {
    backingArray: Y.Array<YMap>;
    ElementType: BindableObjectType<Element>;
    private _objectMap;
    private _atom;
    constructor(ElementType: BindableObjectType<Element>, array: Y.Array<YMap>);
    get(index: number): Element;
    toArray(): Element[];
    insert(index: number, values: Element[]): void;
    push(values: Element[]): void;
    clear(): void;
    private _takeObject;
}
