import {
  left as Left,
  right as Right,
  isLeft,
  isRight,
} from "fp-ts/lib/Either";
import {
  MemoryFileSystem,
  FileType,
  FolderType,
  newFile,
  newFolder,
} from "./file-system";
import { IGithubRepository } from "../infra/IGithubRepository";

describe("Memory File System", () => {
  let sut: MemoryFileSystem;
  let ghRepo: IGithubRepository;

  beforeAll(() => {
    ghRepo = {
      getUserInformation: jest.fn(),
      getUserRepositories: jest.fn(),
      getRepositoryInformation: jest.fn(),
      getPathContent: jest.fn(),
    } as jest.Mocked<IGithubRepository>;
  });

  beforeEach(() => {
    sut = new MemoryFileSystem(ghRepo);
  });

  afterAll(() => {
    sut.printCascadian();
  });

  describe("init", () => {
    it("should contain root", () => {
      expect(sut.root).toEqual({
        name: "/",
        childs: new Map(),
        fullyVerified: true,
        parent: undefined,
        type: "folder",
      });
    });

    it("should current be root", () => {
      expect(sut.current).toEqual(sut.root);
    });
  });

  describe("listDirectoryContent", () => {});

  describe("remove", () => {});

  describe("getCurrentPath", () => {
    it("should return string of path", async () => {
      sut.create("/any/other/folder", undefined, true);

      let path = sut.currentPath;
      expect(path).toBe("/");

      await sut.changeCurrentDirectory("/any/other/folder");
      path = sut.currentPath;
      expect(path).toBe("/any/other/folder");
    });
  });

  describe("getAbsolutePath", () => {
    it("should return the path from a absolute path", () => {
      let path = sut.getAbsolutePath("/any/other");
      expect(path).toBe("/any/other");
    });

    it("should return the path from a relative path", async () => {
      sut.create("/any/other/folder", undefined, true);

      await sut.changeCurrentDirectory("/any/other/folder");

      let path = sut.getAbsolutePath(".");
      expect(path).toBe("/any/other/folder");
    });

    it("should return the path from a relative path without . or ..", async () => {
      sut.create("/any/other/folder", undefined, true);

      await sut.changeCurrentDirectory("/any/other/folder");

      let path = sut.getAbsolutePath("./..");
      expect(path).toBe("/any/other");

      path = sut.getAbsolutePath("./../folder/.");
      expect(path).toBe("/any/other/folder");
    });
  });

  describe("create", () => {
    describe("default", () => {
      it("should create the elem and only the elem", () => {
        sut.create("/", newFolder("any"), false);

        expect(sut.root.childs.size).toBe(1);
        let p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();
      });

      it("should return error when path doesn't exists to elem", async () => {
        let op = await sut.create("/inexistent/path", newFile("any"), false);

        expect(isLeft(op)).toBeTruthy();
      });
    });

    describe("recursively", () => {
      it("should create the entire path to the element", () => {
        sut.create("/any/other/folder", undefined, true);

        let p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        let p2 = p1.childs.get("other");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();

        let p3 = p2.childs.get("folder");
        if (!p3) throw new Error("not suposed to get here");
        if (p3.type == "file") throw new Error("not suposed to get here");
        expect(p3).toBeTruthy();
      });

      it("should replace a file in path to the element", () => {
        sut.create("/any/path", newFile("toReplace"), true);

        let p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        let p2 = p1.childs.get("path");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();

        let f1 = p2.childs.get("toReplace");
        if (!f1) throw new Error("not suposed to get here");
        if (f1.type == "folder") throw new Error("not suposed to get here");
        expect(f1).toBeTruthy();

        sut.create("/any/path/toReplace/folder", newFile("other"), true);

        p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        p2 = p1.childs.get("path");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();

        let p3 = p2.childs.get("toReplace");
        if (!p3) throw new Error("not suposed to get here");
        if (p3.type == "file") throw new Error("not suposed to get here");
        expect(p3).toBeTruthy();

        let p4 = p3.childs.get("folder");
        if (!p4) throw new Error("not suposed to get here");
        if (p4.type == "file") throw new Error("not suposed to get here");
        expect(p4).toBeTruthy();

        f1 = p4.childs.get("other");
        if (!f1) throw new Error("not suposed to get here");
        if (f1.type == "folder") throw new Error("not suposed to get here");
        expect(f1).toBeTruthy();
      });

      it("should replace a file if it in new file position", () => {
        sut.create("/any/path", newFile("toReplace", undefined, "body1"), true);

        let p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        let p2 = p1.childs.get("path");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();

        let f1 = p2.childs.get("toReplace");
        if (!f1) throw new Error("not suposed to get here");
        if (f1.type == "folder") throw new Error("not suposed to get here");
        expect(f1).toBeTruthy();
        expect(f1.body).toBe("body1");

        sut.create("/any/path", newFile("toReplace", undefined, "body2"), true);

        f1 = p2.childs.get("toReplace");
        if (!f1) throw new Error("not suposed to get here");
        if (f1.type == "folder") throw new Error("not suposed to get here");
        expect(f1).toBeTruthy();
        expect(f1.body).toBe("body2");
      });

      it("should replace a file if it in new folder position", () => {
        sut.create("/any/path", newFile("toReplace", undefined, "body1"), true);

        let p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        let p2 = p1.childs.get("path");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();

        let f1 = p2.childs.get("toReplace");
        if (!f1) throw new Error("not suposed to get here");
        if (f1.type == "folder") throw new Error("not suposed to get here");
        expect(f1).toBeTruthy();
        expect(f1.body).toBe("body1");

        sut.create("/any/path", newFolder("toReplace", undefined), true);

        let p3 = p2.childs.get("toReplace");
        if (!p3) throw new Error("not suposed to get here");
        if (p3.type == "file") throw new Error("not suposed to get here");
        expect(p3).toBeTruthy();
      });

      it("should replace a folder if it in new file position", () => {
        sut.create("/any/path", newFolder("toReplace"), true);

        let p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        let p2 = p1.childs.get("path");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();

        let p3 = p2.childs.get("toReplace");
        if (!p3) throw new Error("not suposed to get here");
        if (p3.type == "file") throw new Error("not suposed to get here");
        expect(p3).toBeTruthy();

        sut.create("/any/path", newFile("toReplace"), true);

        p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        p2 = p1.childs.get("path");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();

        let f1 = p2.childs.get("toReplace");
        if (!f1) throw new Error("not suposed to get here");
        if (f1.type == "folder") throw new Error("not suposed to get here");
        expect(f1).toBeTruthy();
      });

      it("should merge a folder if it in new folder position", () => {
        /*
          /any
            /other
              /folder
              /another
              /test

          sut.create(
            "any",
            newFolder("other", [newFolder("child1"), newFolder("child2")]),
          )

          /any
            /other
              /folder
              /another
              /test
              /child1
              /child2
        */
        sut.create(
          "/any",
          newFolder(
            "other",
            undefined,
            new Map()
              .set("folder", newFolder("folder"))
              .set("another", newFolder("another"))
              .set("test", newFolder("test"))
          ),
          true
        );

        let p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        let p2 = p1.childs.get("other");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();
        expect(p2.childs.size).toBe(3);
        expect(p2.childs.has("folder")).toBeTruthy();
        expect(p2.childs.has("another")).toBeTruthy();
        expect(p2.childs.has("test")).toBeTruthy();

        sut.create(
          "any",
          newFolder(
            "other",
            undefined,
            new Map()
              .set("child1", newFolder("child1"))
              .set("child2", newFolder("child2"))
          ),
          true
        );

        p2 = p1.childs.get("other");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();
        expect(p2.childs.size).toBe(5);
        expect(p2.childs.has("folder")).toBeTruthy();
        expect(p2.childs.has("another")).toBeTruthy();
        expect(p2.childs.has("test")).toBeTruthy();
        expect(p2.childs.has("child1")).toBeTruthy();
        expect(p2.childs.has("child2")).toBeTruthy();
      });

      it("should merge folders and keep fullyVerified childs", () => {
        /*
          /any
            /other
              /folder -> fullyVerified
                /with
                /content
              /another
              /test

          sut.create(
            "any",
            newFolder("other", [newFolder("folder"), newFolder("child1")]),
          )

          /any
            /other
              /folder -> fullyVerified
                /with
                /content
              /another
              /test
              /child1

          when a child exists in both older and new Folder, then
          should verify if existent is fullyVerified, in case keep existent
          otherwise replace with new
        */
        sut.create(
          "/any",
          newFolder(
            "other",
            undefined,
            new Map()
              .set(
                "folder",
                newFolder(
                  "folder",
                  undefined,
                  new Map()
                    .set("with", newFolder("with"))
                    .set("content", newFolder("content")),
                  true
                )
              )
              .set("another", newFolder("another"))
              .set("test", newFolder("test"))
          ),
          true
        );

        let p1 = sut.root.childs.get("any");
        if (!p1) throw new Error("not suposed to get here");
        if (p1.type == "file") throw new Error("not suposed to get here");
        expect(p1).toBeTruthy();

        let p2 = p1.childs.get("other");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();
        expect(p2.childs.size).toBe(3);
        expect(p2.childs.has("folder")).toBeTruthy();
        expect(p2.childs.has("another")).toBeTruthy();
        expect(p2.childs.has("test")).toBeTruthy();

        let p3 = p2.childs.get("folder");
        if (!p3) throw new Error("not suposed to get here");
        if (p3.type == "file") throw new Error("not suposed to get here");
        expect(p3.childs.size).toBe(2);
        expect(p3.childs.has("with")).toBeTruthy();
        expect(p3.childs.has("content")).toBeTruthy();
        expect(p3.fullyVerified).toBeTruthy();

        sut.create(
          "/any",
          newFolder(
            "other",
            undefined,
            new Map()
              .set("folder", newFolder("folder", undefined, new Map(), false))
              .set("child1", newFolder("child1"))
          ),
          true
        );

        p2 = p1.childs.get("other");
        if (!p2) throw new Error("not suposed to get here");
        if (p2.type == "file") throw new Error("not suposed to get here");
        expect(p2).toBeTruthy();
        expect(p2.childs.size).toBe(4);
        expect(p2.childs.has("folder")).toBeTruthy();
        expect(p2.childs.has("another")).toBeTruthy();
        expect(p2.childs.has("test")).toBeTruthy();
        expect(p2.childs.has("child1")).toBeTruthy();

        p3 = p2.childs.get("folder");
        if (!p3) throw new Error("not suposed to get here");
        if (p3.type == "file") throw new Error("not suposed to get here");
        expect(p3.childs.size).toBe(2);
        expect(p3.childs.has("with")).toBeTruthy();
        expect(p3.childs.has("content")).toBeTruthy();
        expect(p3.fullyVerified).toBeTruthy();
      });
    });
  });
});
