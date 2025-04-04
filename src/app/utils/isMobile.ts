import { headers } from "next/headers";

export async function checkIsMobile(): Promise<boolean> {
  const headersList = await headers();
  const UA = headersList.get("user-agent");
  if (!UA) return false;
  return Boolean(
    UA.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );
}
