import * as Y from "yjs";
import { BindableObject, BindableObjectType } from "./Types";
import { BindingMap } from "./BindingMap";
export declare class Bindable {
    private static _rootBindingMap;
    static make<T extends BindableObject>(Type: BindableObjectType<T>, properties?: Partial<T>): T;
    static getRoot(document: Y.Doc, rootName?: string): BindingMap;
}
