import { PropsWithChildren } from "react";

const ScreenBackground = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex justify-center items-center min-w-[100vw] max-w-[100%] min-h-[100vh] max-h-[100%]
    bg-linear-to-bl from-bright-red via-bright-yellow to-bright-cyan">
      {children}
    </div >
  );
};

export { ScreenBackground };
