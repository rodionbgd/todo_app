import { items } from "../items";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore/lite";
import CRUD from "../crud";
import TODO from "../todo";

export default async function initTest(
  crudDB: CRUD | TODO,
  crudLocalStorage: CRUD | TODO
) {
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
}
