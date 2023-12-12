"use client"

import { createContext, useState } from "react";
import { Op } from "../@core/domain/operation";
import { Shell } from "../@core/domain/shell";
import { Environment } from "../@core/domain/environment";
import { BinSet } from "../@core/domain/binaries";
import { MemoryFileSystem } from "../@core/domain/file-system";

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

const ShellProvider = ({children}: {children: React.ReactNode}) => {
  let env = new Environment();
  let bins = new BinSet([]);
  let file_system = new MemoryFileSystem();
  let shell = new Shell(env, bins, file_system)
  let [ops, setOps] = useState<Op[]>([]);
  let [buffer, setBuffer] = useState<string>("");

  return (
    <ShellContext.Provider
      value={{
        ops,
        path: file_system.currentPath,
        buffer,
        setBuffer,
        exec: () => {console.log("I'm envoked")},
      }}
    >
      {children}
    </ShellContext.Provider>
  )
}

export type { ShellContextType };
export { ShellProvider, ShellContext }
