import { HomePageDesktop, MobilePage } from "../ui/layouts";
import { checkIsMobile } from "./utils/isMobile";

export default function Home() {
  if (checkIsMobile()) return <MobilePage />
  return <HomePageDesktop />;
}
