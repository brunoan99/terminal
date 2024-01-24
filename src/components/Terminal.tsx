"use client";

import "@public/assets/css/Terminal.css";
import { ShellOp } from "../@core/domain/shell";
import { ShellContext } from "../contexts/shell-provider";
import { useContext } from "react";
import Script from "next/script";

const PathLine = ({ path }: { path: string }) => (
  <span className="text-[16px] text-[#8BE9FD]">{path}</span>
);

const InputLabel = ({ input }: { input: string }) => (
  <div className="flex flex-row flex-wrap text-white">
    <span className="text-[16px] text-[#50FA7B]">λ{' '}</span>
    <span>{input}</span>
  </div>
);

const OutputResult = ({ result }: { result: string }) => (
  <div className="overflow-x-hidden break-words text-[16px]">
    <span className="text-zinc-100 block w-[80ch]">{result}</span>
  </div>
);

const OutputLines = ({ outputs }: { outputs: Array<ShellOp> }) =>
  outputs.map((o: ShellOp, index: number) => (
    <div key={index}>
      {o.path ? <PathLine path={o.path} /> : <></>}
      {o.input ? <InputLabel input={o.input} /> : <></>}
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
    <Script src="assets/scripts/textarea.js" />
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
          if (["Enter", "NumpadEnter"].includes(e.code)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
    </div>
  </div>
);

const Terminal = () => {
  const { ops, path, buffer, setBuffer, exec } = useContext(ShellContext);

  return (
    <div id="terminal" className="terminal flex flex-col p-[10px] w-[805px] h-[604px] bg-[#282A36] opacity-[0.98] border-[#D6345B] border-[2.5px] whitespace-pre overflow-y-scroll leading-relaxed select-auto"
      onContextMenu={(e) => e.preventDefault()}
    >
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
