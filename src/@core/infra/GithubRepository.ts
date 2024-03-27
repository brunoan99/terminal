import { AxiosInstance } from "axios";
import { IGithubRepository } from "./IGithubRepository";
import local_address from "../../config/env/local_address";
import local_token from "../../config/env/local_token";

class GithubRepository implements IGithubRepository {
  private ADDRESS: string = `${local_address.value}`;
  private TOKEN: string = `${local_token.value}`;
  constructor(private axios: AxiosInstance) {}

  async getUserInformation(usr: string): Promise<any | null> {
    let request = {
      url: `${this.ADDRESS}/get_user_info?usr=${usr}`,
      method: "GET",
      headers: {
        Accept: "*/*",
        T: this.TOKEN,
      },
    };
    try {
      let resp = await this.axios.request(request);
      if (resp.status == 200) return resp.data;
      return null;
    } catch (e) {
      return null;
    }
  }

  async getUserRepositories(
    usr: string,
    page: number,
    per_page: number
  ): Promise<any | null> {
    let request = {
      url: `${this.ADDRESS}/get_user_repos?usr=${usr}&page=${page}&per_page=${per_page}`,
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    };
    try {
      let resp = await this.axios.request(request);
      if (resp.status == 200) return resp.data;
      return null;
    } catch (e) {
      return null;
    }
  }

  async getPathContent(
    usr: string,
    repo: string,
    path: string = ""
  ): Promise<any | null> {
    let request = {
      url: `${this.ADDRESS}/get_path_content?usr=${usr}&repo=${repo}&path=${path}`,
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    };
    try {
      let resp = await this.axios.request(request);
      if (resp.status == 200) return resp.data;
      return null;
    } catch (e) {
      return null;
    }
  }

  async getRepositoryInformation(usr: string, repo: string): Promise<any> {
    let request = {
      url: `${this.ADDRESS}/get_repo_info?usr=${usr}&repo=${repo}`,
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    };
    try {
      let resp = await this.axios.request(request);
      if (resp.status == 200) return resp.data;
      return null;
    } catch (e) {
      return null;
    }
  }
}

export { GithubRepository };
