import { NewMemoryFileSystem } from "./file-system-n"

describe("New Memory File System", () => {
  let sut: NewMemoryFileSystem;

  beforeEach(() => {
    sut = new NewMemoryFileSystem();
  })

  describe("init", () => {
    it("should contain root", () => {
      expect(sut.root).toEqual({
        type: "root",
        childs: new Map<string, Node>(),
      });
    });
  });
})
