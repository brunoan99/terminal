import { isLeft } from "../../../utils/effect-helper";
import type { Bin, BinResponse } from "../../domain/binaries";
import type { MemoryFileSystem } from "../../domain/file-system";
import { Either } from "effect";

class CatBin implements Bin {
  public name: string = "cat";
  async exec(
    input: string[],
    fileSystem: MemoryFileSystem
  ): Promise<BinResponse> {
    let path = input[0];
    if (!path) path = ".";

    let op = await fileSystem.find(path);

    Either.mapBoth(op, {
      onLeft: (left) => { },
      onRight: (right) => { },
    })

    if (isLeft(op))
      return {
        code: 1,
        out: `"cat": ${op.left}`,
      };
    if (op.right.type == "folder")
      return {
        code: 1,
        out: `"cat": ${path}: Is a directory`,
      };
    let file = op.right;
    return {
      code: 0,
      out: file.body || "",
    };
  }
}

export { CatBin };
