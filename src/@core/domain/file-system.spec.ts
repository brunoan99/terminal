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
      getFolderContent: jest.fn(),
      getFileContent: jest.fn(),
    } as jest.Mocked<IGithubRepository>;
  });

  beforeEach(() => {
    sut = new MemoryFileSystem(ghRepo);
  });

  describe("init", () => {
    it("should contain root", () => {
      expect(sut.root).toEqual({
        name: "/",
        childs: [],
        parent: undefined,
        type: "folder",
      });
    });

    it("should current be root", () => {
      expect(sut.current).toEqual(sut.root);
    });
  });

  describe("createDirectory", () => {
    it("should insert it in relative path", () => {
      let f1 = newFolder("other", undefined, []);
      sut.root.childs?.push(f1);
      sut.current = f1;
      let op = sut.createDirectory("any", undefined, []);
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let current = sut.current;
      let f2 = newFolder("any", current, []);
      expect(current.childs).toEqual([f2]);
      expect(root.childs).toEqual([f1]);
    });

    it("should insert it and parents in relative path", () => {
      let op = sut.createDirectory("any/other/folder", true, []);
      expect(op).toEqual(Right(null));
      sut.changeCurrentDirectory("/any/other/folder");
      let path = sut.currentPath;
      expect(path).toBe("/any/other/folder");
    });

    it("should insert in absolute path", () => {
      let op = sut.createDirectory("/any", true, []);
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let current = sut.current;
      let f1 = newFolder("any", root, []);
      expect(current.childs).toEqual([f1]);
      expect(root.childs).toEqual([f1]);
    });

    it("should insert it and parents in absolute path", () => {
      let op = sut.createDirectory("/any/other/folder", true, []);
      expect(op).toEqual(Right(null));
      sut.changeCurrentDirectory("/any/other/folder");
      let path = sut.currentPath;
      expect(path).toBe("/any/other/folder");
    });

    it("should consider '.' when inserting", () => {
      let op = sut.createDirectory("./foo", true, []);
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let name = root.childs?.[0].name;
      expect(name).toBe("foo");
    });

    it("should consider '..' when inserting", () => {
      sut.createDirectory("/any/other/folder", true, []);
      sut.changeCurrentDirectory("any/other/folder");
      let op = sut.createDirectory("../../../any2", true, []);
      expect(op).toEqual(Right(null));
      expect(sut.root.childs?.[0].name).toBe("any");
      expect(sut.root.childs?.[1].name).toBe("any2");
    });

    it("should return error when try to create a folder with name '.'", () => {
      let op = sut.createDirectory("/any/.", true, []);
      expect(op).toEqual(Left("cannot create directory ‘/any/.’: File exists"));
    });

    it("should return error when file exists with same name", () => {
      let file: FileType = newFile("any", sut.current);
      sut.current.childs?.push(file);
      let op = sut.createDirectory("any", true, []);
      expect(op).toEqual(Left("cannot create directory ‘any’: File exists"));
    });

    it("should return error when folder exists with same name", () => {
      let folder: FolderType = newFolder("any", undefined, []);
      sut.current.childs?.push(folder);
      let op = sut.createDirectory("any", false, []);
      expect(op).toEqual(Left("cannot create directory ‘any’: File exists"));
    });

    it("should return error when file exists in path", () => {
      let file: FileType = newFile("any", sut.current);
      sut.current.childs?.push(file);
      let op = sut.createDirectory("any/other/folder", true, []);
      expect(op).toEqual(
        Left("cannot create directory ‘any/other/folder’: Not a directory")
      );
    });
  });

  describe("findDirectory", () => {
    it("should find directory in relative path", () => {
      sut.createDirectory("/any/other/folder", true, []);
      let newCurrent = sut.root.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent;

      let op = sut.findDirectory("other/folder");
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("folder");
    });

    it("should find directory in absolute path", () => {
      sut.createDirectory("/any/other/folder", true, []);

      let newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> folder

      let op = sut.findDirectory("/any/other");
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("other");
    });

    it("should consider '.' when finding", () => {
      sut.createDirectory("/foo/any", true, []);

      let op = sut.findDirectory("/foo/./any");
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("any");
    });

    it("should consider '.' in ending when finding", () => {
      sut.createDirectory("/foo/any", true, []);

      let op = sut.findDirectory("/foo/.");
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("foo");
    });

    it("should consider '..' when finding", () => {
      sut.createDirectory("/foo/any", true, []);

      let op = sut.findDirectory("/foo/../foo/any");
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("any");
    });

    it("should consider '..' in ending when finding", () => {
      sut.createDirectory("/foo/any", true, []);

      let op = sut.findDirectory("/foo/any/..");
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("foo");
    });

    it("should return error when folder don't exists", () => {
      sut.createDirectory("/any/other/folder", true, []);

      let op = sut.findDirectory("/any/other/structure");
      expect(op).toEqual(
        Left("no such file or directory: /any/other/structure")
      );
    });

    it("should return error when file exists in place", () => {
      sut.createDirectory("/any/other", true, []);

      let newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      const f1 = newFile("folder", sut.current);
      sut.current.childs?.push(f1);

      let op = sut.findDirectory("/any/other/folder");
      expect(op).toEqual(Left("not a directory: /any/other/folder"));
    });
  });

  describe("listDirectoryContent", () => {
    it("should return the directory child when found", async () => {
      sut.createDirectory("any", true, []);

      let newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      let f1 = newFile("file1", sut.current);
      sut.current.childs?.push(f1);
      let f2 = newFile("file2", sut.current);
      sut.current.childs?.push(f2);
      let f3 = newFile("file3", sut.current);
      sut.current.childs?.push(f3);
      let f4 = newFile("file4", sut.current);
      sut.current.childs?.push(f4);

      let op = await sut.listDirectoryContent("/any");
      expect(isRight(op)).toBe(true);
      let list = isRight(op) ? op.right : undefined;
      expect(list).toEqual([f1, f2, f3, f4]);
    });

    it("should return error provided by find", async () => {
      let op = await sut.listDirectoryContent("/any");
      expect(isLeft(op)).toBe(true);
    });
  });

  describe("remove", () => {
    it("should return error when try to remove root", () => {});
  });

  describe("getCurrentPath", () => {
    it("should return string of path", () => {
      sut.createDirectory("/any/other/folder", true, []);

      let newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> folder

      let path = sut.currentPath;
      expect(path).toBe("/any/other/folder");
    });
  });

  describe("getAbsolutePath", () => {
    it("should return the path from a absolute path", () => {
      sut.createDirectory("/any/other/folder", true, []);

      let newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> folder

      let op = sut.getAbsolutePath("/any/other");
      expect(isRight(op)).toBe(true);
      let path = isRight(op) ? op.right : null;
      expect(path).toBe("/any/other");
    });

    it("should return the path from a relative path", () => {
      sut.createDirectory("/any/other/folder", true, []);

      let newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> folder

      let op = sut.getAbsolutePath(".");
      expect(isRight(op)).toBe(true);
      let path = isRight(op) ? op.right : null;
      expect(path).toBe("/any/other/folder");
    });

    it("should return the path from a relative path without . or ..", () => {
      sut.createDirectory("/any/other/folder", true, []);

      let newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      newCurrent = sut.current.childs?.[0] as FileType | FolderType;
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> folder

      let op = sut.getAbsolutePath("./..");
      expect(isRight(op)).toBe(true);
      let path = isRight(op) ? op.right : null;
      expect(path).toBe("/any/other");

      op = sut.getAbsolutePath("./../folder/.");
      expect(isRight(op)).toBe(true);
      path = isRight(op) ? op.right : null;
      expect(path).toBe("/any/other/folder");
    });
  });
});
