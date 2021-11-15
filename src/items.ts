import { constants } from "./constants";

interface stringObjectType {
  [key: string]: string[] | string | undefined;
}

export interface schemaType extends stringObjectType {
  task: string;
  expired: string;
  status: string;
  tags: string[];
}

export type itemType = Partial<schemaType>;

export const item: schemaType[] = [
  {
    task: "first",
    expired: JSON.stringify(
      new Date(new Date().setDate(new Date().getDate() + 1))
    ),
    status: constants.TASK_EXPIRED,
    tags: ["one", "one_one"],
  },
  {
    task: "second",
    expired: JSON.stringify(
      new Date(new Date().setDate(new Date().getDate() + 4))
    ),
    status: constants.TASK_IN_PROCESS,
    tags: ["two", "two_two"],
  },
  {
    task: "three",
    expired: JSON.stringify(
      new Date(new Date().setDate(new Date().getDate() + 21))
    ),
    status: constants.TASK_FULFILLED,
    tags: ["three", "two_two"],
  },
];

export const schema: schemaType = {
  task: "",
  expired: JSON.stringify(
    new Date(new Date().setDate(new Date().getMonth() + 1))
  ),
  status: constants.TASK_IN_PROCESS,
  tags: [],
};
