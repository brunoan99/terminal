import { FileSystem } from "./file-system";

type BinResponse = {
  code: number;
  out: string;
};

interface IBin {
  name: string;
  exec(input: string[], fileSystem: FileSystem): BinResponse;
}

class Bin implements IBin {
  constructor(
    public name: string,
    public exec: (input: string[], fileSystem: FileSystem) => BinResponse
  ) { }
}

class BinSet {
  constructor(public bins: IBin[]) { }

  contains(name: string): boolean {
    return this.bins.findIndex((a) => (a.name === name ? true : false)) >= 0;
  }

  getBin(name: string): Bin | undefined {
    return this.bins.find((a) => (a.name === name ? true : false));
  }
}

export type { BinResponse, IBin };
export { Bin, BinSet };
