import * as Y from "yjs"
import { v4 as uuid } from "uuid"
import { autorun, makeObservable, observable } from "mobx"

import { BindingMap } from "../src/BindingMap"
import { Bindable } from "../src/Bindable"
import { YElement, YPrimitive } from "../src/Types"

describe("BindingMap.ts", () => {

    const document = new Y.Doc()
    const root = Bindable.getRoot(document)
    afterEach(() => { root.clear() })
        
    test("autorunが適切に実行されるか", () => {
        class Todo {
            constructor(public map: BindingMap){}

            get title() { return this.map.getString("title") }
            set title(value) { this.map.set("title", value) }
        }


        const todo = root.takeBindable(Todo, "todo")
        
        let autorunFunc = jest.fn()
        let lastResult: string | undefined = ""
        autorun(() => {
            autorunFunc()
            lastResult = todo.title
        })

        todo.title = "Hello"

        expect(autorunFunc).toBeCalledTimes(2)
        expect(lastResult).toBe("Hello")
    });

    test("ネストしたオブジェクトのテスト", () => {
        class Todo {
            constructor(public map: BindingMap){}
        
            get title() { return this.map.getString("title") }
            set title(value) { this.map.set("title", value) }
        }

        class TodoStore {
            constructor(public map: BindingMap){}

            get todo() { return this.map.getBindable(Todo, "todo") }
            set todo(value) { this.map.setBindable("todo", value) }
        }

        const store = root.takeBindable(TodoStore, "store")
        expect(store.todo).toBeUndefined()

        store.todo = Bindable.make(Todo, {
            title: "Hello"
        })
        expect(store.todo).not.toBeUndefined()
        expect(store.todo?.title).toBe("Hello")
        
    });

    test("定数のテスト", () => {
        const todoID = "512-fjahsasuy"

        class Todo {
            get id() { return this.map.getString("id") ?? "" }
            set id(value) { this.map.setInitialValueToConst("id", value) }

            get title() { return this.map.getString("title") }
            set title(value) { this.map.set("title", value) }

            constructor(public map: BindingMap){}
        }

        const todo = Bindable.make(Todo, {
            id: todoID
        })
        expect(todo.id).toBe(todoID)
        
    });

})
