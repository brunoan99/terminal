import { GithubAPIRestRepositoryN } from "./GithubRepository-n";

describe("Github Repository", () => {
  let sut: GithubAPIRestRepositoryN;

  beforeAll(() => {
    sut = new GithubAPIRestRepositoryN();
  });

  test("should get user information", async () => {
    let op = await sut.getUserInformation("brunoan99");
    expect(op.name).toEqual("Bruno Andrade");
    expect(op.type).toEqual("User");
  });
});
