import * as Y from "yjs";
import { BindableObject, BindableObjectType } from "./Types";
import { BindingMap } from "./BindingMap";
type BindableMarks<T> = {
    [Key in keyof T]?: "const" | "variable";
} & object;
export declare class Bindable {
    private static _rootBindingMap;
    static mark<T extends BindableObject>(Type: BindableObjectType<T>, marks: BindableMarks<T>): void;
    static make<T extends BindableObject>(Type: BindableObjectType<T>, properties?: Partial<T>): T;
    static getRoot(document: Y.Doc, rootName?: string): BindingMap;
}
export {};
