import github_token from "../../../config/env/github_token";

const TOKEN = `${github_token.value}`;

export const default_options = {
  method: "GET",
  headers: {
    Accept: "*/*",
    Authorization: `Bearer ${TOKEN}`,
  },
};
