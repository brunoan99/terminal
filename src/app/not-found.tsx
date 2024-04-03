import { MobilePage, NotFoundPage } from "@layouts";
import { checkIsMobile } from "./utils/isMobile";

export default function NotFound() {
  if (checkIsMobile()) return <MobilePage />

  return <NotFoundPage />
}
