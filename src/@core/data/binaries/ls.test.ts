import { MemoryFileSystem, newFile } from "../../domain/file-system";
import { IGithubRepository } from "../../infra/IGithubRepository";
import { LsBin } from "./ls";

describe("Ls Bin", () => {
  let sut: LsBin;
  let file_system: MemoryFileSystem;

  beforeAll(async () => {
    const ghRepo = {
      getUserInformation: jest.fn(),
      getUserRepositories: jest.fn(),
      getRepositoryInformation: jest.fn(),
      getPathContent: jest.fn(),
    } as jest.Mocked<IGithubRepository>;
    file_system = new MemoryFileSystem(ghRepo);

    await file_system.create("/", newFile("aa"));
    await file_system.create("/", newFile("ab"));
    await file_system.create("/", newFile("ac"));
    await file_system.create("/", newFile("ad"));
    await file_system.create("/", newFile("ae"));
    await file_system.create("/", newFile("af"));
    await file_system.create("/", newFile("ag"));
    await file_system.create("/", newFile("ah"));
    await file_system.create("/", newFile("ai"));
    await file_system.create("/", newFile("aj"));
    await file_system.create("/", newFile("ak"));
    await file_system.create("/", newFile("al"));
    await file_system.create("/", newFile("am"));
    await file_system.create("/", newFile("an"));
    await file_system.create("/", newFile("ao"));
    await file_system.create("/", newFile("ap"));
    await file_system.create("/", newFile("aq"));
    await file_system.create("/", newFile("ar"));
    await file_system.create("/", newFile("as"));
    await file_system.create("/", newFile("at"));
    await file_system.create("/", newFile("au"));
    await file_system.create("/", newFile("av"));
    await file_system.create("/", newFile("ax"));
    await file_system.create("/", newFile("ay"));
    await file_system.create("/", newFile("aw"));
    await file_system.create("/", newFile("az"));
    await file_system.create("/", newFile("a"));
    await file_system.create("/", newFile("b"));
    await file_system.create("/", newFile("c"));
    await file_system.create("/", newFile("d"));
    await file_system.create("/", newFile("e"));
    await file_system.create("/", newFile("f"));
    await file_system.create("/", newFile("g"));
    await file_system.create("/", newFile("h"));
    await file_system.create("/", newFile("i"));
    await file_system.create("/", newFile("j"));
    await file_system.create("/", newFile("k"));
    await file_system.create("/", newFile("l"));
    await file_system.create("/", newFile("m"));
    await file_system.create("/", newFile("n"));
    await file_system.create("/", newFile("o"));
    await file_system.create("/", newFile("p"));
    await file_system.create("/", newFile("q"));
    await file_system.create("/", newFile("r"));
    await file_system.create("/", newFile("s"));
    await file_system.create("/", newFile("t"));
    await file_system.create("/", newFile("u"));
    await file_system.create("/", newFile("v"));
    await file_system.create("/", newFile("x"));
    await file_system.create("/", newFile("y"));
    await file_system.create("/", newFile("w"));
    await file_system.create("/", newFile("z"));
    sut = new LsBin();
  });

  describe("arrange_names_in_lines", () => {
    it("should arrange", () => {
      let names = [
        "aa",
        "ab",
        "ac",
        "ad",
        "ae",
        "af",
        "ag",
        "ah",
        "ai",
        "aj",
        "ak",
        "al",
        "am",
        "an",
        "ao",
        "ap",
        "aq",
        "ar",
        "as",
        "at",
        "au",
        "av",
        "ax",
        "ay",
        "aw",
        "az",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "x",
        "y",
        "w",
        "z",
      ].sort();
      let lines = sut.arrange_names_in_lines(names);
      let expected = [
        "a   ac  af  ai  al  ao  ar  au  ax  b  e  h  k  n  q  t  w  z",
        "aa  ad  ag  aj  am  ap  as  av  ay  c  f  i  l  o  r  u  x",
        "ab  ae  ah  ak  an  aq  at  aw  az  d  g  j  m  p  s  v  y",
      ];
      expect(lines).toEqual(expected);
    });
  });
});
