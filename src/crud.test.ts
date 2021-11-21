import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore/lite";
import CRUD from "./crud";
import { constants } from "./constants";
import { items, itemType, schema } from "./items";

describe("CRUD testing", () => {
  let crudLocalStorage: CRUD;
  let crudDB: CRUD;
  beforeEach(() => {
    crudLocalStorage = new CRUD(schema);
    crudDB = new CRUD(schema, constants.STORAGE_DB);
  });
  test("Instantiating CRUD", () => {
    expect(crudLocalStorage).toBeInstanceOf(CRUD);
    expect(crudLocalStorage.schema).toBe(schema);
    expect(crudDB).toBeInstanceOf(CRUD);
    expect(crudDB.schema).toBe(schema);
  });
  test("Schema validation", () => {
    let item: itemType = { wrongProperty: 0 } as unknown as itemType;
    try {
      crudLocalStorage.validateSchema(
        item as unknown as itemType,
        crudLocalStorage.schema
      );
    } catch (e) {
      expect((e as Error).message).toBe(
        `${constants.STATUS_ERROR}: no wrongProperty in schema`
      );
    }

    try {
      crudLocalStorage.validateSchema(
        null as unknown as itemType,
        crudLocalStorage.schema
      );
    } catch (e) {
      expect((e as Error).message).toBe(`${constants.STATUS_ERROR}`);
    }

    item = { task: "shopping" };
    expect(crudLocalStorage.validateSchema(item, crudLocalStorage.schema)).toBe(
      constants.STATUS_OK
    );
  });
  describe("CRUD operations", () => {
    beforeEach(async () => {
      localStorage.clear();
      items.forEach((item) => crudLocalStorage.createItem(item));
      const allItemsSnap = await getDocs(
        collection(crudDB.db, crudDB.collectionName)
      );
      await allItemsSnap.forEach((itemSnap) =>
        deleteDoc(doc(crudDB.db, crudDB.collectionName, `${itemSnap.id}`))
      );
      // FIXME: forEach
      await crudDB.createItem(items[0]);
      await crudDB.createItem(items[1]);
      await crudDB.createItem(items[2]);
    });
    test("Create tasks", async () => {
      const allItemsSnap = await getDocs(
        collection(crudDB.db, crudDB.collectionName)
      );
      expect(allItemsSnap.docs.length).toBe(items.length);
      expect(Object.keys(localStorage).length).toBe(items.length);
      items.map(async (item, i) => {
        expect(JSON.stringify(item)).toBe(localStorage.getItem(`${i}`));
        const itemSnap = await getDoc(
          doc(crudDB.db, crudDB.collectionName, `${i}`)
        );
        expect(item).toStrictEqual(await itemSnap.data());
      });
    });
    test("Read tasks", async () =>
      items.map(async (item, i) => {
        expect(JSON.stringify(item)).toBe(localStorage.getItem(`${i}`));
        crudDB.readItem(i).then((obj) => expect(obj).toStrictEqual(item));
      }));
    const newTask = {
      task: "one",
      status: constants.TASK_FULFILLED,
    };
    // FIXME
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip("Update tasks DB", () => {
      items.forEach(async (item, i) => {
        crudDB
          .updateItem(newTask, i)
          .then(() => getDoc(doc(crudDB.db, crudDB.collectionName, `${i}`)))
          .then((obj) => expect(obj.data()).toStrictEqual(item));
      });
    });
    test("Update tasks localStorage", () => {
      items.forEach(async (item, i) => {
        await crudLocalStorage.updateItem(newTask, i);
        const obj = await crudLocalStorage.readItem(i);
        expect(obj.task).toBe(newTask.task);
        expect(obj.status).toBe(newTask.status);
      });
    });

    test("Delete task", () => {
      items.forEach(async (item, i) => {
        try {
          await crudLocalStorage.deleteItem(i);
          await crudLocalStorage.readItem(i);
        } catch (e) {
          expect((e as Error).message).toBe(
            `${constants.STATUS_ERROR}: no ${i} in storage`
          );
        }
        await crudDB.deleteItem(i);
        const itemSnap = await getDoc(
          doc(crudDB.db, crudDB.collectionName, `${i}`)
        );
        expect(itemSnap.exists()).toBeFalsy();
      });
    });
  });
});
