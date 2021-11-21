import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  deleteDoc,
  setDoc,
} from "firebase/firestore/lite";
import { constants } from "./constants";
import { schemaType, itemType } from "./items";
import { appConfig } from "./firebase_config";

export default class CRUD {
  protected readonly storageType: string;

  private lastId: number;

  readonly schema: schemaType;

  readonly db: ReturnType<typeof getFirestore>;

  readonly collectionName: string;

  constructor(schema: schemaType, storageType = constants.STORAGE_LOCAL) {
    this.schema = schema;
    this.storageType = storageType;
    this.lastId = 0;
    this.db = getFirestore(appConfig);
    this.collectionName = "todo";
  }

  // eslint-disable-next-line class-methods-use-this
  validateSchema<T>(obj: Partial<T>, schema: T) {
    if (!obj) {
      throw new Error(constants.STATUS_ERROR);
    }
    try {
      Object.keys(obj).forEach((prop) => {
        if (!Object.hasOwnProperty.call(schema, prop)) {
          throw new Error(`${constants.STATUS_ERROR}: no ${prop} in schema`);
        }
      });
    } catch (e) {
      throw e;
    }
    return constants.STATUS_OK;
  }

  async createItem(item: itemType) {
    try {
      this.validateSchema(item, this.schema);
    } catch (e) {
      throw e;
    }
    const newItem = { ...this.schema };
    Object.entries(item).forEach(([key, value]) => {
      newItem[key] = value;
    });
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
        localStorage.setItem(`${this.lastId}`, JSON.stringify(newItem));
        this.lastId += 1;
        break;
      case constants.STORAGE_DB:
        this.lastId += 1;
        return setDoc(
          doc(this.db, this.collectionName, `${this.lastId - 1}`),
          newItem
        );
      default:
        break;
    }
    return constants.STATUS_OK;
  }

  async readItem(id?: number) {
    let item;
    let itemSnap;
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
        if (!Object.hasOwnProperty.call(localStorage, `${id}`)) {
          throw new Error(`${constants.STATUS_ERROR}: no ${id} in storage`);
        }
        item = { ...JSON.parse(localStorage.getItem(`${id}`) as string) };
        break;
      case constants.STORAGE_DB:
        if (id === undefined) {
          const allItems: schemaType[] = [];
          const allItemsSnap = await getDocs(
            collection(this.db, this.collectionName)
          );
          allItemsSnap.forEach((itemDB) => {
            allItems.push(itemDB.data() as schemaType);
          });
          return allItems;
        }
        itemSnap = await getDoc(doc(this.db, this.collectionName, `${id}`));
        if (!itemSnap.exists()) {
          throw new Error(`${constants.STATUS_ERROR}: no ${id} in storage`);
        }
        return itemSnap.data();
      default:
        break;
    }
    return item;
  }

  async updateItem(item: itemType, id: number) {
    try {
      this.validateSchema(item, this.schema);
    } catch (e) {
      throw e;
    }
    let newItem: schemaType;
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
        if (!Object.hasOwnProperty.call(localStorage, `${id}`)) {
          throw Error(`${constants.STATUS_ERROR}: no ${id} in storage`);
        }
        newItem = { ...JSON.parse(localStorage.getItem(`${id}`) as string) };
        Object.entries(item).forEach(([key, value]) => {
          newItem[key] = value;
        });
        localStorage.setItem(`${id}`, JSON.stringify(newItem));
        break;
      case constants.STORAGE_DB:
        await setDoc(doc(this.db, this.collectionName, `${id}`), item, {
          merge: true,
        });
        break;
      default:
        break;
    }
    return constants.STATUS_OK;
  }

  async deleteItem(id: number) {
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
        if (!Object.hasOwnProperty.call(localStorage, `${id}`)) {
          throw new Error(`${constants.STATUS_ERROR}: no ${id} in storage`);
        }
        localStorage.removeItem(`${id}`);
        break;
      case constants.STORAGE_DB:
        return deleteDoc(doc(this.db, this.collectionName, `${id}`));
      default:
        break;
    }
    return constants.STATUS_OK;
  }
}
