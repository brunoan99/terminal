"use client";

import "public/assets/css/Terminal.css";
import { Op } from "../@core/domain/operation";
import { Term } from "@domain";
import { useState } from "react";

const OutputResult = ({ result }: { result: string }) => (
  <span className="text-zinc-100">{result}</span>
);

const InputLabel = ({ input }: { input: string }) => (
  <div className="flex flex-row flex-wrap text-white">
    <span className="text-[16px] text-[#50FA7B]">λ&nbsp;</span>
    <span>{input}</span>
  </div>
);

const OutputLines = ({ outputs }: { outputs: Array<Op> }) =>
  outputs.map((o: Op, index: number) => (
    <div key={index}>
      <PathLine path={o.path} />
      <InputLabel input={o.input} />
      <OutputResult result={o.output} />
    </div>
  ));

const PathLine = ({ path }: { path: string }) => (
  <span className="text-[16px] text-[#8BE9FD]">{path}</span>
);

const Symbol = ({ failed }: { failed?: boolean }) =>
  failed ? (
    <span className="text-[16px] text-[#FF5555]">λ&nbsp;</span>
  ) : (
    <span className="text-[16px] text-[#50FA7B]">λ&nbsp;</span>
  );

const BufferField = ({
  value,
  handleValueChange,
}: {
  value: string;
  handleValueChange: (value: string) => void;
}) => (
  <input
    className="bg-[#282A36] text-white"
    value={'echo "test"'}
    onChange={(e) => {}}
  />
);

const InputLine = ({ path = "~" }: { path?: string }) => (
  <>
    <PathLine path={path} />
    <div>
      <Symbol />
      <BufferField
        value={'echo "test"'}
        handleValueChange={(value: string) => {}}
      />
    </div>
  </>
);

const Terminal = () => {
  const operations = [
    {
      path: "~/workspace/js/blog",
      input: "git l 10",
      output:
        "fatal: not a git repository (or any of the parent directories): .git",
      code: 1,
    },
    {
      path: "~/workspace/js/blog",
      input: 'echo "test"',
      output: "test",
      code: 0,
    },
  ];
  const [term, setTerm] = useState<Term>({
    actual_path: "~",
    ops: operations,
    buffer: "",
  });

  return (
    <div className="terminal flex flex-col p-[10px] w-[805px] h-[604px] bg-[#282A36] opacity-[0.98] border-[#D6345B] border-[2.5px] font-mono">
      <OutputLines outputs={operations} />
      <InputLine path={term.actual_path} />
    </div>
  );
};

export { Terminal };
