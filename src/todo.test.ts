import { collection, deleteDoc, doc, getDocs } from "firebase/firestore/lite";
import CRUD from "./crud";
import TODO from "./todo";

import { items, schema } from "./items";
import { constants } from "./constants";

describe("TODO testing", () => {
  let todoLocalStorage: TODO;
  let todoDB: TODO;

  beforeEach(async () => {
    localStorage.clear();
    todoLocalStorage = new TODO(schema);
    todoDB = new TODO(schema, constants.STORAGE_DB);

    items.forEach((item) => todoLocalStorage.createItem(item));

    const allItemsSnap = await getDocs(
      collection(todoDB.db, todoDB.collectionName)
    );
    await allItemsSnap.forEach((itemSnap) =>
      deleteDoc(doc(todoDB.db, todoDB.collectionName, `${itemSnap.id}`))
    );
    // FIXME: forEach
    await todoDB.createItem(items[0]);
    await todoDB.createItem(items[1]);
    await todoDB.createItem(items[2]);
  });

  test("Instantiating TODO", () => {
    expect(todoLocalStorage).toBeInstanceOf(TODO);
    expect(todoLocalStorage).toBeInstanceOf(CRUD);
    expect(todoLocalStorage.createItem).toBeTruthy();
    expect(todoLocalStorage.schema).toBe(schema);

    expect(todoDB).toBeInstanceOf(TODO);
    expect(todoDB).toBeInstanceOf(CRUD);
    expect(todoDB.createItem).toBeTruthy();
    expect(todoDB.schema).toBe(schema);
  });
  describe("Filter applying", () => {
    test("Filter by set of tags", async () => {
      const filterObj = { tags: ["two", "three"] };
      let filteredItems = await todoLocalStorage.filter(filterObj);
      expect(filteredItems.length).toBe(2);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[1]));
      expect(JSON.stringify(filteredItems[1])).toBe(JSON.stringify(items[2]));

      filteredItems = await todoDB.filter(filterObj);
      expect(filteredItems.length).toBe(2);
      expect(filteredItems[0]).toStrictEqual(items[1]);
      expect(filteredItems[1]).toStrictEqual(items[2]);
    });
    test("Filter by task content", async () => {
      const filterObj = { task: "cond" };
      let filteredItems = await todoLocalStorage.filter(filterObj);
      expect(filteredItems.length).toBe(1);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[1]));

      filteredItems = await todoDB.filter(filterObj);
      expect(filteredItems.length).toBe(1);
      expect(filteredItems[0]).toStrictEqual(items[1]);
    });
    test("Filter by task status", async () => {
      const filterObj = {
        status: constants.TASK_FULFILLED,
      };
      let filteredItems = await todoLocalStorage.filter(filterObj);
      expect(filteredItems.length).toBe(1);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[2]));

      filteredItems = await todoDB.filter(filterObj);
      expect(filteredItems.length).toBe(1);
      expect(filteredItems[0]).toStrictEqual(items[2]);
    });
    test("Filter by date", async () => {
      const filterObj = { expired: items[0].expired };
      let filteredItems = await todoLocalStorage.filter(filterObj);
      expect(filteredItems.length).toBe(1);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[0]));

      filteredItems = await todoDB.filter(filterObj);
      expect(filteredItems.length).toBe(1);
      expect(filteredItems[0]).toStrictEqual(items[0]);
    });
    test("Complex filter", async () => {
      const filterObj = {
        tags: ["two"],
        task: "sec",
        status: constants.TASK_IN_PROCESS,
      };
      let filteredItems = await todoLocalStorage.filter(filterObj);
      expect(filteredItems.length).toBe(1);
      expect(JSON.stringify(filteredItems[0])).toBe(JSON.stringify(items[1]));

      filteredItems = await todoDB.filter(filterObj);
      expect(filteredItems.length).toBe(1);
      expect(filteredItems[0]).toStrictEqual(items[1]);
    });
  });
});
