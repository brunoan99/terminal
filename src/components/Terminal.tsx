"use client";

import "public/assets/css/Terminal.css";
import { Op } from "../@core/domain/operation";
import { ShellContext } from "../contexts/shell-provider";
import { useContext } from "react";
import Script from "next/script";

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


const InputLine = ({ path = "~", value = "", handleValueChange, handleSubmit }: { path?: string, value?: string, handleValueChange: (value: string) => void, handleSubmit: () => void }) => (
  <>
    <Script src="assets/scripts/textarea.js"/>

    <PathLine path={path} />
    <div className="w-max-[100%] flex">
      <Symbol />
      <textarea
        id="text-area-buffer"
        cols={75}
        className="bg-[#282A36] text-white grow outline-none flex-wrap break-words resize-none"
        value={value}

        onChange={(e) => handleValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === "Enter") {
            handleSubmit()
          }
        } }
      />
    </div>
  </>
);

const Terminal = () => {
  const { ops, path, buffer, setBuffer, exec } = useContext(ShellContext);

  return (
      <div className="terminal flex flex-col p-[10px] w-[805px] h-[604px] bg-[#282A36] opacity-[0.98] border-[#D6345B] border-[2.5px] font-mono">
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
