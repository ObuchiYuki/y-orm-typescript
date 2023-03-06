import * as Y from "yjs"
import { IAtom, createAtom } from "mobx"
import { YElement, BindableObject, BindableObjectType } from "./Types"
import { BindingArray } from "./BindingArray"

const it = <T>(value: T, block: (value: T) => void): T => {
    block(value)
    return value
}

export class BindingMap {
    public map: Y.Map<YElement>

    public static rootName = "$_root"

    private _bindableMap = new Map<string, BindableObject>()
    private _bindableArrayMap = new Map<string, BindingArray<any>>()
    private _atom: IAtom

    private static _rootBindingMap: BindingMap|undefined

    constructor(map: Y.Map<YElement>) {
        this.map = map
        const handler = () => atom.reportChanged()
        const atom = createAtom(
            "BindingMap", () => this.map.observe(handler), () => this.map.unobserve(handler)
        )
        this._atom = atom
    }

    static getRoot(document: Y.Doc): BindingMap {
        return this._rootBindingMap ?? it(new BindingMap(document.getMap(this.rootName)), m => {
            this._rootBindingMap = m
        })
    }
    
    set(key: string, value: YElement) {
        this.map.set(key, value)
    }

    get(key: string): YElement | undefined { 
        this._atom.reportObserved()
        return this.map.get(key) 
    }

    getBoolean(key: string): boolean | undefined {
        const value = this.get(key)
        if (value == null || typeof value != "boolean") return
        return value
    }

    getNumber(key: string): number | undefined {
        const value = this.get(key)
        if (value == null || typeof value != "number") return
        return value
    }

    getString(key: string): string | undefined {
        const value = this.get(key)
        if (value == null || typeof value != "string") return
        return value
    }

    setBindable<T extends BindableObject>(key: string, bindable: T | undefined) {
        if (bindable == null) {
            this._bindableMap.delete(key)
            this.map.delete(key)
        } else {
            this._bindableMap.set(key, bindable)
            this.map.set(key, bindable.storage.map)
        }
    }

    getBindable<T extends BindableObject>(Type: { new(map: Y.Map<YElement>): T }, key: string): T | undefined {
        this._atom.reportObserved()
        
        const bindable = this._bindableMap.get(key)
        const bindedMap = this.map.get(key)

        if (bindable == null && bindedMap instanceof Y.Map) { 
            const bindable = new Type(bindedMap)
            this._bindableMap.set(key, bindable)
            return bindable
        }
        
        if (bindable instanceof Type && bindedMap != null) { 
            return bindable 
        }

        return undefined
    }

    takeBindable<T extends BindableObject>(Type: { new(map: Y.Map<YElement>): T }, key: string): T {
        this._atom.reportObserved()
        
        if (this._bindableMap.has(key)) { 
            const bindable = this._bindableMap.get(key)
            if (bindable instanceof Type) return bindable
        }

        let bindedMap = this.map.get(key) 
        if (!(bindedMap instanceof Y.Map)) {
            const newObjectMap = new Y.Map()
            bindedMap = newObjectMap
            this.map.set(key, newObjectMap)
        } 
    
        const bindable = new Type(bindedMap as Y.Map<YElement>)
        this._bindableMap.set(key, bindable)
        return bindable
    }

    // no element type check
    takeBindableArray<T extends BindableObject>(Type: BindableObjectType<T>, key: string): BindingArray<T> {
        this._atom.reportObserved()

        if (this._bindableArrayMap.has(key)) { 
            return this._bindableArrayMap.get(key) as BindingArray<T>
        }

        let bindableArray = this.map.get(key)
        if (!(bindableArray instanceof Y.Array)) {
            bindableArray = new Y.Array()
            this.map.set(key, bindableArray)
        }

        const arrayStorage = new BindingArray(Type, bindableArray as Y.Array<Y.Map<YElement>>)
        this._bindableArrayMap.set(key, arrayStorage)
        return arrayStorage
    }

    toString() {
        return this.map.toJSON()
    }
}