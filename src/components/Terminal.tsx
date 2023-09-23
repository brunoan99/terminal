"use client";

import { useState } from "react";
import "public/assets/css/Terminal.css";

const PathLine = ({ path }: { path: string }) => (
  <span className="text-[16px] text-[#8BE9FD]">{path}</span>
);

const OutputResult = ({ result }: { result: string }) => (
  <span className="text-zinc-100">{result}</span>
);

const InputLabel = ({ input }: { input: string }) => (
  <div className="flex flex-row flex-wrap text-white">
    <span className="text-[16px] text-[#50FA7B]">λ&nbsp;</span>
    <span>{input}</span>
  </div>
);

const Input = ({ failed }: { failed?: boolean }) =>
  failed ? (
    <span className="text-[16px] text-[#FF5555]">λ</span>
  ) : (
    <span className="text-[16px] text-[#50FA7B]">λ</span>
  );

type Output = {
  path: string;
  input: string;
  output: string;
  lastFailed?: boolean;
};

const OutputLines = ({ outputs }: { outputs: Output[] }) =>
  outputs.map((o: Output, index: number) => (
    <div key={index}>
      <PathLine path={o.path} />
      <InputLabel input={o.input} />
      <OutputResult result={o.output} />
    </div>
  ));

const InputLine = ({ path = "~" }: { path?: string }) => (
  <>
    <PathLine path={path} />
    <Input />
  </>
);

const Terminal = () => {
  const [outputLines, setOutputLines] = useState<Output[]>([
    {
      path: "~/workspace/js/blog",
      input: "git l 10",
      output:
        "fatal: not a git repository (or any of the parent directories): .git",
    },
    {
      path: "~/workspace/js/blog",
      input: 'echo "test"',
      output: "test",
    },
  ]);

  return (
    <div className="terminal flex flex-col p-[10px] w-[805px] h-[604px] bg-[#282A36] opacity-[0.98] border-[#D6345B] border-[2.5px]">
      <OutputLines outputs={outputLines} />
      <InputLine />
    </div>
  );
};

export { Terminal };
