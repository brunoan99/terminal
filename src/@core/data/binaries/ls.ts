import { isLeft } from "fp-ts/lib/Either";
import { BinResponse, Bin } from "../../domain/binaries";
import { MemoryFileSystem } from "../../domain/file-system";

const CHAR_LIMIT_PER_LINE = 80;

class LsBin implements Bin {
  public name: string = "ls";

  public arrange_names_in_lines(names: string[], deep: number = 1): string[] {
    let lines: string[][] = [];
    for (let i = 0; i < deep; i++) {
      let line: string[] = [];
      for (let j = i; j <= names.length; j += deep) {
        if (j >= names.length) continue;
        line.push(names[j]);
      }
      lines.push(line);
    }

    let col_width: number[] = [];
    for (let col = 0; col < lines[0].length; col++) {
      let max = lines[0][0].length;
      for (let row = 0; row < lines.length; row++) {
        if (col >= lines[row].length) continue;
        if (lines[row][col].length > max) max = lines[row][col].length;
      }
      col_width.push(max);
    }

    let string_lines = lines.map((line) =>
      line.map((name, index) => name.padEnd(col_width[index], " ")).join("  ")
    );

    let breaks_char_limit = string_lines.some(
      (value) => value.length > CHAR_LIMIT_PER_LINE
    );

    if (breaks_char_limit) {
      return this.arrange_names_in_lines(names, deep + 1);
    }
    return string_lines;
  }

  public async exec(
    input: string[],
    fileSystem: MemoryFileSystem
  ): Promise<BinResponse> {
    /* options
      -1, --oneline           display one entry per line
      -l, --long              display extended file metadata as a table
      -a, --all               show hidden and 'dot' files. Use this twice to also show the '.' and '..' directories
    */
    let path = input.filter(
      (value) => !(value.startsWith("-") || value.startsWith("--"))
    )[0];
    if (!path) path = ".";
    let op = await fileSystem.listDirectoryContent(path);
    if (isLeft(op))
      return {
        code: 1,
        out: `"ls": ${op.left}`,
      };
    let contents = op.right;
    const names = contents.map((value) => value.name);

    let lines = this.arrange_names_in_lines(names);
    let out = lines.join("\n");

    return {
      code: 0,
      out: out,
    };
  }
}

export { LsBin };
