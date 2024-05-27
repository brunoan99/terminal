import { getEnv } from "../../../config/env";

export const default_options = () => {
  let token = getEnv("GITHUB_TOKEN");

  return {
    method: "GET",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    }
  }
}
