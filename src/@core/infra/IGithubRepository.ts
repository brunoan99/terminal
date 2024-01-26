interface IGithubRepository {
  getUserInformation(username: string): Promise<any>;
  getUserRepositories(username: string): Promise<any>;
  getFolderContent(username: string, repo: string, path: string): Promise<any>;
  getFileContent(username: string, repo: string, path: string): Promise<any>;
}

export type { IGithubRepository };
