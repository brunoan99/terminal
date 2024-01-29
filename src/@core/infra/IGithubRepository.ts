interface IGithubRepository {
  getUserInformation(usr: string): Promise<any | null>;
  getUserRepositories(
    usr: string,
    page: number,
    per_page: number
  ): Promise<any | null>;
  getRepositoryInformation(usr: string, repo: string): Promise<any | null>;
  getPathContent(usr: string, repo: string, path: string): Promise<any | null>;
}

export type { IGithubRepository };
