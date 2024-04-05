import { isLeft } from "fp-ts/lib/Either";
import { Bin, BinResponse } from "@domain";
import { MemoryFileSystem, newFolder } from "../../domain/file-system";

class MkdirBin implements Bin {
  public name: string = "mkdir";
  async exec(
    input: string[],
    fileSystem: MemoryFileSystem
  ): Promise<BinResponse> {
    let options = input.filter(
      (value) => value.startsWith("-") || value.startsWith("--")
    );
    let validOptions = ["-p", "--parents"];
    for (const op of options) {
      if (!validOptions.includes(op)) {
        return {
          code: 1,
          out: `"mkdir": unrecognized option '${op}'`,
        };
      }
    }
    let parents = options.includes("-p") || options.includes("--parents");
    let path = input.filter(
      (value) => !(value.startsWith("-") || value.startsWith("--"))
    )[0];
    if (!path)
      return {
        code: 1,
        out: `"mkdir": missing file operand`,
      };

    let splited = path.split("/");
    let name = splited[splited.length - 1];
    let pathTo = splited.slice(0, splited.length - 2).join("/");
    let op = await fileSystem.create(pathTo, newFolder(name), parents);
    if (isLeft(op))
      return {
        code: 1,
        out: `"mkdir": ${op.left}`,
      };

    return {
      code: 0,
      out: "",
    };
  }
}

export { MkdirBin };
