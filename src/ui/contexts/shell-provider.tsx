"use client"

import { createContext, useEffect, useMemo, useState } from "react";

import { Shell, ShellOp } from "@domain";
import { createMemorySystem } from "./memory-system";
import { createBinaries } from "./binaries";
import { createEnvironment } from "./environment";

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

const ShellProvider = ({ children }: { children: React.ReactNode }) => {
  let env = useMemo(() => createEnvironment(), []);
  let bins = createBinaries();
  let file_system = useMemo(() => createMemorySystem(), []);
  let ops = useMemo(() => [{
    path: "/",
    code: 0,
    input: "cat info.txt",
    output: `This project offers a terminal flow experience into navigate through Github

To navigate to a Github profile just use 'cd github/{user}' or to a repository
use 'cd github/{user}/{repo};

The following commands will work as like in a shell:
  - cat:    Concatenate FILE(s) to standard output;
  - cd:     Change working directory;
  - echo:   Display a line of text;
  - ls:     List information about the FILEs (the current directory by default);
  - mkdir:  Create the DIRECTORY(ies), if they do not already exist;
  - pwd:    Print the full filename of the current working directory;
  - rm:     Remove the FILE(s);
  - touch:  A FILE argument that does not exist is created empty.`,
  } as ShellOp], []);

  let path = file_system.currentPath;
  let shell = new Shell(env, bins, file_system, ops)
  let [buffer, setBuffer] = useState<string>("");
  let [processing, setProcessing] = useState<boolean>(false);


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
