import * as Y from "yjs"
import { transaction } from "mobx"
import { YElement, BindableObject, BindableObjectType, YPrimitive } from "./Types"
import { BindingMap } from "./BindingMap"

type BindableMarks<T> = { [Key in keyof T]? : "const"|"variable" } & object

class __BindableMarks<T> {
    constructor(
        public value: BindableMarks<T>
    ) {}
}

export class Bindable {

    private static _rootBindingMap: BindingMap|undefined

    static mark<T extends BindableObject>(Type: BindableObjectType<T>, marks: BindableMarks<T>) {
        (Type as any).$__bindable_marks = new __BindableMarks(marks)
    }

    static make<T extends BindableObject>(Type: BindableObjectType<T>, properties?: Partial<T>): T {
        const empty = new (BindingMap as any)(new Y.Map()) as BindingMap
        const bindable = new Type(empty)
        const __bindableMarks = (Type as any).$__bindable_marks as __BindableMarks<T>|undefined

        if (__bindableMarks != null) {
            const bindableMarks = __bindableMarks.value
            for (const key in bindableMarks) {
                const value = bindableMarks[key as keyof BindableMarks<T>]

                if (value == "const") {
                    if (properties == null || properties[key] == null) {
                        throw new Error(`Proeprty for key '${key}' marked as const. You should provide initial value.`)
                    }
                }
            } 
        }
            

        transaction(() => {
            Object.assign(bindable, properties)
        }) 
        
        return bindable
    }
    
    static getRoot(document: Y.Doc, rootName: string = "$__root"): BindingMap {
        if (this._rootBindingMap != null) return this._rootBindingMap

        const newValue = new (BindingMap as any)(document.getMap(rootName)) as BindingMap    
        this._rootBindingMap = newValue
        return newValue
    }
}