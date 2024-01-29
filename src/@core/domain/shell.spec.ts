import { IGithubRepository } from "../infra/IGithubRepository";
import { Bin, BinResponse, Binaries } from "./binaries";
import { Environment } from "./environment";
import { MemoryFileSystem } from "./file-system";
import { Shell } from "./shell";

describe("Shell", () => {
  let sut: Shell;

  beforeAll(() => {
    const echoBin = {
      name: "echo",
      exec: async (
        input: string[],
        fileSystem: MemoryFileSystem
      ): Promise<BinResponse> =>
        await new Promise((resolve) =>
          resolve(
            input[0] === "should_fail"
              ? {
                  code: 1,
                  out: "wanted fail",
                }
              : {
                  code: 0,
                  out: `${input[0]}\n`,
                }
          )
        ),
    };
    const binaries = new Binaries();
    binaries.insert(echoBin);
    const ghRepo = {
      getUserInformation: jest.fn(),
      getUserRepositories: jest.fn(),
      getPathContent: jest.fn(),
      getFileRawContent: jest.fn(),
    } as jest.Mocked<IGithubRepository>;
    sut = new Shell(
      new Environment(),
      binaries,
      new MemoryFileSystem(ghRepo),
      []
    );
  });

  describe("Split Expressions *Private*", () => {
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
    it("should process a bin call", async () => {
      expect(
        await sut.eval([{ type: "bin", bin: "echo", args: ["123"] }])
      ).toEqual({
        type: "eval_resp",
        out: "123\n",
        code: 0,
      });
    });

    it("should eval args before bin call", async () => {
      sut.envs.change("HOME", "/home/user");
      expect(
        await sut.eval([{ type: "bin", bin: "echo", args: ["$HOME"] }])
      ).toEqual({
        type: "eval_resp",
        out: "/home/user\n",
        code: 0,
      });
      expect(
        await sut.eval([
          { type: "bin", bin: "echo", args: ["$HOME/sub/folder"] },
        ])
      ).toEqual({
        type: "eval_resp",
        out: "/home/user/sub/folder\n",
        code: 0,
      });
    });

    it("should include var to environment", async () => {
      expect(sut.envs.contains("a1")).toBeFalsy();
      await sut.eval([{ type: "var", name: "a1", value: "any_value" }]);
      expect(sut.envs.contains("a1")).toBeTruthy();
    });

    it("should eval the value before include var to environment", async () => {
      expect(sut.envs.contains("a2")).toBeFalsy();
      await sut.eval([{ type: "var", name: "a2", value: "any_value" }]);
      expect(sut.envs.contains("a3")).toBeFalsy();
      await sut.eval([{ type: "var", name: "a3", value: "$a2" }]);
      expect(sut.envs.contains("a3")).toBeTruthy();
      expect(sut.envs.getEnv("a3")).toBe("any_value");
    });

    it("should include env (export) to environment", async () => {
      expect(sut.envs.contains("a4")).toBeFalsy();
      await sut.eval([{ type: "env", name: "a4", value: "any_value" }]);
      expect(sut.envs.contains("a4")).toBeTruthy();
    });

    it("should eval the value before include env to environment", async () => {
      expect(sut.envs.contains("a5")).toBeFalsy();
      await sut.eval([{ type: "env", name: "a5", value: "any_value" }]);
      expect(sut.envs.contains("a5")).toBeTruthy();
      expect(sut.envs.contains("a6")).toBeFalsy();
      await sut.eval([{ type: "env", name: "a6", value: "$a5" }]);
      expect(sut.envs.contains("a6")).toBeTruthy();
      expect(sut.envs.getEnv("a6")).toBe("any_value");
    });

    it("should eval expressions around ; operator", async () => {
      expect(
        await sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: ";" },
          { type: "bin", bin: "echo", args: ["234"] },
        ])
      ).toEqual({
        type: "eval_resp",
        code: 0,
        out: "123\n\n234\n",
      });

      expect(
        await sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: ";" },
        ])
      ).toEqual({
        type: "eval_resp",
        code: 0,
        out: "123\n",
      });
    });

    it("should eval expressions around && operator", async () => {
      expect(
        await sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "&&" },
          { type: "bin", bin: "echo", args: ["234"] },
        ])
      ).toEqual({
        type: "eval_resp",
        code: 0,
        out: "123\n\n234\n",
      });
    });

    it("should eval expressions around || operator", async () => {
      expect(
        await sut.eval([
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

    it("should eval expressions around | operator", async () => {
      expect(
        await sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "|" },
          { type: "bin", bin: "echo", args: [] },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n\n" });
      // in normal shell this don't return this result, but for simplifity and design limitations it could work like this
    });

    it("should eval subshell", async () => {
      expect(
        await sut.eval([
          {
            type: "subshell",
            statements: [{ type: "bin", bin: "echo", args: ["123"] }],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n" });
    });

    it("should eval subshell with operators in statements", async () => {
      expect(
        await sut.eval([
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

    it("should eval subshell after a operator", async () => {
      expect(
        await sut.eval([
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
        await sut.eval([
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
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n\n234\n" });

      expect(
        await sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: "|" },
          {
            type: "subshell",
            statements: [{ type: "bin", bin: "echo", args: [] }],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n\n" });

      expect(
        await sut.eval([
          { type: "bin", bin: "echo", args: ["123"] },
          { type: "op", op: ";" },
          {
            type: "subshell",
            statements: [{ type: "bin", bin: "echo", args: ["234"] }],
          },
        ])
      ).toEqual({ type: "eval_resp", code: 0, out: "123\n\n234\n" });
    });
  });

  describe("Exec", () => {
    it("should exec an input", async () => {
      expect(await sut.exec("echo 123; echo 234")).toEqual({
        code: 0,
        path: "/",
        input: "echo 123; echo 234",
        output: "123\n\n234\n",
      });

      expect(await sut.exec("echo 123; (echo 234)")).toEqual({
        code: 0,
        path: "/",
        input: "echo 123; (echo 234)",
        output: "123\n\n234\n",
      });

      expect(await sut.exec("echo 123; (echo 234)")).toEqual({
        code: 0,
        path: "/",
        input: "echo 123; (echo 234)",
        output: "123\n\n234\n",
      });

      expect(await sut.exec("echo 123 || (echo 234)")).toEqual({
        code: 0,
        path: "/",
        input: "echo 123 || (echo 234)",
        output: "123\n",
      });
    });
  });
});
