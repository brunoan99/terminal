import { BinSet, EnvSet } from "@domain";

type Statement = {
  env: string[];
  bin: string;
  arguments: string[];
};

class Shell {
  envSet: EnvSet;
  binSet: BinSet;

  constructor() {
    this.envSet = { a: "b", b: "c", c: "d" };
    this.binSet = { alo: (input: string) => ({ code: 1, data: "certo" }) };
  }

  parse(input: string): Statement[] {
    return [];
  }

  check(input: string): void {}

  exec(input: string) {
    // Remember to fork the EnvVariables to run the process
  }
}

export { Shell };
