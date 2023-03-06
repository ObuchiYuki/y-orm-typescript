import * as Y from "yjs"
import { autorun } from "mobx"

import { BindingMap } from "../src/BindingMap"

describe("BindingMap.ts", () => {

    const document = new Y.Doc()
    const root = BindingMap.getRoot(document)
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

        store.todo = BindingMap.make(Todo, {
            title: "Hello"
        })
        expect(store.todo).not.toBeUndefined()
        expect(store.todo?.title).toBe("Hello")
        
    });

})
