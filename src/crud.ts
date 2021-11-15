import { constants } from "./constants";
import { schemaType, itemType } from "./items";

export default class CRUD {
  protected readonly storageType: string;

  private lastId: number;

  protected readonly schema: schemaType;

  constructor(schema: schemaType, storageType = constants.STORAGE_LOCAL) {
    this.schema = schema;
    this.storageType = storageType;
    this.lastId = 0;
  }

  // eslint-disable-next-line
  validateSchema<T>(obj: Partial<T>, schema: T) {
    if (!obj) {
      throw constants.STATUS_ERROR;
    }
    Object.keys(obj).forEach((prop) => {
      if (!Object.hasOwnProperty.call(schema, prop)) {
        throw Error(`${constants.STATUS_ERROR}: no ${prop} in schema`);
      }
    });
    return constants.STATUS_OK;
  }

  async createItem(item: itemType) {
    try {
      this.validateSchema(item, this.schema);
    } catch (e) {
      throw e;
    }
    const schema = { ...this.schema };
    Object.entries(item).forEach(([key, value]) => {
      schema[key] = value;
    });
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
        localStorage.setItem(`${this.lastId}`, JSON.stringify(schema));
        this.lastId += 1;
        break;
      case constants.STORAGE_DB:
        break;
      default:
        break;
    }
  }

  async readItem(id: number) {
    let item;
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
        if (!Object.hasOwnProperty.call(localStorage, `${id}`)) {
          throw Error(`${constants.STATUS_ERROR}: no ${id} in storage`);
        }
        item = { ...JSON.parse(localStorage.getItem(`${id}`) as string) };
        break;
      case constants.STORAGE_DB:
        break;
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
        break;
      default:
        break;
    }
  }

  async deleteItem(id: number) {
    switch (this.storageType) {
      case constants.STORAGE_LOCAL:
        if (!Object.hasOwnProperty.call(localStorage, `${id}`)) {
          throw Error(`${constants.STATUS_ERROR}: no ${id} in storage`);
        }
        localStorage.removeItem(`${id}`);
        break;
      case constants.STORAGE_DB:
        break;
      default:
        break;
    }
  }
}
