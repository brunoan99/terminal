import { MemoryFileSystem } from "./file-system";

type BinResponse = {
  code: number;
  out: string;
};

interface Bin {
  name: string;
  exec(input: string[], fileSystem: MemoryFileSystem): Promise<BinResponse>;
}

type BinSet = { [key: string]: Bin };

class Binaries {
  public binSet: BinSet = {};

  insert(bin: Bin) {
    this.binSet[bin.name] = bin;
  }

  contains(name: string): boolean {
    return this.binSet[name] !== undefined;
  }

  getBin(name: string): Bin | undefined {
    return this.binSet[name];
  }
}

export type { BinResponse, Bin, BinSet };
export { Binaries };
