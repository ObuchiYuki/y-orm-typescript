import * as Y from "yjs"
import { IAtom, createAtom } from "mobx"
import { YElement, BindableObject, BindableObjectType, YPrimitive } from "./Types"
import { BindingMap } from "./BindingMap"

export class Bindable {

    private static _rootBindingMap: BindingMap|undefined

    static make<T extends BindableObject>(Type: BindableObjectType<T>, properties?: Partial<T>): T {
        const empty = new (BindingMap as any)(new Y.Map()) as BindingMap
        const bindable = new Type(empty)

        Object.assign(bindable, properties)
        
        return bindable
    }
    
    static getRoot(document: Y.Doc, rootName: string = "$__root"): BindingMap {
        if (this._rootBindingMap != null) return this._rootBindingMap

        const newValue = new (BindingMap as any)(document.getMap(rootName)) as BindingMap    
        this._rootBindingMap = newValue
        return newValue
    }
}