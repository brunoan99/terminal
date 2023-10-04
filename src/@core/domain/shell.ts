import { BinSet, EnvSet, Op } from "@domain";
import { Var, VarSet } from "./environment";
import { pipe } from "fp-ts/lib/function";
import { Option, some as Some, none as None, isSome } from "fp-ts/lib/Option";
import { Either, left as Left, right as Right, isLeft } from "fp-ts/lib/Either";

const FirstSomeOnMap = <F, W>(
  input: F,
  func: ((a: F) => Option<W>)[]
): Option<W> => {
  if (func.length === 0) return None;
  let out = func[0](input);
  if (isSome(out)) return Some(out.value);
  else return FirstSomeOnMap(input, func.slice(1));
};

type RawSplited = (string | string[] | RawSplited)[];

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

type Operator = {
  type: "op";
  op: ";" | "|" | "||" | "&&";
};

type Subshell = {
  type: "subshell";
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

  private split_operators(input: string): string[] {
    return input.split(/(?=[|]|[;]|[&]|[(]|[)])|(?<=[|]|[;]|[&]|[(]|[)])/g);
  }

  private split_fix_double_operators(input: string[]): string[] {
    for (let index = 0; index < input.length; index++) {
      if (input[index] == "|" && input[index + 1] == "|")
        input.splice(index, 2, "||");
      else if (input[index] == "&" && input[index + 1] == "&")
        input.splice(index, 2, "&&");
    }
    return input;
  }

  private split_fix_empty_and_withespaces(input: string[]): string[] {
    return input.map((value) => value.trim()).filter((value) => value !== "");
  }

  private split_fix_paranthesis(input: string[]): RawSplited {
    let replaceOpen = (s: string) => s.replaceAll('"(",', "[");
    let replaceClose = (s: string) => s.replaceAll(',")"', "]");
    return pipe(input, JSON.stringify, replaceOpen, replaceClose, JSON.parse);
  }

  private split_expression(input: string): RawSplited {
    return pipe<string, string[], string[], string[], RawSplited>(
      input,
      this.split_operators,
      this.split_fix_double_operators,
      this.split_fix_empty_and_withespaces,
      this.split_fix_paranthesis
    );
  }

  private parse_operators(input: string): Option<Operator> {
    if (![";", "|", "||", "&&"].includes(input)) return None;
    return Some({
      type: "op",
      op: input as ";" | "|" | "||" | "&&",
    });
  }

  private parse_var_change(input: string): Option<VarChange> {
    let expression = input.split(" ");
    if (expression.length > 1) return None;
    let variable = input.split("=");
    if (variable.length === 2)
      return Some({ type: "var", name: variable[0], value: variable[1] });
    return None;
  }

  private parse_env_change(input: string): Option<EnvChange> {
    let expression = input.split(" ");
    if (expression.length !== 2) return None;
    if (expression[0] === "export") {
      let variable = expression[1].split("=");
      return Some({ type: "env", name: variable[0], value: variable[1] });
    }
    return None;
  }

  private parse_bin_call(input: string): Option<BinCall> {
    let expressions = input.split(" ");
    return Some({
      type: "bin",
      bin: expressions[0],
      args: expressions.slice(1),
    });
  }

  private parse_unit(input: string): Expression {
    const checks = FirstSomeOnMap<string, Expression>(input, [
      this.parse_operators,
      this.parse_var_change,
      this.parse_env_change,
      this.parse_bin_call,
    ]);
    if (isSome(checks)) return checks.value;
    return { type: "bin", bin: "ops", args: [] };
  }

  private parse_sub(input: RawSplited): Subshell {
    return {
      type: "subshell",
      statements: this.parse_aux(input as RawSplited),
    };
  }

  private parse_aux(input: RawSplited): Parsed {
    return input.map((value) => {
      return typeof value === "string"
        ? this.parse_unit(value as string)
        : this.parse_sub(value as RawSplited);
    });
  }

  parse(input: string): Parsed {
    const splited = this.split_expression(input);
    const parsed = this.parse_aux(splited);
    return parsed;
  }

  private check_sequential_operators(input: Parsed): Either<string, null> {
    const seq_op = input.find((value, index, arr) => {
      if (index < arr.length && index > 0)
        return value.type === "op" && arr[index - 1].type === "op";
    });
    if (seq_op !== undefined)
      return Left(`zsh: parse error near \`${(seq_op as Operator).op}'`);
    return Right(null);
  }

  private check_bin(input: BinCall): Either<string, null> {
    if (!this.binSet.contains(input.bin))
      return Left(`zsh: command not found: ${input.bin}`);
    return Right(null);
  }

  private check_one(input: Expression | Subshell): Either<string, null> {
    if (input.type === "bin") return this.check_bin(input);
    if (input.type === "subshell") return this.check(input.statements);
    return Right(null);
  }

  private check_every(input: Parsed): Either<string, null> {
    for (const value of input) {
      const check = this.check_one(value);
      if (isLeft(check)) return check;
    }
    return Right(null);
  }

  check(input: Parsed): Either<string, null> {
    const check_seq_op = this.check_sequential_operators(input);
    if (isLeft(check_seq_op)) return check_seq_op;

    const check_every = this.check_every(input);
    if (isLeft(check_every)) return check_every;

    return Right(null);
  }

  eval(input: Parsed): Op {
    throw new Error();
  }

  exec(input: string): Op {
    const parsed = this.parse(input);
    const check = this.check(parsed);
    if (isLeft(check))
      return {
        path: "",
        input: input,
        output: check.left,
        code: 1,
      };
    const result = this.eval(parsed);
    return result;
  }
}

export { Shell };
export type { BinCall, EnvChange, Var, Operator, Subshell, Expression };
