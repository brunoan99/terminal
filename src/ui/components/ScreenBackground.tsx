import { PropsWithChildren } from "react";

const ScreenBackground = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex justify-center items-center min-w-[100vw] max-w-[100%] min-h-[100vh] max-h-[100%] bg-[url('/assets/images/Cyberpunk-Girl.png')] bg-center bg-no-repeat bg-contain">
      {children}
    </div>
  );
};

export { ScreenBackground };
