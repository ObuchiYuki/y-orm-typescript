import * as Y from "yjs"
import { IAtom, createAtom } from "mobx"
import { YElement, BindableObject, BindableObjectType, YPrimitive } from "./Types"
import { BindingArray } from "./BindingArray"

export class BindingMap {
    public storage: Y.Map<YElement>

    public static rootName = "$_root"

    private _bindableMap = new Map<string, BindableObject>()
    private _bindableArrayMap = new Map<string, BindingArray<any>>()
    private _atom: IAtom

    private constructor(storage: Y.Map<YElement>) {
        this.storage = storage
        const handler = () => atom.reportChanged()
        const atom = createAtom(
            "BindingMap", () => this.storage.observe(handler), () => this.storage.unobserve(handler)
        )
        this._atom = atom
    }

    has(key: string): boolean {
        return this.storage.has(key) 
    }

    clear() {
        this._bindableArrayMap.clear()
        this._bindableMap.clear()
        this.storage.clear()
    }
    
    set(key: string, value: YPrimitive|undefined) {
        if (value == null) {
            this.storage.delete(key)
        } else {
            this.storage.set(key, value)
        }
    }
    setConst(key: string, value: YPrimitive) {
        if (this.storage.has(key)) { throw new Error("Setting initial value twice is not allowed.") }
        this.storage.set(key, value)        
    }

    get(key: string): YElement | undefined { 
        this._atom.reportObserved()
        return this.storage.get(key) 
    }
    getConst(key: string): YElement {
        if (!this.storage.has(key)) { throw new Error("Const value should not be empty.") }
        return this.storage.get(key)!
    }

    getBoolean(key: string): boolean | undefined {
        const value = this.get(key)
        if (value == null || typeof value != "boolean") return
        return value
    }
    getConstBoolean(key: string): boolean {
        const value = this.getConst(key)
        if (value == null || typeof value != "boolean") {
            throw new TypeError(`Const boolean for key '${key}' is '${typeof value}' type.`)
        }
        return value
    }

    getNumber(key: string): number | undefined {
        const value = this.get(key)
        if (value == null || typeof value != "number") return
        return value
    }
    getConstNumber(key: string): number {
        const value = this.getConst(key)
        if (value == null || typeof value != "number") {
            throw new TypeError(`Const number for key '${key}' is '${typeof value}' type.`)
        }
        return value
    }

    getString(key: string): string | undefined {
        const value = this.get(key)
        if (value == null || typeof value != "string") return
        return value
    }
    getConstString(key: string): string {
        const value = this.get(key)
        if (value == null || typeof value != "string") {
            throw new TypeError(`Const string for key '${key}' is '${typeof value}' type.`)
        }
        return value
    }

    setBindable<T extends BindableObject>(key: string, bindable: T | undefined) {
        if (bindable == null) {
            this._bindableMap.delete(key)
            this.storage.delete(key)
        } else {
            this._bindableMap.set(key, bindable)
            this.storage.set(key, bindable.map.storage)
        }
    }
    setConstBindable<T extends BindableObject>(key: string, bindable: T) {
        if (this.storage.has(key)) { throw new Error("Setting initial value twice is not allowed.") }
        this._bindableMap.set(key, bindable)
        this.storage.set(key, bindable.map.storage)
    }

    getBindable<T extends BindableObject>(Type: BindableObjectType<T>, key: string): T | undefined {
        this._atom.reportObserved()
        
        const bindable = this._bindableMap.get(key)
        const bindedMap = this.storage.get(key)

        if (bindable == null && bindedMap instanceof Y.Map) { 
            const bindable = new Type(new BindingMap(bindedMap))
            this._bindableMap.set(key, bindable)
            return bindable
        }
        
        if (bindable instanceof Type && bindedMap != null) { 
            return bindable 
        }

        return undefined
    }
    getConstBindable<T extends BindableObject>(Type: BindableObjectType<T>, key: string): T {
        const bindable = this._bindableMap.get(key)
        const bindedMap = this.storage.get(key)

        if (bindable == null && bindedMap instanceof Y.Map) { 
            const bindable = new Type(new BindingMap(bindedMap))
            this._bindableMap.set(key, bindable)
            return bindable
        }
        
        if (bindable instanceof Type && bindedMap != null) { 
            return bindable 
        }

        throw new TypeError()
    }

    takeBindable<T extends BindableObject>(Type: BindableObjectType<T>, key: string): T {
        this._atom.reportObserved()
        
        if (this._bindableMap.has(key)) { 
            const bindable = this._bindableMap.get(key)
            if (bindable instanceof Type) return bindable
        }

        let bindedMap = this.storage.get(key) 
        if (!(bindedMap instanceof Y.Map)) {
            const newObjectMap = new Y.Map<YElement>()
            bindedMap = newObjectMap
            this.storage.set(key, newObjectMap)
        } 
    
        const bindable = new Type(new BindingMap(bindedMap as Y.Map<YElement>))
        this._bindableMap.set(key, bindable)
        return bindable
    }

    // no element type check
    takeBindableArray<T extends BindableObject>(Type: BindableObjectType<T>, key: string): BindingArray<T> {
        this._atom.reportObserved()

        if (this._bindableArrayMap.has(key)) { 
            return this._bindableArrayMap.get(key) as BindingArray<T>
        }

        let bindableArray = this.storage.get(key)
        if (!(bindableArray instanceof Y.Array)) {
            bindableArray = new Y.Array()
            this.storage.set(key, bindableArray)
        }

        const arrayStorage = new BindingArray(Type, bindableArray as Y.Array<Y.Map<YElement>>)
        this._bindableArrayMap.set(key, arrayStorage)
        return arrayStorage
    }

    toString() {
        return this.storage.toJSON()
    }
}