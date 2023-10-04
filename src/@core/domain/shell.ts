import { BinSet, EnvSet } from "@domain";
import { Var, VarSet } from "./environment";
import { pipe } from "fp-ts/lib/function";
import { Option, some as Some, none as None, isSome } from "fp-ts/lib/Option";

const MatchFirstSome = <F, W>(
  input: F,
  func: ((a: F) => Option<W>)[]
): Option<W> => {
  if (func.length === 0) return None;
  let out = func[0](input);
  if (isSome(out)) return Some(out.value);
  else return MatchFirstSome(input, func.slice(1));
};

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

type Expression = BinCall | VarChange | EnvChange | Operator;
type Parsed = (Expression | Subshell)[];

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

  private check_bin_call(input: String): Option<BinCall> {
    let expressions = input.split(" ");
    return Some({
      type: "bin",
      bin: expressions[0],
      args: expressions.slice(1),
    });
  }

  private parse_unit(input: String): Expression {
    const checks = MatchFirstSome<String, Expression>(input, [
      this.check_operators,
      this.check_var_change,
      this.check_env_change,
      this.check_bin_call,
    ]);
    if (isSome(checks)) return checks.value;
    return { type: "bin", bin: "ops", args: [] };
  }

  private parse_sub(input: RawSplited): Subshell {
    return { statements: this.parse(input as RawSplited) };
  }

  parse(input: RawSplited): Parsed {
    return input.map((value) => {
      return typeof value === "string"
        ? this.parse_unit(value as String)
        : this.parse_sub(value as RawSplited);
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
export type { BinCall, EnvChange, Var, Subshell, Expression };
