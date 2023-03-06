import * as Y from "yjs"
import { autorun, computed, makeAutoObservable, IAtom, createAtom } from "mobx"
import { YMap, BindableObject, BindableObjectType } from "./Types"

export class BindingArray<Element extends BindableObject> {
    public backingArray: Y.Array<YMap>
    public ElementType: BindableObjectType<Element>
    
    private _objectMap: Map<YMap, Element> = new Map()
    private _atom: IAtom

    constructor(ElementType: BindableObjectType<Element>, array: Y.Array<YMap>) {
        this.ElementType = ElementType
        this.backingArray = array
        const handler = () => atom.reportChanged()
        const atom = createAtom("array", () => array.observe(handler), () => array.unobserve(handler))
        this._atom = atom
    }

    get(index: number): Element { 
        this._atom.reportObserved()
        console.assert(index < this.backingArray.length, "index outof range")

        const map = this.backingArray.get(index)
        return this._takeObject(map)
    }

    toArray(): Element[] {
        this._atom.reportObserved()

        return this.backingArray
            .toArray()
            .map(e => this._takeObject(e))
    }

    insert(index: number, values: Element[]) {
        console.assert(index < this.backingArray.length, "index outof range")

        this.backingArray.insert(
            index, values.map(e => e.storage.map)
        )
        values.forEach(e => {
            this._objectMap.set(e.storage.map, e)
        })
    }

    push(values: Element[]) {
        this.backingArray.push(
            values.map(e => e.storage.map)
        )
        values.forEach(e => {
            this._objectMap.set(e.storage.map, e)
        })
    }

    clear() {
        this.backingArray.delete(0, this.backingArray.length)
        this._objectMap.clear()
    }

    private _takeObject(map: YMap): Element {
        const cached = this._objectMap.get(map)
        if (cached != null) { return cached }
        const newValue = new this.ElementType(map)
        this._objectMap.set(map, newValue)
        return newValue
    }
}
