import { BinSet } from "./binaries";
import { EnvSet, VarSet } from "./environment";
import { Shell } from "./shell";

const makeSut = () => {
  const sut = new Shell(new EnvSet([]), new VarSet([]), new BinSet([]));
  return {
    sut,
  };
};

describe("Shell", () => {
  describe.only("Split Expressions", () => {
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
      let out: Array<String | String[]>;

      out = sut.split_expression("echo 123;");
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
      let out: Array<String | String[]>;

      out = sut.split_expression("echo 123; (echo 234)");
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
});
