import { BinSet, EnvSet } from "@domain";
import { Var, VarSet } from "./environment";
import { pipe } from "fp-ts/lib/function";
import { Option, some as Some, none as None } from "fp-ts/lib/Option";

type RawSplited = (String | String[] | RawSplited)[];

type BinCall = {
  type: "bin";
  bin: string;
  args: string[];
};

type VarChange = {
  type: "var";
  name: string;
  value: string;
};

type EnvChange = {
  type: "env";
  name: string;
  value: string;
};

enum Operator {
  Pipe = "|",
  Or = "||",
  And = "&&",
  Semicolon = ";",
}

type Subshell = {
  statements: Parsed;
};

type Parsed = (BinCall | VarChange | EnvChange | Operator | Subshell)[];

class Shell {
  constructor(
    protected envSet: EnvSet,
    protected varSet: VarSet,
    protected binSet: BinSet
  ) {}

  private split_operators(input: String): String[] {
    return input.split(/(?=[|]|[;]|[&]|[(]|[)])|(?<=[|]|[;]|[&]|[(]|[)])/g);
  }

  private fix_double_operators(input: String[]): String[] {
    for (let index = 0; index < input.length; index++) {
      if (input[index] == "|" && input[index + 1] == "|")
        input.splice(index, 2, "||");
      else if (input[index] == "&" && input[index + 1] == "&")
        input.splice(index, 2, "&&");
    }
    return input;
  }

  private fix_empty_and_withespaces(input: String[]): String[] {
    return input.map((value) => value.trim()).filter((value) => value !== "");
  }

  private fix_paranthesis(input: String[]): RawSplited {
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

  private check_operators(input: String): Option<Operator> {
    if (input === ";") return Some(Operator.Semicolon);
    if (input === "|") return Some(Operator.Pipe);
    if (input === "||") return Some(Operator.Or);
    if (input === "&&") return Some(Operator.And);
    return None;
  }

  private check_var_change(input: String): Option<VarChange> {
    let expression = input.split(" ");
    if (expression.length > 1) return None;
    let variable = input.split("=");
    if (variable.length === 2)
      return Some({ type: "var", name: variable[0], value: variable[1] });
    return None;
  }

  private check_env_change(input: String): Option<EnvChange> {
    let expression = input.split(" ");
    if (expression.length !== 2) return None;
    if (expression[0] === "export") {
      let variable = expression[1].split("=");
      return Some({ type: "env", name: variable[0], value: variable[1] });
    }
    return None;
  }

  private check_statement(input: String): Option<BinCall> {
    let expressions = input.split(" ");
    return Some({
      type: "bin",
      bin: expressions[0],
      args: expressions.slice(1),
    });
  }

  private parse_unit(
    input: String
  ): BinCall | Operator | EnvChange | VarChange {
    let option_operator = this.check_operators(input);
    if (option_operator._tag === "Some") return option_operator.value;

    let option_var_change = this.check_var_change(input);
    if (option_var_change._tag === "Some") return option_var_change.value;

    let option_env_change = this.check_env_change(input);
    if (option_env_change._tag === "Some") return option_env_change.value;

    let option_statement = this.check_statement(input);
    if (option_statement._tag === "Some") return option_statement.value;

    return { type: "bin", bin: "ops", args: [] };
  }

  parse(input: RawSplited): Parsed {
    return input.map((value) => {
      if (typeof value === "string") return this.parse_unit(value as String);
      if (typeof value === "object")
        return { statements: this.parse(value as RawSplited) };
      else return { type: "bin", bin: "ops", args: [] };
    });
  }

  check(input: string): void {
    return;
  }

  exec(input: string): string {
    return "";
  }
}

export { Shell, Operator };
export type { BinCall as Statement, EnvChange, Var, Subshell };
