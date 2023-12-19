import { isLeft } from "fp-ts/lib/Either";
import { Bin, BinResponse } from "@domain";
import { MemoryFileSystem } from "../../domain/file-system";

class TouchBin implements Bin {
  public name: string = "touch";
  exec(input: string[], fileSystem: MemoryFileSystem): BinResponse {
    let path = input[0];
    if (!path) return {
      code: 1,
      out: `"touch": missing file operand`
    };

    let op = fileSystem.createFile(path, "");
    if (isLeft(op)) return {
      code: 1,
      out: `"touch": ${op.left}`
    };

    return {
      code: 0,
      out: "",
    }
  }
}

export { TouchBin };
