import { Bin, BinResponse } from "@domain";
import { MemoryFileSystem } from "../../domain/file-system";

class PwdBin implements Bin {
  public name: string = "pwd";
  async exec(
    input: string[],
    fileSystem: MemoryFileSystem
  ): Promise<BinResponse> {
    if (input.length > 0)
      return {
        code: 1,
        out: `"pwd": too many arguments`,
      };

    let work_dir = fileSystem.currentPath;

    return {
      code: 0,
      out: work_dir,
    };
  }
}

export { PwdBin };
