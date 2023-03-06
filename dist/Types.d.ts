import * as Y from "yjs";
import { BindingMap } from "./BindingMap";
export type YPrimitive = boolean | string | number | null | Uint8Array | {
    [Key in string]: YPrimitive;
};
export type YType = Y.Text | Y.Map<YElement> | Y.Array<YElement>;
export type YElement = YPrimitive | YType;
export type YMap = Y.Map<YElement>;
export type BindableObject = {
    map: BindingMap;
};
export type BindableObjectType<T extends BindableObject> = {
    new (map: BindingMap): T;
};
