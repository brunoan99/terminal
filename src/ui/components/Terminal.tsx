"use client";

import "../styles/Terminal.css";
import { ShellOp } from "@domain";
import { ShellContext } from "../contexts/shell-provider";
import { useContext } from "react";
import Script from "next/script";
import Image from "next/image";

const PathLine = ({ path }: { path: string }) => {
  let splited = path.split("/")
  let slice = splited.slice(Math.max(splited.length - 4, 0));
  let rpath = slice.join("/");
  return (
    <span className="no_scroll_bar text-[16.7px] text-[#8BE9FD]">{rpath}</span>
  )
}

const InputLabel = ({ input }: { input: string }) => (
  <div className="no_scroll-bar flex-row flex-wrap text-white break-words text-wrap">
    <span className="no_scroll_bar text-[16.7px] text-bright-green">λ{' '}</span>
    <span className="no_scroll_bar text-[16.7px] text-bright-white">{input}</span>
  </div>
);

const OutputResult = ({ result }: { result: string }) => (
  <div className="no_scroll_bar break-words text-[16.7px] text-bright-white">
    <span className="no_scroll_bar text-zinc-100 block w-[120ch] text-wrap">{result}</span>
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
    <span className="no_scroll_bar text-[16.7px] text-bright-red">λ&nbsp;</span>
  ) : (
    <span className="no_scroll_bar text-[16.7px] text-bright-green
    ">λ&nbsp;</span>
  );

const OnInput = (elem: HTMLElement) => {
  elem.style.height = "0";
  elem.style.height = (elem.scrollHeight) + "px";
}

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
        className="no_scroll_bar text-[16.7px] text-bright-white bg-[rgba(0,0,0,0)] grow outline-hidden flex-wrap break-words resize-none"
        value={value}
        onInput={(e) => OnInput(e.target as HTMLElement)}
        onChange={(e) => handleValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code == "Tab") e.preventDefault();
          if (["Enter", "NumpadEnter"].includes(e.code)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
    </div>
  </div>
);

const Tab = () => {
  return (
    <div className="w-[240px] h-[30px] bg-background flex flex-row rounded-t-[10px] font-sans">
      <Image src="/assets/images/icon/ubuntu-logo-vector.svg" alt="linux icon" width={20} height={20} className="h-[20px] mt-[5px] ml-[8px] mb-[5px] mr-[10px]" />
      <span className="self-center text-center text-tab-title-color text-[14px] pt-[2px]">Ubuntu</span>
    </div>

  )
}

const TabLine = () => {
  return (
    <div className="w-full h-[38px] bg-tab-background-color-opacity rounded-t-[10px]">
      <div className="pt-[8px] pl-[8px]">
        <Tab />
      </div>
      <div></div>
    </div>
  )
}

const Terminal = () => {
  const { ops, path, buffer, processing, setBuffer, exec } = useContext(ShellContext);

  return (
    <div id="terminal" className="no_scroll_bar flex flex-col w-[1235px] h-[748px]  border-[#c9bcbf20] border-[1px]  whitespace-pre select-auto"
      onContextMenu={(e) => e.preventDefault()}
    >
      <TabLine />
      <div id="inner" className="no_scroll_bar p-[8px] bg-background leading-[1.4] h-[710px] overflow-y-scroll rounded-b-[10px] shadow-background shadow-2xl">
        <OutputLines
          outputs={ops}
        />
        {processing
          ? <div>
            <PathLine path={path} />
            <InputLabel input={buffer} />
          </div>
          : <InputLine
            path={path}
            value={buffer}
            handleValueChange={setBuffer}
            handleSubmit={exec}
          />}
      </div>
    </div>
  );
};

export { Terminal };
