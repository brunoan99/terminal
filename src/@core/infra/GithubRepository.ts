import { IGithubRepository } from "./IGithubRepository";

class GithubAPIRestRepository implements IGithubRepository {
  private default_options = {
    method: "GET",
    headers: {
      "Access-Control-Allow-Origin": "*",
      Accept: "*/*",
    },
  };
  constructor() {}

  async getUserInformation(usr: string): Promise<any | null> {
    try {
      let address = process.env.NEXT_PUBLIC_LOCAL_ADDRESS;
      console.log(`USER-REPOS: ${address}/get_user_info?usr=${usr}`);

      let resp = await fetch(
        `${address}/get_user_info?usr=${usr}`,
        this.default_options
      );
      let data = await resp.json();
      return data;
    } catch (e) {
      return null;
    }
  }

  async getUserRepositories(
    usr: string,
    page: number,
    per_page: number
  ): Promise<any | null> {
    try {
      let address = process.env.NEXT_PUBLIC_LOCAL_ADDRESS;
      console.log(`USER-REPOS: ${address}/get_user_repos?usr=${usr}&page=${page}&per_page=${per_page}`);

      let resp = await fetch(
        `${address}/get_user_repos?usr=${usr}&page=${page}&per_page=${per_page}`,
        this.default_options
      );
      let data = await resp.json();
      return data;
    } catch (e) {
      return null;
    }
  }

  async getPathContent(
    usr: string,
    repo: string,
    path: string = ""
  ): Promise<any | null> {
    try {
      let address = process.env.NEXT_PUBLIC_LOCAL_ADDRESS;
      console.log(`PATH: ${address}/get_path_content?usr=${usr}&repo=${repo}&path=${path}`);

      let resp = await fetch(
        `${address}/get_path_content?usr=${usr}&repo=${repo}&path=${path}`,
        this.default_options
      );
      let data = await resp.json();
      return data;
    } catch (e) {
      return null;
    }
  }

  async getRepositoryInformation(usr: string, repo: string): Promise<any> {
    try {
      let address = process.env.NEXT_PUBLIC_LOCAL_ADDRESS;
      console.log(`REPO-INFO: ${address}/get_repo_info?usr=${usr}&repo=${repo}`);

      let resp = await fetch(
        `${address}/get_repo_info?usr=${usr}&repo=${repo}`,
        this.default_options
      );
      let data = await resp.json();
      return data;
    } catch (e) {
      return null;
    }
  }
}

export { GithubAPIRestRepository as GithubRepository };
