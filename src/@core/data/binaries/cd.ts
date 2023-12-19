import { isLeft } from "fp-ts/lib/Either";
import { BinResponse, Bin } from "../../domain/binaries";
import { MemoryFileSystem } from "../../domain/file-system";

class CdBin implements Bin {
  public name: string = "cd";
  exec(input: string[], fileSystem: MemoryFileSystem): BinResponse {
    let path = input[0];
    if (!path) path = ".";

    let op = fileSystem.changeCurrentDirectory(path);
    if (isLeft(op)) return {
      code: 1,
      out: `"cd": ${op.left}`,
    }

    return {
      code: 0,
      out: "",
    }
  }
}

export { CdBin };
