import { Op } from "./operation";

type Term = {
  ops: Op[];
  actual_path: string;
  buffer: string;
};

export type { Term };
