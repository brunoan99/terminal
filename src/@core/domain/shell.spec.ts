import { BinSet } from "./binaries";
import { EnvSet, VarSet } from "./environment";
import { Operator, Shell } from "./shell";

const makeSut = () => {
  const sut = new Shell(new EnvSet([]), new VarSet([]), new BinSet([]));
  return {
    sut,
  };
};

describe("Shell", () => {
  describe("Split Expressions", () => {
    it("should return a empty array to an empty string", () => {
      const { sut } = makeSut();
      const out = sut.split_expression("");
      expect(out).toEqual([]);
    });

    it("should split a statement in one item on array", () => {
      const { sut } = makeSut();
      const out = sut.split_expression("echo 123");
      expect(out).toEqual(["echo 123"]);
    });

    it("should split a statement and op", () => {
      const { sut } = makeSut();

      let out = sut.split_expression("echo 123;");
      expect(out).toEqual(["echo 123", ";"]);

      out = sut.split_expression("echo 123 ||");
      expect(out).toEqual(["echo 123", "||"]);

      out = sut.split_expression("echo 123 |");
      expect(out).toEqual(["echo 123", "|"]);

      out = sut.split_expression("echo 123 &&");
      expect(out).toEqual(["echo 123", "&&"]);

      out = sut.split_expression("echo 123 && echo 234");
      expect(out).toEqual(["echo 123", "&&", "echo 234"]);

      out = sut.split_expression("echo 123 || echo 234");
      expect(out).toEqual(["echo 123", "||", "echo 234"]);
    });

    it("should split a subshell in one item", () => {
      const { sut } = makeSut();

      let out = sut.split_expression("echo 123; (echo 234)");
      expect(out).toEqual(["echo 123", ";", ["echo 234"]]);

      out = sut.split_expression("echo 123; (echo 234) || echo 345");
      expect(out).toEqual(["echo 123", ";", ["echo 234"], "||", "echo 345"]);

      out = sut.split_expression(
        "echo 123; (echo 234 && echo 456) || echo 345"
      );
      expect(out).toEqual([
        "echo 123",
        ";",
        ["echo 234", "&&", "echo 456"],
        "||",
        "echo 345",
      ]);

      out = sut.split_expression(
        "echo 123; (echo 234 && echo 456) || (echo 567 || echo 678)"
      );
      expect(out).toEqual([
        "echo 123",
        ";",
        ["echo 234", "&&", "echo 456"],
        "||",
        ["echo 567", "||", "echo 678"],
      ]);

      out = sut.split_expression("(echo 123; echo 234; ( echo 345; echo 456))");
      expect(out).toEqual([
        ["echo 123", ";", "echo 234", ";", ["echo 345", ";", "echo 456"]],
      ]);

      out = sut.split_expression(
        "(echo 123; echo 234; ( echo 345; echo 456); echo 567)"
      );
      expect(out).toEqual([
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

      out = sut.split_expression(
        "(echo 123; echo 234; ( echo 345; echo 456 ); echo 567); (echo 678)"
      );
      expect(out).toEqual([
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
    it("should parse Operator", () => {
      const { sut } = makeSut();
      const out = sut.parse([";", "|", "||", "&&"]);
      const exp = [
        Operator.Semicolon,
        Operator.Pipe,
        Operator.Or,
        Operator.And,
      ];
      expect(out).toEqual(exp);
    });

    it("should parse a Statement", () => {
      const { sut } = makeSut();
      const out = sut.parse([
        "echo 123",
        ";",
        "cd ~",
        ";",
        "echo $PWD",
        "|",
        "jq",
      ]);
      const exp = [
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
      ];
      expect(out).toEqual(exp);
    });

    it("should parse a Var Addition", () => {
      const { sut } = makeSut();
      const out = sut.parse(["var=variable", ";", "echo $var"]);
      const exp = [
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
      ];
      expect(out).toEqual(exp);
    });

    it("should parse a Env Addition", () => {
      const { sut } = makeSut();
      const out = sut.parse(["export VAR=variable", ";", "echo $VAR"]);
      const exp = [
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
      ];
      expect(out).toEqual(exp);
    });

    it("should parse a Subshell", () => {
      const { sut } = makeSut();
      const out = sut.parse(["echo 123", ";", ["echo 234", "||", "echo 345"]]);
      const exp = [
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
      ];
      expect(out).toEqual(exp);
    });
  });
});
