import { MemoryFileSystem } from "../../domain/file-system";
import { LsBin } from "./ls"

describe("Ls Bin", () => {
  let sut: LsBin;
  let file_system: MemoryFileSystem;

  beforeAll(() => {
    file_system = new MemoryFileSystem();

    file_system.createFile("aa", "")
    file_system.createFile("ab", "")
    file_system.createFile("ac", "")
    file_system.createFile("ad", "")
    file_system.createFile("ae", "")
    file_system.createFile("af", "")
    file_system.createFile("ag", "")
    file_system.createFile("ah", "")
    file_system.createFile("ai", "")
    file_system.createFile("aj", "")
    file_system.createFile("ak", "")
    file_system.createFile("al", "")
    file_system.createFile("am", "")
    file_system.createFile("an", "")
    file_system.createFile("ao", "")
    file_system.createFile("ap", "")
    file_system.createFile("aq", "")
    file_system.createFile("ar", "")
    file_system.createFile("as", "")
    file_system.createFile("at", "")
    file_system.createFile("au", "")
    file_system.createFile("av", "")
    file_system.createFile("ax", "")
    file_system.createFile("ay", "")
    file_system.createFile("aw", "")
    file_system.createFile("az", "")
    file_system.createFile("a", "")
    file_system.createFile("b", "")
    file_system.createFile("c", "")
    file_system.createFile("d", "")
    file_system.createFile("e", "")
    file_system.createFile("f", "")
    file_system.createFile("g", "")
    file_system.createFile("h", "")
    file_system.createFile("i", "")
    file_system.createFile("j", "")
    file_system.createFile("k", "")
    file_system.createFile("l", "")
    file_system.createFile("m", "")
    file_system.createFile("n", "")
    file_system.createFile("o", "")
    file_system.createFile("p", "")
    file_system.createFile("q", "")
    file_system.createFile("r", "")
    file_system.createFile("s", "")
    file_system.createFile("t", "")
    file_system.createFile("u", "")
    file_system.createFile("v", "")
    file_system.createFile("x", "")
    file_system.createFile("y", "")
    file_system.createFile("w", "")
    file_system.createFile("z", "")

    sut = new LsBin();
  })

  describe("arrange_names_in_lines", () => {
    it("should arrange", () => {
      let names = ["aa", "ab", "ac", "ad", "ae", "af", "ag", "ah", "ai", "aj", "ak", "al", "am", "an", "ao", "ap", "aq", "ar", "as", "at", "au", "av", "ax", "ay", "aw", "az", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "x", "y", "w", "z"].sort();
      let lines = sut.arrange_names_in_lines(names);
      let expected = [
        "a   ac  af  ai  al  ao  ar  au  ax  b  e  h  k  n  q  t  w  z",
        "aa  ad  ag  aj  am  ap  as  av  ay  c  f  i  l  o  r  u  x",
        "ab  ae  ah  ak  an  aq  at  aw  az  d  g  j  m  p  s  v  y",
      ]
      expect(lines).toEqual(expected);
    })
  })
})
