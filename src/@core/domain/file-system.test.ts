import axios from "axios";
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
    ghRepo = new GithubRepository(axios.create());
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
      expect(childs.has("info.json")).toBeTruthy();
      expect(childs.has("README.md")).toBeTruthy();
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
      expect(childs.has("info.json")).toBeTruthy();
    });

    it("should return error when don't exists in github too", async () => {});

    it("should return error when don't exists and is outher github folder", async () => {
      let op = await sut.find("/folder/inexistent");
      expect(isLeft(op)).toBeTruthy();
      let message = isLeft(op) ? op.left : undefined;
      expect(message).toBe("no such file or directory: /folder/inexistent");
    });
  });
});
