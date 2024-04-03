import Image from "next/image";

export const DesktopOnlyAdvice = () =>
<div className="h-[80vh] flex flex-col items-center content-center pt-[25vh]">
  <Image width={64} height={64} src="/assets/images/icon/android-chrome-512x512.png" alt={"terminal icon"} />
  <span className="m-[3vw]">
    Hi there! Thanks for visiting this page.
  </span>
  <span className="m-[3vw]">
    I regret to inform you that this feature is exclusively available on desktop and will not be accessible on mobile devices.
  </span>
  <span className="m-[3vw]">
    Thank you for your understanding!
  </span>
</div>
