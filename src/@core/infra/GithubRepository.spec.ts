import { GithubRepository } from "./GithubRepository";

describe("Github Repository", () => {
  let sut: GithubRepository;

  beforeAll(() => {
    sut = new GithubRepository();
  });

  test("should get user information", async () => {
    let op = await sut.getUserInformation("brunoan99");
    expect(op.name).toEqual("Bruno Andrade");
    expect(op.type).toEqual("User");
  });

  test("should get user repositories", async () => {
    let op = await sut.getUserRepositories("brunoan99", 1, 100);
    expect(op.length).toBeGreaterThan(0);
  });

  test("should get folder content", async () => {
    let op = await sut.getPathContent("brunoan99", "actions");
    expect(op.length).toBeGreaterThan(0);
  });
});
