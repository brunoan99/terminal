import { IGithubRepository } from "./IGithubRepository";
import local_address from "../../config/env/local_address";

class GithubAPIRestRepository implements IGithubRepository {
  private ADDRESS: string = `${local_address.value}`;
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
      let resp = await fetch(
        `${this.ADDRESS}/get_user_info?usr=${usr}`,
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
      let resp = await fetch(
        `${this.ADDRESS}/get_user_repos?usr=${usr}&page=${page}&per_page=${per_page}`,
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
      let resp = await fetch(
        `${this.ADDRESS}/get_path_content?usr=${usr}&repo=${repo}&path=${path}`,
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
      let resp = await fetch(
        `${this.ADDRESS}/get_repo_info?usr=${usr}&repo=${repo}`,
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
