import util from "util"
import * as Y from "yjs"
import { v4 as uuid } from "uuid"
import { autorun, makeObservable, observable } from "mobx"

import { BindingArray } from "../src/BindingArray"
import { Bindable } from "../src/Bindable"
import { YElement, YPrimitive } from "../src/Types"
import { BindingMap } from "../src/BindingMap"

describe("BindingArray.ts", () => {
    const document = new Y.Doc()
    const root = Bindable.getRoot(document)
    afterEach(() => { root.clear() })
        

    test("removeWhere", () => {

        class Todo {
            get title() { return this.map.getString("title") }
            set title(_) { this.map.set("title", _) }

            [util.inspect.custom]() { return { title: this.title } }

            constructor(public map: BindingMap) {}
        }

        const todos = root.takeBindableArray(Todo, "todos")

        todos.push([
            Bindable.make(Todo, { title: "Hello" }),
            Bindable.make(Todo, { title: "World" }),
            Bindable.make(Todo, { title: "Flare" }),
        ])

        expect(todos.length).toBe(3)
        expect(todos.map(e => e.title)).toEqual([ "Hello", "World", "Flare" ])

        console.log(todos.toArray())

        todos.removeWhere(e => e.title == "Hello")

        expect(todos.length).toBe(2)
        expect(todos.map(e => e.title)).toEqual([ "World", "Flare" ])
    })
})