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

const dates = [
  new Date(new Date().setDate(new Date().getDate() + 1)).toString(),
  new Date(new Date().setDate(new Date().getDate() + 4)).toString(),
  new Date(new Date().setDate(new Date().getDate() + 21)).toString(),
];
export const items: schemaType[] = [
  {
    task: "first",
    expired: dates[0],
    status: constants.TASK_EXPIRED,
    tags: ["one", "one_one"],
  },
  {
    task: "second",
    expired: dates[1],
    status: constants.TASK_IN_PROCESS,
    tags: ["two", "two_two"],
  },
  {
    task: "three",
    expired: dates[2],
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
