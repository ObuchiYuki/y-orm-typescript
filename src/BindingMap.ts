import * as Y from "yjs"
import { IAtom, createAtom } from "mobx"
import { YElement, BindableObject, BindableObjectType } from "./Types"
import { BindingArray } from "./BindingArray"

export class BindingMap {
    public map: Y.Map<YElement>
    private _objectMap = new Map<string, BindableObject>()
    private _arrayMap = new Map<string, BindingArray<any>>()
    private _atom: IAtom

    public static rootName = "$_root"

    private static _root: BindingMap|undefined

    static getRoot(document: Y.Doc): BindingMap {
        if (this._root != null) return this._root
        const storage = new BindingMap(document.getMap<YElement>(this.rootName))
        this._root = storage
        return storage
    }

    constructor(map: Y.Map<YElement>) {
        this.map = map
        const handler = () => atom.reportChanged()
        const atom = createAtom(
            "BindingMap", () => this.map.observe(handler), () => this.map.unobserve(handler)
        )
        this._atom = atom
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

    setObject<T extends BindableObject>(key: string, object: T | undefined) {
        if (object == null) {
            this._objectMap.delete(key)
            this.map.delete(key)
        } else {
            this._objectMap.set(key, object)
            this.map.set(key, object.storage.map)
        }
    }

    takeObject<T extends BindableObject>(
        Type: { new(map: Y.Map<YElement>): T }, 
        key: string,
        typeGuard: ((value: unknown) => value is T) = (value): value is T => value instanceof Type
    ): T {
        this._atom.reportObserved()
        if (this._objectMap.has(key)) { // if exists in objectMap return it
            const value = this._objectMap.get(key)
            if (typeGuard(value)) { return value }
        }

        let objectMap = this.map.get(key) 
        if (!(objectMap instanceof Y.Map)) {
            const newObjectMap = new Y.Map<YElement>()
            objectMap = newObjectMap
            this.map.set(key, newObjectMap)
        } 
    
        const value = new Type(objectMap as Y.Map<YElement>)
        this._objectMap.set(key, value)
        return value
    }

    getObject<T extends BindableObject>(
        Type: { new(map: Y.Map<YElement>): T }, 
        key: string,
        typeGuard: ((value: unknown) => value is T) = (value): value is T => value instanceof Type
    ): T | undefined {
        this._atom.reportObserved()
        
        const value = this._objectMap.get(key)
        const map = this.map.get(key)

        if (value == null && map instanceof Y.Map) { 
            const value = new Type(map)
            this._objectMap.set(key, value)
            return value
        }
        
        if (value != null && typeGuard(value)) { 
            return value 
        }

        return undefined
    }

    getArray<T extends BindableObject>(Type: BindableObjectType<T>, key: string): BindingArray<T> {
        this._atom.reportObserved()

        const cached = this._arrayMap.get(key)
        if (cached != null) { return cached as BindingArray<T> }

        let arrayValue = this.map.get(key)
        if (arrayValue == null || !(arrayValue instanceof Y.Array)) {
            arrayValue = new Y.Array()
            this.map.set(key, arrayValue)
        }

        const array = arrayValue as Y.Array<Y.Map<YElement>>
        
        const arrayStorage = new BindingArray(Type, array)
        this._arrayMap.set(key, arrayStorage)
        return arrayStorage
    }

}