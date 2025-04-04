import { HomePageDesktop, MobilePage } from "../ui/layouts";
import { checkIsMobile } from "./utils/isMobile";

export default async function Home() {
  if (await checkIsMobile()) return <MobilePage />
  return <HomePageDesktop />;
}
