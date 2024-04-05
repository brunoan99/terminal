import { headers } from "next/headers";

export const checkIsMobile = (): boolean => {
  const headersList = headers();
  const UA = headersList.get("user-agent");
  if (!UA) return false;
  return Boolean(
    UA.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );
};
