"use client";

import "public/assets/css/Terminal.css";
import { Op } from "../@core/domain/operation";
import { ShellContext } from "../contexts/shell-provider";
import { useContext } from "react";
import Script from "next/script";

const PathLine = ({ path }: { path: string }) => (
  <span className="text-[16px] text-[#8BE9FD]">{path.padEnd(80, " ")}</span>
);

const InputLabel = ({ input }: { input: string }) => (
  <div className="flex flex-row flex-wrap text-white">
    <span className="text-[16px] text-[#50FA7B]">λ{' '}</span>
    <span>{input.padEnd(78)}</span>
  </div>
);

const OutputResult = ({ result }: { result: string }) => (
  <div className="overflow-hidden break-words">
    <span className="text-zinc-100 block w-[80ch]">
      {result
        .split("\n")
        .map((line) => line.padEnd(80))
        .join("\n")}
    </span>
    <span className="text-zinc-100 block w-[80ch]">{' '.padEnd(80, " ")}</span>
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


const Symbol = ({ failed }: { failed?: boolean }) =>
  failed ? (
    <span className="text-[16px] text-[#FF5555]">λ&nbsp;</span>
  ) : (
    <span className="text-[16px] text-[#50FA7B]">λ&nbsp;</span>
  );


const InputLine = ({ path = "~", value = "", handleValueChange, handleSubmit }: { path?: string, value?: string, handleValueChange: (value: string) => void, handleSubmit: () => void }) => (
  <div>
    <Script src="assets/scripts/textarea.js"/>
    <PathLine path={path} />
    <div className="w-max-[100%] flex">
      <Symbol />
      <textarea
        autoFocus
        id="text-area-buffer"
        rows={1}
        cols={75}
        className="bg-[#282A36] text-white grow outline-none flex-wrap break-words resize-none"
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === "Enter") {
            e.preventDefault()
            handleSubmit()
          } } }
      />
    </div>
  </div>
);

const Terminal = () => {
  const { ops, path, buffer, setBuffer, exec } = useContext(ShellContext);

  return (
    <div className="terminal flex flex-col p-[10px] w-[805px] h-[604px] bg-[#282A36] opacity-[0.98] border-[#D6345B] border-[2.5px] font-mono whitespace-pre overflow-y-hidden">
      <OutputLines
        outputs={ops}
      />
      <InputLine
        path={path}
        value={buffer}
        handleValueChange={setBuffer}
        handleSubmit={exec}
      />
    </div>
  );
};

export { Terminal };
