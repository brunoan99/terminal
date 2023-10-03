import { BinSet, EnvSet } from "@domain";
import { VarSet } from "./environment";

type Statement = {
  bin_name: string;
  arguments: string[];
};

type Operator = {
  op: string;
};

type Subshell = {
  env: EnvSet | undefined;
  bin: BinSet | undefined;
  statements: Array<Statement | Subshell | Operator>;
};

const OPERATORS = ["|", "&&", "||", ";"];

class Shell {
  constructor(
    protected envSet: EnvSet,
    protected varSet: VarSet,
    protected binSet: BinSet
  ) {}

  fix_double_operator(input: String[]): String[] {
    const splited = input;
    for (let index = 0; index < splited.length; index++) {
      if (splited[index] == "|" && splited[index + 1] == "|") {
        splited[index] = "||";
        splited.splice(index + 1, 1);
      } else if (splited[index] == "&" && splited[index + 1] == "&") {
        splited[index] = "&&";
        splited.splice(index + 1, 1);
      }
    }
    return splited;
  }

  fix_paranthesis(input: String[]): Array<String | String[]> {
    let as_json = JSON.stringify(input);
    let open_replaced = as_json.replaceAll('"(",', "[");
    let all_replaced = open_replaced.replaceAll(',")"', "]");
    return JSON.parse(all_replaced);
  }

  remove_empty_and_whitespaces(input: String[]): String[] {
    return input
      .map((value) => {
        return value.trim();
      })
      .filter((value) => {
        return value !== "";
      });
  }

  split_expression(input: String): Array<String | String[]> {
    let psts_acc: String[] = [];
    if (!input || input === "") return psts_acc;
    let splited: String[];
    splited = input.split(/(?=[|]|[;]|[&]|[(]|[)])|(?<=[|]|[;]|[&]|[(]|[)])/g);
    psts_acc = this.fix_double_operator(splited);
    psts_acc = this.remove_empty_and_whitespaces(psts_acc);
    let sts_acc = this.fix_paranthesis(psts_acc);
    return sts_acc;
  }

  parse(
    input: Array<String | String[]>
  ): Array<Statement | Subshell | Operator> {
    let sts_acc: Array<Statement | Subshell | Operator> = [];
    return sts_acc;
  }

  check(input: string): void {
    return;
  }

  exec(input: string): string {
    return "";
  }
}

export { Shell };
