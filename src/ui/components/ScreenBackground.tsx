import { PropsWithChildren } from "react";

const ScreenBackground = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex justify-center items-center min-w-[100vw] max-w-[100%] min-h-[100vh] max-h-[100%]
    bg-gradient-to-bl from-brightRed via-brightYellow to-brightCyan">
      {children}
    </div >
  );
};

export { ScreenBackground };
