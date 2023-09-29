type Bin = (input: string) => BinResponse;

type BinSet = { [key: string]: Bin };

type BinResponse = {
  code: number;
  data: string;
};

export type { Bin, BinSet, BinResponse };
