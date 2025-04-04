import { MobilePage, NotFoundPage } from "@layouts";
import { checkIsMobile } from "./utils/isMobile";

export default async function NotFound() {
  if (await checkIsMobile()) return <MobilePage />

  return <NotFoundPage />
}
