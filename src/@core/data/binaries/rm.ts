import { isLeft } from "fp-ts/lib/Either";
import { Bin, BinResponse } from "../../domain/binaries";
import { MemoryFileSystem } from "../../domain/file-system";

class RmBin implements Bin {
  public name: string = "rm";

  public async exec(
    input: string[],
    fileSystem: MemoryFileSystem
  ): Promise<BinResponse> {
    let options = input.filter(
      (value) => value.startsWith("-") || value.startsWith("--")
    );
    let validOptions = ["-d", "--dir", "-r", "-R", "--recursive"];
    for (const op of options) {
      if (!validOptions.includes(op)) {
        return {
          code: 1,
          out: `"rm": unrecognized option '${op}'`,
        };
      }
    }
    let dir = options.includes("-d") || options.includes("--dir");
    let recursive =
      options.includes("-r") ||
      options.includes("-R") ||
      options.includes("--recursive");
    let path = input.filter(
      (value) => !(value.startsWith("-") || value.startsWith("--"))
    )[0];
    if (!path)
      return {
        code: 1,
        out: `"rm": missing operand`,
      };

    let op = await fileSystem.remove(path, recursive, dir);
    if (isLeft(op))
      return {
        code: 1,
        out: `"rm": ${op.left}`,
      };

    return {
      code: 0,
      out: "",
    };
  }
}

export { RmBin };
