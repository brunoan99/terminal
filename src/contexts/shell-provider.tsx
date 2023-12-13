"use client"

import { createContext, useState } from "react";
import { Op } from "../@core/domain/operation";
import { Shell } from "../@core/domain/shell";
import { Environment } from "../@core/domain/environment";
import { Binaries } from "../@core/domain/binaries";
import { MemoryFileSystem } from "../@core/domain/file-system";
import { LsBin } from "../@core/data/binaries/ls";

type ShellContextType = {
  ops: Op[]
  path: string,
  buffer: string,
  setBuffer: (value: string) => void,
  exec: () => void,
}

const defaultContext: ShellContextType = {
  ops: [],
  path: "~",
  buffer: "",
  setBuffer: (value: string) => {},
  exec: () => {},
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

  return bins;
}

const memorySystem = (): MemoryFileSystem => {
  let file_system = new MemoryFileSystem();

  file_system.createDirectory("/any/folder", true);
  file_system.createFile("/any/aopa", "");
  file_system.createFile("/any/folder/uepa", "");
  file_system.createFile("aa", "");
  file_system.createFile("ab", "");
  file_system.createFile("ac", "");
  file_system.createFile("ad", "");
  file_system.createFile("ae", "");
  file_system.createFile("af", "");
  file_system.createFile("ag", "");
  file_system.createFile("ah", "");
  file_system.createFile("ai", "");
  file_system.createFile("aj", "");
  file_system.createFile("ak", "");
  file_system.createFile("al", "");
  file_system.createFile("am", "");
  file_system.createFile("an", "");
  file_system.createFile("ao", "");
  file_system.createFile("ap", "");
  file_system.createFile("aq", "");
  file_system.createFile("ar", "");
  file_system.createFile("as", "");
  file_system.createFile("at", "");
  file_system.createFile("au", "");
  file_system.createFile("av", "");
  file_system.createFile("ax", "");
  file_system.createFile("ay", "");
  file_system.createFile("aw", "");
  file_system.createFile("az", "");
  file_system.createFile("a", "");
  file_system.createFile("b", "");
  file_system.createFile("c", "");
  file_system.createFile("d", "");
  file_system.createFile("e", "");
  file_system.createFile("f", "");
  file_system.createFile("g", "");
  file_system.createFile("h", "");
  file_system.createFile("i", "");
  file_system.createFile("j", "");
  file_system.createFile("k", "");
  file_system.createFile("l", "");
  file_system.createFile("m", "");
  file_system.createFile("n", "");
  file_system.createFile("o", "");
  file_system.createFile("p", "");
  file_system.createFile("q", "");
  file_system.createFile("r", "");
  file_system.createFile("s", "");
  file_system.createFile("t", "");
  file_system.createFile("u", "");
  file_system.createFile("v", "");
  file_system.createFile("x", "");
  file_system.createFile("y", "");
  file_system.createFile("w", "");
  file_system.createFile("z", "");

  file_system.changeCurrentDirectory("/any");

  return file_system;
}

const ShellProvider = ({children}: {children: React.ReactNode}) => {
  let env = environment();
  let bins = binaries();
  let file_system = memorySystem();
  let shell = new Shell(env, bins, file_system)
  let [ops, setOps] = useState<Op[]>([]);
  let [buffer, setBuffer] = useState<string>("");

  const exec = () => {
    let input = buffer;
    let path = file_system.currentPath;
    setBuffer("");
    let shellOp = shell.exec(input);
    let op = {
      path,
      ...shellOp,
    }
    console.log("Result: ", op);
    setOps([...ops, op]);
  }

  return (
    <ShellContext.Provider
      value={{
        ops,
        path: file_system.currentPath,
        buffer,
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
