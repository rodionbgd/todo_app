import { collection, doc, getDoc, getDocs } from "firebase/firestore/lite";
import CRUD from "./crud";
import { constants } from "./constants";
import { items, itemType, schema } from "./items";
import initTest from "./test/init_test";

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
      await initTest(crudDB, crudLocalStorage);
    });
    describe("Create tasks", () => {
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
    });
    describe("Read tasks", () => {
      test("Read tasks", () => {
        items.map(async (item, i) => {
          expect(JSON.stringify(item)).toBe(localStorage.getItem(`${i}`));
          return crudDB
            .readItem(i)
            .then((obj) => expect(obj).toStrictEqual(item));
        });
      });
    });

    const newTask = {
      task: "one",
      status: constants.TASK_FULFILLED,
    };
    describe("Update tasks DB", () => {
      test("Update tasks DB", async () => {
        await crudDB.updateItem(newTask, 1);
        const newItem = await crudDB.readItem(1);
        expect(newItem!.task).toBe(newTask.task);
        expect(newItem!.status).toBe(newTask.status);
        return items.map(async (item, i) => {
          await crudLocalStorage.updateItem(newTask, i);
          const obj = await crudLocalStorage.readItem(i);
          expect(obj.task).toBe(newTask.task);
          expect(obj.status).toBe(newTask.status);
        });
      });
    });

    describe("Delete task localStorage", () => {
      test("Delete task localStorage", () => {
        items.forEach(async (item, i) => {
          await crudLocalStorage.deleteItem(i);
          try {
            await crudLocalStorage.readItem(i);
          } catch (e) {
            expect((e as Error).message).toBe(
              `${constants.STATUS_ERROR}: no ${i} in storage`
            );
          }
        });
      });
    });
    describe("Delete task DB", () => {
      test("Delete task DB", async () => {
        await crudDB.deleteItem(1);
        const itemSnap = await getDoc(
          doc(crudDB.db, crudDB.collectionName, `${1}`)
        );
        expect(itemSnap.exists()).toBeFalsy();
      });
    });
  });
});
