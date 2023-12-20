import { isLeft } from "fp-ts/lib/Either";
import { BinResponse, Bin } from "../../domain/binaries";
import { MemoryFileSystem } from "../../domain/file-system";

class CatBin implements Bin {
  public name: string = "cat";
  exec(input: string[], fileSystem: MemoryFileSystem): BinResponse {
    let path = input[0];
    if (!path) path = ".";

    let op = fileSystem.findFile(path);
    if (isLeft(op)) return {
      code: 1,
      out: `"cat": ${op.left}`,
    }

    let file = op.right;
    return {
      code: 0,
      out: file.body || "",
    }
  }
}

export { CatBin };
