export const default_options = () => {
  let token = process.env.GITHUB_TOKEN;

  return {
    method: "GET",
    headers: {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    }
  }
}
