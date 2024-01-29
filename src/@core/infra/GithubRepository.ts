import { AxiosInstance } from "axios";
import github_address from "../../config/github_address";
import github_token from "../../config/github_token";
import { IGithubRepository } from "./IGithubRepository";

class GithubRepository implements IGithubRepository {
  /*
  TODO
  IN FUTURE THIS CLASS NEEDS TO BE CALLED IN SERVER ONLY
  USE SERVER ACTIONS TO DO IT
  CAUSE IF DOESN'T THE TOKEN WILL BE EXPOSED TO THE CLIENT SIDE
  ACTUALLY IT IS, BUT FOR CONVENIENCE

  */
  BASE_URL = `${github_address.url}`;
  TOKEN = `${github_token.token}`;
  constructor(private axios: AxiosInstance) {}

  async getUserInformation(usr: string): Promise<any | null> {
    try {
      const request = {
        url: `${this.BASE_URL}/users/${usr}`,
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${this.TOKEN}`,
        },
      };
      process.nextTick(() => {});
      const response = await this.axios.request(request);
      return response.data;
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
      const request = {
        url: `${this.BASE_URL}/users/${usr}/repos?per_page=${per_page}&page=${page}`,
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${this.TOKEN}`,
        },
      };
      process.nextTick(() => {});
      const response = await this.axios.request(request);
      return response.data;
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
      const request = {
        url: `${this.BASE_URL}/repos/${usr}/${repo}/contents/${path}`,
        method: "GET",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${this.TOKEN}`,
        },
      };
      process.nextTick(() => {});
      const response = await this.axios.request(request);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getRepositoryInformation(usr: string, repo: string): Promise<any> {
    try {
      const request = {
        url: `${this.BASE_URL}/repos/${usr}/${repo}`,
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.TOKEN}`,
        },
      };
      process.nextTick(() => {});
      const response = await this.axios.request(request);
      return response.data;
    } catch (e) {
      return null;
    }
  }
}

export { GithubRepository };
