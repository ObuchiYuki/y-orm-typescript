import * as Y from "yjs"
import { autorun, computed, makeAutoObservable, IAtom, createAtom } from "mobx"
import { YMap, BindableObject, BindableObjectType } from "./Types"
import { BindingMap } from "./BindingMap"

function deleted(map: BindingMap): boolean {
    return (map as any)._deletedOnce
}
function setDeleted(map: BindingMap|undefined) {
    if (map) {
        (map as any)._deletedOnce = true
    }
}

export class BindingArray<Element extends BindableObject> {
    public storage: Y.Array<YMap>
    public ElementType: BindableObjectType<Element>
    
    private _bindableMap: Map<YMap, Element> = new Map()
    private _atom: IAtom

    constructor(ElementType: BindableObjectType<Element>, storage: Y.Array<YMap>) {
        this.ElementType = ElementType
        this.storage = storage
        const handler = () => atom.reportChanged()
        const atom = createAtom("BindingArray", () => storage.observe(handler), () => storage.unobserve(handler))
        this._atom = atom
    }

    get length(): number {
        return this.storage.length
    }

    insert(index: number, values: Element[]) {
        console.assert(index < this.storage.length, "Index out of range")
        console.assert(values.every(e => !deleted(e.map)), "Value must not be deleted once.")

        this.storage.insert(
            index, values.map(e => e.map.storage)
        )
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e)
        })
    }

    push(values: Element[]) {
        console.assert(values.every(e => !deleted(e.map)), "Value must not be deleted once.")

        this.storage.push(
            values.map(e => e.map.storage)
        )
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e)
        })
    }

    unshift(values: Element[]) {
        console.assert(values.every(e => !deleted(e.map)), "Value must not be deleted once.")
        
        this.storage.unshift(
            values.map(e => e.map.storage)
        )
        values.forEach(e => {
            this._bindableMap.set(e.map.storage, e)
        })
    }

    delete(start: number, length?: number) {
        const rlength = length ?? 1

        for (let i = start; i < start+rlength; i++) {
            const map = this.storage.get(i)
            setDeleted(this._bindableMap.get(map)?.map)
            this._bindableMap.delete(map)
        }

        this.storage.delete(start, length)
    }

    clear() {
        this.delete(0, this.length)
        this.storage.delete(0, this.storage.length)
        this._bindableMap.clear()
    }

    get(index: number): Element { 
        this._atom.reportObserved()
        console.assert(index < this.storage.length, "Index out of range")

        const map = this.storage.get(index)
        return this._takeObject(map)
    }

    toArray(): Element[] {
        this._atom.reportObserved()

        return this.storage
            .toArray()
            .map(e => this._takeObject(e))
    }

    map<T>(block: (element: Element, index: number, array: BindingArray<Element>) => T) {
        const baseArray = this.toArray()
        const newArray: (T)[] = new Array(baseArray.length)

        for (let i = 0; i < baseArray.length; i++) {
            newArray[i] = block(baseArray[i], i, this)
        }
        return newArray
    }

    filter(block: (element: Element, index: number, array: BindingArray<Element>) => boolean): Element[] {
        const baseArray = this.toArray()
        const newArray: Element[] = []

        for (let i = 0; i < baseArray.length; i++) {
            if (block(baseArray[i], i, this)) {
                newArray.push(baseArray[i])
            }
        }
        return newArray
    }

    forEach<T>(block: (element: Element, index: number, array: BindingArray<Element>) => void) {
        const baseArray = this.toArray()
        
        for (let i = 0; i < baseArray.length; i++) {
            block(baseArray[i], i, this)
        }
    }

    removeWhere(block: (element: Element, index: number, array: BindingArray<Element>) => boolean) {
        const oldArray = this.storage.toArray()

        let removeElements: number[] = []
        for (let i = 0; i < oldArray.length; i++) {
            const map = oldArray[i];
            const element = this._takeObject(map)
            
            if (block(element, i, this)) {
                removeElements.push(i)
            }
        }
        
        removeElements = removeElements.reverse()

        for (const i of removeElements) {
            const map = this.storage.get(i)
            this._bindableMap.delete(map)
            this.storage.delete(i)
        }
    }

    [Symbol.iterator](): IterableIterator<Element> {
        return this.toArray()[Symbol.iterator]()
    }

    private _takeObject(map: YMap): Element {
        const cached = this._bindableMap.get(map)
        if (cached != null) { return cached }

        // to make BindingMap constructor private
        const bindingMap = new (BindingMap as any)(map) as BindingMap
        const newValue = new this.ElementType(bindingMap)
        this._bindableMap.set(map, newValue)
        return newValue
    }

    toString() {
        return this.storage.toJSON()
    }
}
