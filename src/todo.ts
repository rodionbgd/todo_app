import { constants } from "./constants";
import CRUD from "./crud";
import { itemType, schemaType } from "./items";

export default class TODO extends CRUD {
  constructor(schema: schemaType, storageType = constants.STORAGE_LOCAL) {
    super(schema, storageType);
  }

  async filter(options: itemType) {
    try {
      this.validateSchema(options, this.schema);
    } catch (e) {
      throw e;
    }
    let items: schemaType[] = [];
    let filteredItems: schemaType[] = [];
    Object.keys(localStorage).forEach((index) => {
      items.push(JSON.parse(localStorage.getItem(index) as string));
    });
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
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
          items = [...filteredItems];
        });
        break;
      case constants.STORAGE_DB:
        break;
      default:
        break;
    }
    return items;
  }
}
