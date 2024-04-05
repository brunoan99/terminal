import { Bin, BinResponse } from "@domain";
import { Environment } from "./environment";
import { pipe } from "fp-ts/lib/function";
import { Option, some as Some, none as None, isSome } from "fp-ts/lib/Option";
import { Either, left as Left, right as Right, isLeft } from "fp-ts/lib/Either";
import { MemoryFileSystem } from "./file-system";
import { Binaries } from "./binaries";

const FirstSomeOnMap = <F, W>(
  input: F,
  func: ((a: F) => Option<W>)[]
): Option<W> => {
  if (func.length === 0) return None;
  let out = func[0](input);
  if (isSome(out)) return out;
  return FirstSomeOnMap(input, func.slice(1));
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

type EvalResp = {
  type: "eval_resp";
  code: number;
  out: string;
};

type ShellOp = {
  path: string;
  code: number;
  input: string;
  output: string;
};

class Shell {
  private just_cleared: boolean = false;
  private contain_clear: boolean = false;
  constructor(
    public envs: Environment,
    public binSet: Binaries,
    public fileSystem: MemoryFileSystem,
    public ops: ShellOp[]
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

  private check_starts_with_operator(input: Parsed): Either<string, null> {
    return input[0].type === "op"
      ? Left(`zsh: parse error near \`${input[0].op}'`)
      : Right(null);
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
    if (input.bin === "clear") return Right(null);
    if (!this.binSet.contains(input.bin))
      return Left(`zsh: command not found: ${input.bin}`);
    return Right(null);
  }

  private check_env_name(input: string): Either<string, null> {
    if (input.match(/^[a-zA-Z_]{1,}$[a-zA-Z0-9_]{0,}/)) return Right(null);
    return Left(`export: not valid in this context: ${input}`);
  }

  private check_env(input: EnvChange): Either<string, null> {
    const check_name_res = this.check_env_name(input.name);
    if (isLeft(check_name_res)) return check_name_res;

    return Right(null);
  }

  private check_var(input: VarChange): Either<string, null> {
    const check_name_res = this.check_env_name(input.name);
    if (isLeft(check_name_res)) return check_name_res;

    return Right(null);
  }

  private check_one(input: Expression | Subshell): Either<string, null> {
    if (input.type === "bin") return this.check_bin(input);
    if (input.type === "env") return this.check_env(input);
    if (input.type === "var") return this.check_var(input);
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
    const check_start_res = this.check_starts_with_operator(input);
    if (isLeft(check_start_res)) return check_start_res;

    const check_seq_res = this.check_sequential_operators(input);
    if (isLeft(check_seq_res)) return check_seq_res;

    const check_every_res = this.check_every(input);
    if (isLeft(check_every_res)) return check_every_res;

    return Right(null);
  }

  private eval_env_string(input: string): string {
    let cloned_input = input;
    if (input.split("$").length > 1) {
      let env_name = (
        input.match(/\$[a-zA-Z_]{1,}[a-zA-Z0-9_]{0,}/) as RegExpMatchArray
      )[0];
      let env_value = this.envs.getEnv(env_name.split("").slice(1).join(""));
      cloned_input = cloned_input.replaceAll(env_name, env_value);
    }
    return cloned_input;
  }

  private eval_args(input: string[]): string[] {
    return input.map((value) => this.eval_env_string(value));
  }

  private eval_bin_clear() {
    this.ops.length = 0;
    this.just_cleared = true;
    this.contain_clear = true;
  }

  private async eval_bin_aux(input: BinCall): Promise<EvalResp> {
    if (input.bin === "clear") {
      this.eval_bin_clear();
      return {
        type: "eval_resp",
        code: 1,
        out: "",
      };
    }
    this.just_cleared = false;
    const bin = this.binSet.getBin(input.bin);
    const args = this.eval_args(input.args);
    const bin_out = await (bin as Bin).exec(args, this.fileSystem);
    return {
      type: "eval_resp",
      code: bin_out.code,
      out: bin_out.out,
    };
  }

  private async eval_bin(
    input: BinCall,
    leval: BinResponse,
    last_op: "" | ";" | "|" | "||" | "&&"
  ): Promise<EvalResp | undefined> {
    if (last_op === "") {
      return this.eval_bin_aux(input);
    } else if (last_op === ";") {
      const op = await this.eval_bin_aux(input);
      let append_prev = leval.out ? leval.out + "\n" : "";
      if (this.just_cleared) {
        append_prev = "";
      }
      const out = append_prev + op.out;
      return {
        type: "eval_resp",
        code: op.code,
        out: out,
      };
    } else if (last_op === "&&" && leval.code !== 0) {
      return;
    } else if (last_op === "&&") {
      const op = await this.eval_bin_aux(input);
      let append_prev = leval.out ? leval.out + "\n" : "";
      if (this.just_cleared) {
        append_prev = "";
      }
      const out = append_prev + op.out;
      return {
        type: "eval_resp",
        code: op.code,
        out: out,
      };
    } else if (last_op === "||" && leval.code === 0) {
      return;
    } else if (last_op === "||") {
      return this.eval_bin_aux(input);
    }
    return this.eval_bin_aux({
      ...input,
      args: [...input.args, leval.out],
    });
  }

  private async eval_subshell_aux(input: Subshell): Promise<EvalResp> {
    return await this.eval(input.statements);
  }

  private async eval_subshell(
    input: Subshell,
    leval: EvalResp,
    last_op: "" | ";" | "|" | "||" | "&&"
  ): Promise<EvalResp | undefined> {
    if (last_op === "") {
      return this.eval_subshell_aux(input);
    } else if (last_op === ";") {
      const op = await this.eval_subshell_aux(input);
      let append_prev = leval.out && !this.just_cleared ? leval.out + "\n" : "";
      const out = append_prev + op.out;
      return {
        type: "eval_resp",
        code: op.code,
        out: out,
      };
    } else if (last_op === "&&" && leval.code !== 0) {
      return;
    } else if (last_op === "&&") {
      const op = await this.eval_subshell_aux(input);
      let append_prev = leval.out && !this.just_cleared ? leval.out + "\n" : "";
      const out = append_prev + op.out;
      return {
        type: "eval_resp",
        code: op.code,
        out: out,
      };
    } else if (last_op === "||" && leval.code === 0) {
      return;
    } else if (last_op === "||") {
      return this.eval_subshell_aux(input);
    }
    if (input.statements[0].type === "bin")
      input.statements[0].args = [...input.statements[0].args, leval.out];
    return this.eval_subshell_aux(input);
  }

  private eval_var(input: VarChange): void {
    // for simplicity both envs and vars will be storage in same place
    const value = this.eval_env_string(input.value);
    this.envs.change(input.name, value);
  }

  private eval_env(input: EnvChange): void {
    // for simplicity both envs and vars will be storage in same place
    const value = this.eval_env_string(input.value);
    this.envs.change(input.name, value);
  }

  async eval(input: Parsed): Promise<EvalResp> {
    let leval: EvalResp = {
      type: "eval_resp",
      code: 0,
      out: "",
    };
    let last_op: "" | ";" | "|" | "||" | "&&" = "";
    for (let value of input) {
      if (value.type === "bin") {
        const out = await this.eval_bin(value, leval, last_op);
        if (out !== undefined) {
          leval = out;
        }
      } else if (value.type === "subshell") {
        const out = await this.eval_subshell(value, leval, last_op);
        if (out !== undefined) {
          leval = out;
        }
      } else if (value.type === "var") {
        this.eval_var(value);
      } else if (value.type === "env") {
        this.eval_env(value);
      } else if (value.type === "op") {
        last_op = value.op;
      }
    }
    return leval;
  }

  async exec(input: string): Promise<ShellOp> {
    let path = this.fileSystem.currentPath;
    const parsed = this.parse(input);
    const check = this.check(parsed);
    let op;
    if (isLeft(check)) {
      op = {
        path,
        input: input,
        output: check.left,
        code: 1,
      };
    } else {
      const evaluated = await this.eval(parsed);
      op = {
        path,
        input: input,
        output: evaluated.out,
        code: evaluated.code,
      };
    }
    if (!this.just_cleared) {
      this.ops.push(op);
    } else {
      this.just_cleared = false;
    }
    if (this.contain_clear) {
      op.input = "";
      op.path = "";
      this.contain_clear = false;
    }
    return op;
  }
}

export { Shell };
export type {
  BinCall,
  EnvChange,
  VarChange,
  Operator,
  Subshell,
  Expression,
  ShellOp,
};
