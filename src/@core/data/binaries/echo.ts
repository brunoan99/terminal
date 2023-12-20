import { BinResponse, Bin } from "../../domain/binaries";
import { MemoryFileSystem } from "../../domain/file-system";

class EchoBin implements Bin {
  public name: string = "echo";
  exec(input: string[], fileSystem: MemoryFileSystem): BinResponse {
    let content = input.join(" ");

    return {
      code: 0,
      out: content || "\n",
    }
  }
}

export { EchoBin };
