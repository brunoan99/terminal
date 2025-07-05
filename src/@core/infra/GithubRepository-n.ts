import { IGithubRepository } from "./IGithubRepository";

class GithubAPIRestRepositoryN implements IGithubRepository {
  private default_options: object;
  private base_url: string;

  constructor() {
    let token = process.env.GITHUB_TOKEN;
    this.base_url = process.env.GITHUB_ADDRESS || "";
    this.default_options = {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      }
    }
  }

  async getUserInformation(usr: string): Promise<any | null> {
    "use server"
    try {
      let resp = await fetch(`${this.base_url}/users/${usr}`, this.default_options);
      let data = await resp.json();
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getUserRepositories(
    usr: string,
    page: number,
    per_page: number
  ): Promise<any | null> {
    "use server"
    try {
      let address = process.env.NEXT_PUBLIC_LOCAL_ADDRESS;

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
    "use server"
    try {
      let address = process.env.NEXT_PUBLIC_LOCAL_ADDRESS;

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
    "use server"
    try {
      let address = process.env.NEXT_PUBLIC_LOCAL_ADDRESS;

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

export { GithubAPIRestRepositoryN };
