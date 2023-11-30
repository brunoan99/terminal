import { Bin, BinSet } from "./binaries";
import { Environment } from "./environment";
import { Shell } from "./shell";

describe("Shell", () => {
  describe("Split Expressions *Private*", () => {
    let sut: Shell;

    beforeAll(() => {
      sut = new Shell(new Environment(), new BinSet([]));
    });

    it("should return [] on empty string", () => {
      expect(sut["split_expression"]("")).toEqual([]);
    });

    it("should split a statement in one item on array", () => {
      expect(sut["split_expression"]("echo 123")).toEqual(["echo 123"]);
    });

    it("should split a statement and op", () => {
      expect(sut["split_expression"]("echo 123;")).toEqual(["echo 123", ";"]);

      expect(sut["split_expression"]("echo 123 ||")).toEqual([
        "echo 123",
        "||",
      ]);

      expect(sut["split_expression"]("echo 123 |")).toEqual(["echo 123", "|"]);

      expect(sut["split_expression"]("echo 123 &&")).toEqual([
        "echo 123",
        "&&",
      ]);

      expect(sut["split_expression"]("echo 123 && echo 234")).toEqual([
        "echo 123",
        "&&",
        "echo 234",
      ]);

      expect(sut["split_expression"]("echo 123 || echo 234")).toEqual([
        "echo 123",
        "||",
        "echo 234",
      ]);
    });

    it("should split a subshell", () => {
      expect(sut["split_expression"]("echo 123; (echo 234)")).toEqual([
        "echo 123",
        ";",
        ["echo 234"],
      ]);

      expect(
        sut["split_expression"]("echo 123; (echo 234) || echo 345")
      ).toEqual(["echo 123", ";", ["echo 234"], "||", "echo 345"]);

      expect(
        sut["split_expression"]("echo 123; (echo 234 && echo 456) || echo 345")
      ).toEqual([
        "echo 123",
        ";",
        ["echo 234", "&&", "echo 456"],
        "||",
        "echo 345",
      ]);

      expect(
        sut["split_expression"](
          "echo 123; (echo 234 && echo 456) || (echo 567 || echo 678)"
        )
      ).toEqual([
        "echo 123",
        ";",
        ["echo 234", "&&", "echo 456"],
        "||",
        ["echo 567", "||", "echo 678"],
      ]);
    });

    it("should split a subshell inside another subshell", () => {
      expect(
        sut["split_expression"]("(echo 123; echo 234; ( echo 345; echo 456))")
      ).toEqual([
        ["echo 123", ";", "echo 234", ";", ["echo 345", ";", "echo 456"]],
      ]);

      expect(
        sut["split_expression"](
          "(echo 123; echo 234; ( echo 345; echo 456); echo 567)"
        )
      ).toEqual([
        [
          "echo 123",
          ";",
          "echo 234",
          ";",
          ["echo 345", ";", "echo 456"],
          ";",
          "echo 567",
        ],
      ]);

      expect(
        sut["split_expression"](
          "(echo 123; echo 234; ( echo 345; echo 456 ); echo 567); (echo 678)"
        )
      ).toEqual([
        [
          "echo 123",
          ";",
          "echo 234",
          ";",
          ["echo 345", ";", "echo 456"],
          ";",
          "echo 567",
        ],
        ";",
        ["echo 678"],
      ]);
    });
  });

  describe("Parse", () => {
    let sut: Shell;

    beforeAll(() => {
      sut = new Shell(new Environment(), new BinSet([]));
    });

    it("should parse a Operator", () => {
      expect(sut.parse("; | || &&")).toEqual([
        { type: "op", op: ";" },
        { type: "op", op: "|" },
        { type: "op", op: "||" },
        { type: "op", op: "&&" },
      ]);
    });

    it("should parse a Statement", () => {
      expect(sut.parse("echo 123; cd ~; echo $PWD | jq")).toEqual([
        {
          type: "bin",
          bin: "echo",
          args: ["123"],
        },
        { type: "op", op: ";" },
        {
          type: "bin",
          bin: "cd",
          args: ["~"],
        },
        { type: "op", op: ";" },
        {
          type: "bin",
          bin: "echo",
          args: ["$PWD"],
        },
        { type: "op", op: "|" },
        {
          type: "bin",
          bin: "jq",
          args: [],
        },
      ]);
    });

    it("should parse a Var Addition", () => {
      expect(sut.parse("var=variable; echo $var")).toEqual([
        {
          type: "var",
          name: "var",
          value: "variable",
        },
        { type: "op", op: ";" },
        {
          type: "bin",
          bin: "echo",
          args: ["$var"],
        },
      ]);
    });

    it("should parse a Env Addition", () => {
      expect(sut.parse("export VAR=variable; echo $VAR")).toEqual([
        {
          type: "env",
          name: "VAR",
          value: "variable",
        },
        { type: "op", op: ";" },
        {
          type: "bin",
          bin: "echo",
          args: ["$VAR"],
        },
      ]);
    });

    it("should parse a Subshell", () => {
      expect(sut.parse("echo 123; (echo 234 || echo 345)")).toEqual([
        {
          type: "bin",
          bin: "echo",
          args: ["123"],
        },
        { type: "op", op: ";" },
        {
          type: "subshell",
          statements: [
            {
              type: "bin",
              bin: "echo",
              args: ["234"],
            },
            { type: "op", op: "||" },
            {
              type: "bin",
              bin: "echo",
              args: ["345"],
            },
          ],
        },
      ]);
    });

    it("should parse a nested Subshell", () => {
      expect(
        sut.parse("echo 123; (echo 234 && echo 345 && (echo 456))")
      ).toEqual([
        {
          type: "bin",
          bin: "echo",
          args: ["123"],
        },
        { type: "op", op: ";" },
        {
          type: "subshell",
          statements: [
            {
              type: "bin",
              bin: "echo",
              args: ["234"],
            },
            { type: "op", op: "&&" },
            {
              type: "bin",
              bin: "echo",
              args: ["345"],
            },
            { type: "op", op: "&&" },
            {
              type: "subshell",
              statements: [
                {
                  type: "bin",
                  bin: "echo",
                  args: ["456"],
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe("Check", () => {
    let sut: Shell;

    beforeAll(() => {
      const echoBin = new Bin("echo", (input: string[]) => ({
        code: 0,
        out: "aopa",
      }));
      const binSet = new BinSet([echoBin]);
      sut = new Shell(new Environment(), binSet);
    });

    it("should return no error when check should pass", () => {
      expect(
        sut.check([
          {
            type: "subshell",
            statements: [
              { type: "bin", bin: "echo", args: ["123"] },
              { type: "op", op: "|" },
              { type: "bin", bin: "echo", args: ["234"] },
              { type: "op", op: "|" },
              {
                type: "subshell",
                statements: [
                  { type: "bin", bin: "echo", args: ["345"] },
                  { type: "op", op: "|" },
                  { type: "bin", bin: "echo", args: ["456"] },
                ],
              },
              { type: "op", op: "|" },
              { type: "bin", bin: "echo", args: ["567"] },
            ],
          },
          { type: "op", op: "|" },
          {
            type: "subshell",
            statements: [{ type: "bin", bin: "echo", args: ["678"] }],
          },
        ])
      ).toEqual({ _tag: "Right", right: null });
    });

    it("should return error when start with operators", () => {
      expect(
        sut.check([
          { type: "op", op: "||" },
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "&&" },
          { type: "bin", bin: "echo", args: ["234"] },
          { type: "op", op: ";" },
        ])
      ).toEqual({ _tag: "Left", left: "zsh: parse error near `||'" });
    });

    it("should return error when start with operators even inside subshell", () => {
      expect(
        sut.check([
          {
            type: "subshell",
            statements: [
              { type: "op", op: "||" },
              { type: "bin", bin: "echo", args: ["123"] },
              { type: "op", op: "&&" },
              { type: "bin", bin: "echo", args: ["234"] },
              { type: "op", op: ";" },
            ],
          },
        ])
      ).toEqual({ _tag: "Left", left: "zsh: parse error near `||'" });
    });

    it("should return error when found operators following each other", () => {
      expect(
        sut.check([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "||" },
          { type: "op", op: "&&" },
          { type: "bin", bin: "echo", args: ["234"] },
          { type: "op", op: ";" },
        ])
      ).toEqual({ _tag: "Left", left: "zsh: parse error near `&&'" });
    });

    it("should return error on first bin not found in binSet", () => {
      expect(
        sut.check([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: ";" },
          { type: "bin", bin: "unexistent", args: [] },
        ])
      ).toEqual({ _tag: "Left", left: "zsh: command not found: unexistent" });

      expect(
        sut.check([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: ";" },
          { type: "bin", bin: "unexistent", args: [] },
          { type: "op", op: ";" },
          { type: "bin", bin: "echo", args: ["234"] },
          { type: "op", op: ";" },
          { type: "bin", bin: "other_unexistent", args: [] },
        ])
      ).toEqual({ _tag: "Left", left: "zsh: command not found: unexistent" });
    });

    it("should return error when some env name contain wrong caracters", () => {
      expect(
        sut.check([{ type: "env", name: "aopa|name", value: "any_value" }])
      ).toEqual({
        _tag: "Left",
        left: "export: not valid in this context: aopa|name",
      });
      expect(
        sut.check([{ type: "env", name: "aopa/name", value: "any_value" }])
      ).toEqual({
        _tag: "Left",
        left: "export: not valid in this context: aopa/name",
      });
      expect(
        sut.check([{ type: "env", name: "aopa.name", value: "any_value" }])
      ).toEqual({
        _tag: "Left",
        left: "export: not valid in this context: aopa.name",
      });
    });
  });

  describe("Eval", () => {
    let sut: Shell;

    beforeEach(() => {
      const echoBin = new Bin("echo", (input: string[]) => {
        return input[0] === "should_fail"
          ? {
              code: 1,
              out: "wanted fail",
            }
          : {
              code: 0,
              out: `${input[0]}\n`,
            };
      });
      const binSet = new BinSet([echoBin]);
      sut = new Shell(new Environment(), binSet);
    });

    it("should process a bin call", () => {
      expect(sut.eval([{ type: "bin", bin: "echo", args: ["123"] }])).toEqual({
        type: "eval_resp",
        out: "123\n",
        code: 0,
      });
    });

    it("should eval args before bin call", () => {
      sut.envs.change("HOME", "/home/user");
      expect(sut.eval([{ type: "bin", bin: "echo", args: ["$HOME"] }])).toEqual(
        {
          type: "eval_resp",
          out: "/home/user\n",
          code: 0,
        }
      );
      expect(
        sut.eval([{ type: "bin", bin: "echo", args: ["$HOME/sub/folder"] }])
      ).toEqual({
        type: "eval_resp",
        out: "/home/user/sub/folder\n",
        code: 0,
      });
    });

    it("should include var to environment", () => {
      expect(sut.envs.contains("any_name")).toBeFalsy();
      sut.eval([{ type: "var", name: "any_name", value: "any_value" }]);
      expect(sut.envs.contains("any_name")).toBeTruthy();
    });

    it("should eval the value before include var to environment", () => {
      sut.eval([{ type: "var", name: "any", value: "any_value" }]);
      expect(sut.envs.contains("foo")).toBeFalsy();
      sut.eval([{ type: "var", name: "foo", value: "$any" }]);
      expect(sut.envs.contains("foo")).toBeTruthy();
      expect(sut.envs.getEnv("foo")).toBe("any_value");
    });

    it("should include env (export) to environment", () => {
      expect(sut.envs.contains("any_name")).toBeFalsy();
      sut.eval([{ type: "env", name: "any_name", value: "any_value" }]);
      expect(sut.envs.contains("any_name")).toBeTruthy();
    });

    it("should eval the value before include env to environment", () => {
      sut.eval([{ type: "env", name: "any", value: "any_value" }]);
      expect(sut.envs.contains("foo")).toBeFalsy();
      sut.eval([{ type: "env", name: "foo", value: "$any" }]);
      expect(sut.envs.contains("foo")).toBeTruthy();
      expect(sut.envs.getEnv("foo")).toBe("any_value");
    });

    it("should eval expressions around ; operator", () => {
      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: ";" },
          { type: "bin", bin: "echo", args: ["234"] },
        ])
      ).toEqual({
        type: "eval_resp",
        code: 0,
        out: "123\n234\n",
      });

      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: ";" },
        ])
      ).toEqual({
        type: "eval_resp",
        code: 0,
        out: "123\n",
      });
    });

    it("should eval expressions around && operator", () => {
      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "&&" },
          { type: "bin", bin: "echo", args: ["234"] },
        ])
      ).toEqual({
        type: "eval_resp",
        code: 0,
        out: "123\n234\n",
      });
    });

    it("should eval expressions around || operator", () => {
      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "||" },
          { type: "bin", bin: "echo", args: ["234"] },
        ])
      ).toEqual({
        type: "eval_resp",
        code: 0,
        out: "123\n",
      });
    });

    it("should eval expressions around | operator", () => {
      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "|" },
          { type: "bin", bin: "echo", args: [] },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n\n" });
      // in normal shell this don't return this result, but for simplifity and design limitations it could work like this
    });

    it("should eval subshell", () => {
      expect(
        sut.eval([
          {
            type: "subshell",
            statements: [{ type: "bin", bin: "echo", args: ["123"] }],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n" });
    });

    it("should eval subshell with operators in statements", () => {
      expect(
        sut.eval([
          {
            type: "subshell",
            statements: [
              { type: "bin", bin: "echo", args: ["123"] },
              { type: "op", op: "||" },
              { type: "bin", bin: "echo", args: ["234"] },
            ],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n" });
    });

    it("should eval subshell after a operator", () => {
      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "||" },
          {
            type: "subshell",
            statements: [
              { type: "bin", bin: "echo", args: ["234"] },
              { type: "op", op: "&&" },
              { type: "bin", bin: "echo", args: ["345"] },
            ],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n" });

      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "&&" },
          {
            type: "subshell",
            statements: [
              { type: "bin", bin: "echo", args: ["234"] },
              { type: "op", op: "||" },
              { type: "bin", bin: "echo", args: ["345"] },
            ],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n234\n" });

      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "|" },
          {
            type: "subshell",
            statements: [{ type: "bin", bin: "echo", args: [] }],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n\n" });

      expect(
        sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: ";" },
          {
            type: "subshell",
            statements: [{ type: "bin", bin: "echo", args: ["234"] }],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n234\n" });
    });
  });

  describe("Exec", () => {
    let sut: Shell;

    beforeEach(() => {
      const echoBin = new Bin("echo", (input: string[]) => {
        return input[0] === "should_fail"
          ? {
              code: 1,
              out: "wanted fail",
            }
          : {
              code: 0,
              out: `${input[0]}\n`,
            };
      });
      const binSet = new BinSet([echoBin]);
      sut = new Shell(new Environment(), binSet);
    });

    it("should exec an input", () => {
      expect(sut.exec("echo 123; echo 234")).toEqual({
        code: 0,
        input: "echo 123; echo 234",
        output: "123\n234\n",
      });

      expect(sut.exec("echo 123; (echo 234)")).toEqual({
        code: 0,
        input: "echo 123; (echo 234)",
        output: "123\n234\n",
      });

      expect(sut.exec("echo 123; (echo 234)")).toEqual({
        code: 0,
        input: "echo 123; (echo 234)",
        output: "123\n234\n",
      });

      expect(sut.exec("echo 123 || (echo 234)")).toEqual({
        code: 0,
        input: "echo 123 || (echo 234)",
        output: "123\n",
      });
    });
  });
});
