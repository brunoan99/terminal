import { BinSet, EnvSet } from "@domain";
import { VarSet } from "./environment";
import { pipe } from "fp-ts/lib/function";

type RawSplited = (String | String[] | RawSplited)[];

type Statement = {
  bin_name: string;
  arguments: string[];
};

enum Operator {
  Pipe = "|",
  Or = "||",
  And = "&&",
  Semicolon = ";",
}

type Subshell = {
  env: EnvSet | undefined;
  bin: BinSet | undefined;
  statements: Parsed;
};

type Parsed = (Statement | Operator | Subshell)[];

class Shell {
  constructor(
    protected envSet: EnvSet,
    protected varSet: VarSet,
    protected binSet: BinSet
  ) {}

  split_operators(input: String): String[] {
    return input.split(/(?=[|]|[;]|[&]|[(]|[)])|(?<=[|]|[;]|[&]|[(]|[)])/g);
  }

  fix_double_operators(input: String[]): String[] {
    for (let index = 0; index < input.length; index++) {
      if (input[index] == "|" && input[index + 1] == "|")
        input.splice(index, 2, "||");
      else if (input[index] == "&" && input[index + 1] == "&")
        input.splice(index, 2, "&&");
    }
    return input;
  }

  fix_empty_and_withespaces(input: String[]): String[] {
    return input.map((value) => value.trim()).filter((value) => value !== "");
  }

  fix_paranthesis(input: String[]): RawSplited {
    let replaceOpen = (s: String) => s.replaceAll('"(",', "[");
    let replaceClose = (s: String) => s.replaceAll(',")"', "]");
    return pipe(input, JSON.stringify, replaceOpen, replaceClose, JSON.parse);
  }

  split_expression(input: String): RawSplited {
    return pipe<String, String[], String[], String[], RawSplited>(
      input,
      this.split_operators,
      this.fix_double_operators,
      this.fix_empty_and_withespaces,
      this.fix_paranthesis
    );
  }

  parse(input: RawSplited): Parsed {
    let sts_acc: Parsed = [];
    return sts_acc;
  }

  check(input: string): void {
    return;
  }

  exec(input: string): string {
    return "";
  }
}

export { Shell, Operator };
