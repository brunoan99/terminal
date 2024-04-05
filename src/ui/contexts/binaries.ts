import { Binaries } from "@domain";
import {
  CatBin,
  CdBin,
  EchoBin,
  LsBin,
  MkdirBin,
  PwdBin,
  RmBin,
  TouchBin,
} from "@data";

export const createBinaries = (): Binaries => {
  let bins = new Binaries();

  let cat_bin = new CatBin();
  bins.insert(cat_bin);

  let cd_bin = new CdBin();
  bins.insert(cd_bin);

  let echo_bin = new EchoBin();
  bins.insert(echo_bin);

  let ls_bin = new LsBin();
  bins.insert(ls_bin);

  let mkdir_bin = new MkdirBin();
  bins.insert(mkdir_bin);

  let pwd_bin = new PwdBin();
  bins.insert(pwd_bin);

  let rm_bin = new RmBin();
  bins.insert(rm_bin);

  let touch_bin = new TouchBin();
  bins.insert(touch_bin);

  return bins;
};
