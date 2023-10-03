type BinResponse = {
  code: number;
  data: string;
};

class Bin {
  constructor(
    public name: string,
    public exec: (input: string) => BinResponse
  ) {}
}

class BinSet {
  constructor(public bins: Bin[]) {}

  contains(name: string): Bin | undefined {
    return this.bins.find((a) => (a.name === name ? a : undefined));
  }
}

export type { BinResponse };
export { Bin, BinSet };
