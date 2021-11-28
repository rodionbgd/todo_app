import { collection, getDocs } from "firebase/firestore/lite";
import { constants } from "./constants";
import CRUD from "./crud";
import { itemType, schemaType } from "./items";

export default class TODO extends CRUD {
  constructor(
    schema: schemaType,
    storageType = constants.STORAGE_LOCAL,
    collectionName = ""
  ) {
    super(schema, storageType, collectionName);
  }

  async filter(options: itemType) {
    try {
      this.validateSchema(options, this.schema);
    } catch (e) {
      throw e;
    }
    let items: schemaType[] = [];
    let allItemsSnap: any;
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
        await null;
        Object.keys(localStorage).forEach((index) => {
          items.push(JSON.parse(localStorage.getItem(index) as string));
        });
        items = [...this.filterByType(options, items)];
        break;
      case constants.STORAGE_DB:
        allItemsSnap = await getDocs(collection(this.db, this.collectionName));
        allItemsSnap.forEach((item: any) => {
          items.push(item.data() as schemaType);
        });
        items = [...this.filterByType(options, items)];
        break;
      default:
        break;
    }
    return items;
  }

  // eslint-disable-next-line class-methods-use-this
  filterByType(options: itemType, items: schemaType[]) {
    let filteredItems: schemaType[] = [];
    Object.entries(options).forEach(([key, value]) => {
      filteredItems = items.filter((obj) => {
        if (Array.isArray(obj[key])) {
          let hasProperty = false;
          (value as Extract<schemaType[keyof schemaType], any[]>).forEach(
            (property) => {
              if (obj[key]!.indexOf(property) !== -1) {
                hasProperty = true;
              }
            }
          );
          return hasProperty;
        }
        if (typeof obj[key] === "string") {
          return obj[key]!.indexOf(value as string) !== -1;
        }
        return obj[key] === value;
      });
    });
    return filteredItems;
  }
}
