import * as Y from "yjs"
import { autorun, computed, makeAutoObservable, IAtom, createAtom } from "mobx"
import { YMap, BindableObject, BindableObjectType } from "./Types"

export class BindingArray<Element extends BindableObject> {
    public array: Y.Array<YMap>
    public ElementType: BindableObjectType<Element>
    
    private _bindableMap: Map<YMap, Element> = new Map()
    private _atom: IAtom

    constructor(ElementType: BindableObjectType<Element>, array: Y.Array<YMap>) {
        this.ElementType = ElementType
        this.array = array
        const handler = () => atom.reportChanged()
        const atom = createAtom("BindingArray", () => array.observe(handler), () => array.unobserve(handler))
        this._atom = atom
    }

    get length(): number {
        return this.array.length
    }

    insert(index: number, values: Element[]) {
        console.assert(index < this.array.length, "Index out of range")

        this.array.insert(
            index, values.map(e => e.storage.map)
        )
        values.forEach(e => {
            this._bindableMap.set(e.storage.map, e)
        })
    }

    push(values: Element[]) {
        this.array.push(
            values.map(e => e.storage.map)
        )
        values.forEach(e => {
            this._bindableMap.set(e.storage.map, e)
        })
    }

    unshift(values: Element[]) {
        this.array.unshift(
            values.map(e => e.storage.map)
        )
        values.forEach(e => {
            this._bindableMap.set(e.storage.map, e)
        })
    }

    delete(start: number, length?: number) {
        const rlength = length ?? 1

        for (let i = start; i < start+rlength; i++) {
            const map = this.array.get(i)
            this._bindableMap.delete(map)
        }

        this.array.delete(start, length)
    }

    clear() {
        this.array.delete(0, this.array.length)
        this._bindableMap.clear()
    }

    get(index: number): Element { 
        this._atom.reportObserved()
        console.assert(index < this.array.length, "Index out of range")

        const map = this.array.get(index)
        return this._takeObject(map)
    }

    toArray(): Element[] {
        this._atom.reportObserved()

        return this.array
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

    forEach<T>(block: (element: Element, index: number, array: BindingArray<Element>) => void) {
        const baseArray = this.toArray()
        
        for (let i = 0; i < baseArray.length; i++) {
            block(baseArray[i], i, this)
        }
    }

    [Symbol.iterator](): IterableIterator<Element> {
        return this.toArray()[Symbol.iterator]()
    }

    private _takeObject(map: YMap): Element {
        const cached = this._bindableMap.get(map)
        if (cached != null) { return cached }
        const newValue = new this.ElementType(map)
        this._bindableMap.set(map, newValue)
        return newValue
    }

    toString() {
        return this.array.toJSON()
    }
}
