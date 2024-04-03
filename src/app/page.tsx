import { HomePageDesktop, HomePageMobile } from "../ui/layouts";
import { headers } from "next/headers"

function checkIsMobile() {
  const headersList = headers();
  const UA = headersList.get("user-agent");
  if (!UA) return false;
  return Boolean(UA.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  ))
}

export default function Home() {
  if (checkIsMobile()) return <HomePageMobile />
  return <HomePageDesktop />;
}
