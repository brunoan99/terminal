import { GithubRepository } from "../infra/GithubRepository";
import { IGithubRepository } from "../infra/IGithubRepository";
import { MemoryFileSystem, newFile, newFolder } from "./file-system";
import {
  left as Left,
  right as Right,
  isLeft,
  isRight,
} from "fp-ts/lib/Either";

describe("Memory File System with Github Repository", () => {
  let sut: MemoryFileSystem;
  let ghRepo: IGithubRepository;

  beforeAll(async () => {
    ghRepo = new GithubRepository();
    sut = new MemoryFileSystem(ghRepo);
    await sut.create("/", newFolder("github", undefined, new Map(), true));
  });

  afterAll(() => {
    sut.printCascadian();
  });

  beforeEach(async () => {});

  describe("find", () => {
    it("should find in relative path", async () => {
      await sut.create("/any/other/folder", undefined, true);
      const cdOp = await sut.changeCurrentDirectory("/any");
      expect(cdOp).toEqual(Right(null));

      let op = await sut.find("other/folder");
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("folder");
    });

    it("should find in absolute path", async () => {
      await sut.create("/maybe/another/one", undefined, true);
      const cdOp = await sut.changeCurrentDirectory("/maybe/another/one");
      expect(cdOp).toEqual(Right(null));

      let op = await sut.find("/maybe/another");
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("another");
    });

    it("should check on github on a file path inside a repo when don't exists in memory file system", async () => {
      let op = await sut.find("/github/brunoan99/brunoan99/README.md");
      if (isLeft(op)) {
        throw new Error("not supose to get here");
      }
      let file = op.right;
      expect(file.name).toBe("README.md");

      op = await sut.find("/github/brunoan99/actions/.gitignore");
      if (isLeft(op)) {
        throw new Error("not supose to get here");
      }
      file = op.right;
      const body = file.type == "file" ? file.body : undefined;
      expect(body).toBe("node_modules");
    });

    it("should check on github on a folder path inside a repo when don't exists in memory file system", async () => {
      let op = await sut.find("/github/brunoan99/actions/.github");
      if (isLeft(op)) throw new Error("not supose to get here");

      const folder = op.right;
      expect(folder.name).toBe(".github");
      const childs = folder.type == "folder" ? folder.childs : undefined;
      if (childs == undefined) throw new Error("not supose to get here");
      expect(childs.has("workflows")).toBeTruthy();
    });

    it("should check on github on a repo when don't exists in memory file system", async () => {
      let op = await sut.find("/github/brunoan99/brunoan99");
      if (isLeft(op)) throw new Error("not supose to get here");

      const folder = op.right;
      expect(folder.name).toBe("brunoan99");
      const childs = folder.type == "folder" ? folder.childs : undefined;
      if (childs == undefined) throw new Error("not supose to get here");
      expect(childs.has("README.md")).toBeTruthy();
      expect(childs.has("repository_info.json")).toBeTruthy();
    });

    it("should check on github for a user when don't exists in memory file system", async () => {
      let op = await sut.find("/github/brunoan99");
      if (isLeft(op)) throw new Error("not supose to get here");

      const folder = op.right;
      expect(folder.name).toBe("brunoan99");
      const childs = folder.type == "folder" ? folder.childs : undefined;
      if (childs == undefined) throw new Error("not supose to get here");
      expect(childs.has("actions")).toBeTruthy();
      expect(childs.has("terminal")).toBeTruthy();
      expect(childs.has("profile_info.json")).toBeTruthy();
    });

    it("should check a file on github if its not fullyVerified", async () => {
      sut.create(
        "/github/brunoan99/brunoan99",
        newFile("README.md", undefined, undefined, false)
      );

      let p1 = sut.root.childs.get("github");
      if (!p1) throw new Error("not suposed to get here");
      if (p1.type == "file") throw new Error("not suposed to get here");
      expect(p1).toBeTruthy();

      let p2 = p1.childs.get("brunoan99");
      if (!p2) throw new Error("not suposed to get here");
      if (p2.type == "file") throw new Error("not suposed to get here");
      expect(p2).toBeTruthy();

      let p3 = p2.childs.get("brunoan99");
      if (!p3) throw new Error("not suposed to get here");
      if (p3.type == "file") throw new Error("not suposed to get here");
      expect(p3).toBeTruthy();

      let f1 = p3.childs.get("README.md");
      if (!f1) throw new Error("not suposed to get here");
      if (f1.type == "folder") throw new Error("not suposed to get here");
      expect(f1).toBeTruthy();
      expect(f1.body).toBe(undefined);

      let op = await sut.find("/github/brunoan99/brunoan99/README.md");
      if (isLeft(op)) throw new Error("not supose to get here");

      let file = op.right;
      if (file.type == "folder") throw new Error("not suposed to get here");
      expect(file.name).toBe("README.md");
      expect(file.body).toBeTruthy();
    });

    it("should check a folder on github if its not fullyVerified", async () => {
      sut.create("/github", newFile("brunoan99"), true);
      sut.create("/github/brunoan99", undefined, true);

      let p1 = sut.root.childs.get("github");
      if (!p1) throw new Error("not suposed to get here");
      if (p1.type == "file") throw new Error("not suposed to get here");
      expect(p1).toBeTruthy();

      let p2 = p1.childs.get("brunoan99");
      if (!p2) throw new Error("not suposed to get here");
      if (p2.type == "file") throw new Error("not suposed to get here");
      expect(p2).toBeTruthy();
      expect(p2.childs.size).toBe(0);

      let op = await sut.find("/github/brunoan99");
      if (isLeft(op)) throw new Error("not supose to get here");

      let folder = op.right;
      if (folder.type == "file") throw new Error("not suposed to get here");
      expect(folder).toBeTruthy();
      expect(folder.childs.size).toBeGreaterThan(0);
    });

    it("should return error when don't exists in github too", async () => {
      let op = await sut.find(
        "/github/brunoan99/arepositorynamethatiwillneveruse"
      );
      expect(isLeft(op)).toBeTruthy();
    });

    it("should return error when don't exists and is outher github folder", async () => {
      let op = await sut.find("/folder/inexistent");
      expect(isLeft(op)).toBeTruthy();
      let message = isLeft(op) ? op.left : undefined;
      expect(message).toBe("no such file or directory: /folder/inexistent");
    });
  });
});
