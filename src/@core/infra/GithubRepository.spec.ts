import axios from "axios";
import { GithubRepository } from "./GithubRepository";

describe("Github Repository", () => {
  let sut: GithubRepository;

  beforeAll(() => {
    sut = new GithubRepository(axios.create());
  });

  test("should get user information", async () => {
    let op = await sut.getUserInformation("brunoan99");
    expect(op.name).toEqual("Bruno Andrade");
    expect(op.type).toEqual("User");
  });

  test("should get user repositories", async () => {
    let op = await sut.getUserRepositories("brunoan99");
    expect(op.length).toBeGreaterThan(0);
  });

  test("should get repo content", async () => {
    let op = await sut.getRepoContent("brunoan99", "actions");
    expect(op.length).toBeGreaterThan(0);
  });

  test("should get file content", async () => {
    let op = await sut.getFileContent("brunoan99", "actions", ".gitignore");
    expect(op).toBe("node_modules");
  });
});
