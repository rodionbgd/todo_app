import CRUD from "./crud";
import TODO from "./todo";

import { items, schema } from "./items";
import { constants } from "./constants";

describe("TODO testing", () => {
  let todo: TODO;

  beforeEach(() => {
    localStorage.clear();
    todo = new TODO(schema);
    items.forEach((item) => todo.createItem(item));
  });

  test("Instantiating TODO", () => {
    expect(todo).toBeInstanceOf(TODO);
    expect(todo).toBeInstanceOf(CRUD);
    expect(todo.createItem).toBeTruthy();
    expect(todo.schema).toBe(schema);
  });
  describe("Filter applying", () => {
    test("Filter by set of tags", async () => {
      const filteredItems = await todo.filter({ tags: ["two", "three"] });
      expect(filteredItems.length).toBe(2);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[1]));
      expect(JSON.stringify(filteredItems[1])).toBe(JSON.stringify(items[2]));
    });
    test("Filter by task content", async () => {
      const filteredItems = await todo.filter({ task: "cond" });
      expect(filteredItems.length).toBe(1);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[1]));
    });
    test("Filter by task status", async () => {
      const filteredItems = await todo.filter({
        status: constants.TASK_FULFILLED,
      });
      expect(filteredItems.length).toBe(1);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[2]));
    });
    test("Filter by date", async () => {
      const filteredItems = await todo.filter({ expired: items[0].expired });
      expect(filteredItems.length).toBe(1);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[0]));
    });
    test("Complex filter", async () => {
      const filteredItems = await todo.filter({
        tags: ["two"],
        task: "sec",
        status: constants.TASK_IN_PROCESS,
      });
      expect(filteredItems.length).toBe(1);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[1]));
    });
  });
});
