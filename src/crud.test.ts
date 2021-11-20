import CRUD from "./crud";
import { constants } from "./constants";
import { items, itemType, schema } from "./items";

describe("CRUD testing", () => {
  let crud: CRUD;
  beforeEach(() => {
    crud = new CRUD(schema);
  });
  test("Instantiating CRUD", () => {
    expect(crud).toBeInstanceOf(CRUD);
    expect(crud.schema).toBe(schema);
  });
  test("Schema validation", () => {
    let item: itemType = { wrongProperty: 0 } as unknown as itemType;
    try {
      crud.validateSchema(item as unknown as itemType, crud.schema);
    } catch (e) {
      expect((e as Error).message).toBe(
        `${constants.STATUS_ERROR}: no wrongProperty in schema`
      );
    }

    try {
      crud.validateSchema(null as unknown as itemType, crud.schema);
    } catch (e) {
      expect((e as Error).message).toBe(`${constants.STATUS_ERROR}`);
    }

    item = { task: "shopping" };
    expect(crud.validateSchema(item, crud.schema)).toBe(constants.STATUS_OK);
  });
  describe("CRUD operations", () => {
    beforeEach(async () => {
      localStorage.clear();
      items.forEach((item) => crud.createItem(item));
    });
    test("Create tasks", () => {
      expect(Object.keys(localStorage).length).toBe(items.length);
      items.forEach((item, i) => {
        expect(JSON.stringify(item)).toBe(localStorage.getItem(`${i}`));
      });
    });
    test("Read tasks", () => {
      items.forEach(async (item, i) => {
        expect(JSON.stringify(item)).toBe(localStorage.getItem(`${i}`));
      });
    });
    test("Update tasks", () => {
      items.forEach(async (item, i) => {
        const newTask = {
          task: "one",
          status: constants.TASK_FULFILLED,
        };
        await crud.updateItem(newTask, i);
        const obj = await crud.readItem(i);
        expect(obj.task).toBe(newTask.task);
        expect(obj.status).toBe(newTask.status);
      });
    });
    test("Delete task", () => {
      items.forEach(async (item, i) => {
        // eslint-disable-next-line jest/valid-expect-in-promise
        await crud
          .deleteItem(i)
          .then(() => crud.readItem(i))
          .catch((e) => {
            expect(e.message).toBe(
              `${constants.STATUS_ERROR}: no ${i} in storage`
            );
          });
      });
    });
  });
});
