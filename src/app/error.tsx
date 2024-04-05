"use client"

import Image from "next/image";

export default function Error() {
  return <>
    <div className="h-[80vh] flex flex-col items-center content-center pt-[25vh]">
      <Image className="pb-4" width={64} height={64} src="/assets/images/icon/android-chrome-512x512.png" alt={"terminal icon"} />
      <span className="ml-auto mr-auto pb-1">
        Hi there! Thanks for visiting this page.
      </span>
      <span className="ml-auto mr-auto pb-1">
        Something got wrong in server.
      </span>
      <span className="ml-auto mr-auto pb-1">
        Thank you for your understanding!
      </span>
    </div>
  </>
}
