import axios, { AxiosInstance } from "axios";
import github_address from "../../config/github_address";
import github_token from "../../config/github_token";

class GithubRepository {
  BASE_URL = `${github_address.url}`;
  TOKEN = `${github_token.token}`;
  constructor(private axios: AxiosInstance) {}

  async getUserInformation(username: string): Promise<any> {
    const request = {
      url: `${this.BASE_URL}/users/${username}`,
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${this.TOKEN}`,
      },
    };
    const response = await this.axios.request(request);
    return response.data;
  }

  async getUserRepositories(username: string): Promise<any> {
    const request = {
      url: `${this.BASE_URL}/users/${username}/repos`,
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${this.TOKEN}`,
      },
    };
    const response = await this.axios.request(request);
    return response.data;
  }

  async getRepoContent(username: string, repo: string): Promise<any> {
    const request = {
      url: `${this.BASE_URL}/repos/${username}/${repo}/contents`,
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${this.TOKEN}`,
      },
    };
    const response = await this.axios.request(request);
    return response.data;
  }

  async getFileContent(
    username: string,
    repo: string,
    path: string
  ): Promise<any> {
    const request = {
      url: `${this.BASE_URL}/repos/${username}/${repo}/contents/${path}`,
      method: "GET",
      headers: {
        Accept: "application/vnd.github.VERSION.raw",
        Authorization: `Bearer ${this.TOKEN}`,
      },
    };
    const response = await this.axios.request(request);
    return response.data;
  }
}

export { GithubRepository };
