import { isLeft } from "fp-ts/lib/Either";
import { Bin, BinResponse } from "@domain";
import { MemoryFileSystem } from "../../domain/file-system";

class MkdirBin implements Bin {
  public name: string = "mkdir";
  exec(input: string[], fileSystem: MemoryFileSystem): BinResponse {
    let options = input.filter((value) => value.startsWith('-') || value.startsWith('--'))
    let validOptions = ["-p", "--parents"];
    for (const op of options) {
      if (!validOptions.includes(op)) {
        return {
          code: 1,
          out: `"mkdir": unrecognized option '${op}'`
        }
      }
    }
    let parents = options.includes("-p") || options.includes("--parents");
    let path = input.filter((value) => !(value.startsWith('-') || value.startsWith('--')))[0];
    if (!path) return {
      code: 1,
      out: `"mkdir": missing file operand`
    };

    let op = fileSystem.createDirectory(path, parents);
    if (isLeft(op)) return {
      code: 1,
      out: `"mkdir": ${op.left}`
    };

    return {
      code: 0,
      out: "",
    }
  }
}

export { MkdirBin };
