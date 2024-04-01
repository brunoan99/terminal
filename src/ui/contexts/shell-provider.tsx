"use client"

import { createContext, useMemo, useState } from "react";
import { Shell, ShellOp } from "../../@core/domain/shell";
import { Environment } from "../../@core/domain/environment";
import { Binaries } from "../../@core/domain/binaries";
import { MemoryFileSystem, newFile } from "../../@core/domain/file-system";
import { LsBin } from "../../@core/data/binaries/ls";
import { CdBin } from "../../@core/data/binaries/cd";
import { CatBin } from "../../@core/data/binaries/cat";
import { EchoBin } from "../../@core/data/binaries/echo";
import { PwdBin } from "../../@core/data/binaries/pwd";
import { TouchBin } from "../../@core/data/binaries/touch";
import { MkdirBin } from "../../@core/data/binaries/mkdir";
import { GithubRepository } from "../../@core/infra/GithubRepository";
import { RmBin } from "../../@core/data/binaries/rm";

type ShellContextType = {
  ops: ShellOp[]
  path: string,
  buffer: string,
  setBuffer: (value: string) => void,
  processing: boolean,
  exec: () => Promise<void>,
}

const defaultContext: ShellContextType = {
  ops: [],
  path: "~",
  buffer: "",
  setBuffer: (value: string) => { },
  processing: false,
  exec: async () => { },
}

const ShellContext = createContext<ShellContextType>(defaultContext);

const environment = (): Environment => {
  let env = new Environment();

  return env;
}

const binaries = (): Binaries => {
  let bins = new Binaries();

  let ls_bin = new LsBin();
  bins.insert(ls_bin);

  let cat_bin = new CatBin();
  bins.insert(cat_bin);

  let cd_bin = new CdBin();
  bins.insert(cd_bin);

  let echo_bin = new EchoBin();
  bins.insert(echo_bin);

  let mkdir_bin = new MkdirBin();
  bins.insert(mkdir_bin);

  let pwd_bin = new PwdBin();
  bins.insert(pwd_bin);

  let rm_bin = new RmBin();
  bins.insert(rm_bin);

  let touch_bin = new TouchBin();
  bins.insert(touch_bin);

  return bins;
}

const memorySystem = (): MemoryFileSystem => {
  let ghRepo = new GithubRepository();
  let file_system = new MemoryFileSystem(ghRepo);

  file_system.create("/any/folder", undefined, true);
  file_system.create("/usr/bin", undefined, true);
  file_system.create("/any", newFile("aopa", undefined,"an example and only a example"));
  file_system.create("/any/folder", newFile("uepa"));
  file_system.create("/github", undefined, true);

  return file_system;
}

const ShellProvider = ({ children }: { children: React.ReactNode }) => {
  let env = environment();
  let bins = binaries();
  let file_system = useMemo(() => memorySystem(), []);
  let [ops] = useState<ShellOp[]>([]);
  let shell = new Shell(env, bins, file_system, ops)
  let [buffer, setBuffer] = useState<string>("");
  let [processing, setProcessing] = useState<boolean>(false);
  let path = file_system.currentPath;

  const exec = async () => {
    setProcessing(true);
    let input = buffer;
    if (!input || input == '\n') return;
    await shell.exec(input);
    setBuffer("");
    setProcessing(false);
  }


  return (
    <ShellContext.Provider
      value={{
        ops,
        path,
        buffer,
        processing,
        setBuffer,
        exec,
      }}
    >
      {children}
    </ShellContext.Provider>
  )
}

export type { ShellContextType };
export { ShellProvider, ShellContext }
