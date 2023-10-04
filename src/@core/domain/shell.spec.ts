import { Bin, BinSet } from "./binaries";
import { EnvSet, VarSet } from "./environment";
import { Operator, Shell } from "./shell";

describe("Shell", () => {
  describe("Split Expressions *Private*", () => {
    let sut: Shell;

    beforeAll(() => {
      sut = new Shell(new EnvSet([]), new VarSet([]), new BinSet([]));
    });

    it("shouldn't return something on empty string", () => {
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
      sut = new Shell(new EnvSet([]), new VarSet([]), new BinSet([]));
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
        data: "aopa",
      }));
      const binSet = new BinSet([echoBin]);
      sut = new Shell(new EnvSet([]), new VarSet([]), binSet);
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
  });
});
