import { isLeft } from "fp-ts/lib/Either";
import { Bin, BinResponse } from "@domain";
import { MemoryFileSystem, newFile } from "../../domain/file-system";

class TouchBin implements Bin {
  public name: string = "touch";

  async exec(
    input: string[],
    fileSystem: MemoryFileSystem
  ): Promise<BinResponse> {
    let path = input[0];
    if (!path)
      return {
        code: 1,
        out: `"touch": missing file operand`,
      };

    let abs_path = fileSystem.getAbsolutePath(path);
    let splited = abs_path.split("/").filter((p) => p !== "");
    let name = splited[splited.length - 1];
    let pathTo = `/${splited.slice(0, length - 1).join("/")}`;

    let op = await fileSystem.create(pathTo, newFile(name));
    if (isLeft(op))
      return {
        code: 1,
        out: `"touch": ${op.left}`,
      };

    return {
      code: 0,
      out: "",
    };
  }
}

export { TouchBin };
