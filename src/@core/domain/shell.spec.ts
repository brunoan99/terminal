import { BinSet } from "./binaries";
import { EnvSet, VarSet } from "./environment";
import { Operator, Shell } from "./shell";

describe("Shell", () => {
  describe("Split Expressions", () => {
    let sut: Shell;

    beforeAll(() => {
      sut = new Shell(new EnvSet([]), new VarSet([]), new BinSet([]));
    });

    it("shouldn't return something on empty string", () => {
      expect(sut.split_expression("")).toEqual([]);
    });

    it("should split a statement in one item on array", () => {
      expect(sut.split_expression("echo 123")).toEqual(["echo 123"]);
    });

    it("should split a statement and op", () => {
      expect(sut.split_expression("echo 123;")).toEqual(["echo 123", ";"]);

      expect(sut.split_expression("echo 123 ||")).toEqual(["echo 123", "||"]);

      expect(sut.split_expression("echo 123 |")).toEqual(["echo 123", "|"]);

      expect(sut.split_expression("echo 123 &&")).toEqual(["echo 123", "&&"]);

      expect(sut.split_expression("echo 123 && echo 234")).toEqual([
        "echo 123",
        "&&",
        "echo 234",
      ]);

      expect(sut.split_expression("echo 123 || echo 234")).toEqual([
        "echo 123",
        "||",
        "echo 234",
      ]);
    });

    it("should split a subshell", () => {
      expect(sut.split_expression("echo 123; (echo 234)")).toEqual([
        "echo 123",
        ";",
        ["echo 234"],
      ]);

      expect(sut.split_expression("echo 123; (echo 234) || echo 345")).toEqual([
        "echo 123",
        ";",
        ["echo 234"],
        "||",
        "echo 345",
      ]);

      expect(
        sut.split_expression("echo 123; (echo 234 && echo 456) || echo 345")
      ).toEqual([
        "echo 123",
        ";",
        ["echo 234", "&&", "echo 456"],
        "||",
        "echo 345",
      ]);

      expect(
        sut.split_expression(
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
        sut.split_expression("(echo 123; echo 234; ( echo 345; echo 456))")
      ).toEqual([
        ["echo 123", ";", "echo 234", ";", ["echo 345", ";", "echo 456"]],
      ]);

      expect(
        sut.split_expression(
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
        sut.split_expression(
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
      expect(sut.parse([";", "|", "||", "&&"])).toEqual([
        Operator.Semicolon,
        Operator.Pipe,
        Operator.Or,
        Operator.And,
      ]);
    });

    it("should parse a Statement", () => {
      expect(
        sut.parse(["echo 123", ";", "cd ~", ";", "echo $PWD", "|", "jq"])
      ).toEqual([
        {
          type: "bin",
          bin: "echo",
          args: ["123"],
        },
        Operator.Semicolon,
        {
          type: "bin",
          bin: "cd",
          args: ["~"],
        },
        Operator.Semicolon,
        {
          type: "bin",
          bin: "echo",
          args: ["$PWD"],
        },
        Operator.Pipe,
        {
          type: "bin",
          bin: "jq",
          args: [],
        },
      ]);
    });

    it("should parse a Var Addition", () => {
      expect(sut.parse(["var=variable", ";", "echo $var"])).toEqual([
        {
          type: "var",
          name: "var",
          value: "variable",
        },
        Operator.Semicolon,
        {
          type: "bin",
          bin: "echo",
          args: ["$var"],
        },
      ]);
    });

    it("should parse a Env Addition", () => {
      expect(sut.parse(["export VAR=variable", ";", "echo $VAR"])).toEqual([
        {
          type: "env",
          name: "VAR",
          value: "variable",
        },
        Operator.Semicolon,
        {
          type: "bin",
          bin: "echo",
          args: ["$VAR"],
        },
      ]);
    });

    it("should parse a Subshell", () => {
      expect(
        sut.parse(["echo 123", ";", ["echo 234", "||", "echo 345"]])
      ).toEqual([
        {
          type: "bin",
          bin: "echo",
          args: ["123"],
        },
        Operator.Semicolon,
        {
          statements: [
            {
              type: "bin",
              bin: "echo",
              args: ["234"],
            },
            Operator.Or,
            {
              type: "bin",
              bin: "echo",
              args: ["345"],
            },
          ],
        },
      ]);
    });
  });
});
