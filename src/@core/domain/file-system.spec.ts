import { left as Left, right as Right, isLeft, isRight, } from "fp-ts/lib/Either";
import { FileSystem, FileType, FolderType, newFile, newFolder } from "./file-system";

describe("File System", () => {
  describe("init", () => {
    let sut: FileSystem;

    beforeEach(() => {
      sut = new FileSystem();
    });

    it("should contain root", () => {
      expect(sut.root).toEqual({
        name: "/",
        childs: [],
        parent: undefined,
        type: "folder"
      })
    });

    it("should current be root", () => {
      expect(sut.current).toEqual(sut.root)
    });
  })

  describe("createDirectory", () => {
    let sut: FileSystem;

    beforeEach(() => {
      sut = new FileSystem();
    });

    it("should insert it in relative path", () => {
      let f1 = newFolder("other");
      sut.root.childs.push(f1);
      sut.current = f1;
      let op = sut.createDirectory("any");
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let current = sut.current;
      let f2 = newFolder("any", current);
      expect(current.childs).toEqual([f2]);
      expect(root.childs).toEqual([f1]);
    })

    it("should return error when file exists with same name", () => {
      let file: FileType = newFile("any");
      sut.current.childs.push(file);
      let op = sut.createDirectory("any")
      expect(op).toEqual(Left("cannot create directory ‘any’: File exists"));
    })

    it("should return error when folder exists with same name", () => {
      let folder: FolderType = newFolder("any");
      sut.current.childs.push(folder);
      let op = sut.createDirectory("any", false)
      expect(op).toEqual(Left("cannot create directory ‘any’: File exists"));
    })

    it("should return error when file exists in path", () => {
      let file: FileType = newFile("any");
      sut.current.childs.push(file);
      let op = sut.createDirectory("any/other/folder")
      expect(op).toEqual(Left("cannot create directory ‘any/other/folder’: Not a directory"));
    })

    it("should insert it and parents in relative path", () => {
      let op = sut.createDirectory("any/other/folder", true);
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let current = sut.current;
      let f1 = newFolder("any", current);
      let f2 = newFolder("other", f1);
      f1.childs.push(f2);
      let f3 = newFolder("folder", f2);
      f2.childs.push(f3);
      expect(current.childs[0]).toEqual(f1);
      expect(root.childs[0]).toEqual(f1);
    })

    it("should insert in absolute path", () => {
      let op = sut.createDirectory("/any");
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let current = sut.current;
      let f1 = newFolder("any", root);
      expect(current.childs).toEqual([f1]);
      expect(root.childs).toEqual([f1]);
    })

    it("should insert it and parents in absolute path", () => {
      let op = sut.createDirectory("/any/other/folder", true);
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let current = sut.current;
      let f1 = newFolder("any", root);
      let f2 = newFolder("other", f1);
      f1.childs.push(f2);
      let f3 = newFolder("folder", f2);
      f2.childs.push(f3);
      expect(current.childs[0]).toEqual(f1);
      expect(root.childs[0]).toEqual(f1);
    })

    it("should return error when try to create a folder with name '.'", () => {
      let op = sut.createDirectory("/any/.", true);
      expect(op).toEqual(Left("cannot create directory ‘/any/.’: File exists"));
    })

    it("should consider '.' when inserting", () => {
      let op = sut.createDirectory("./foo", true);
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let f1 = root.childs[0];
      expect(f1.name).toBe("foo");
    })

    it("should consider '..' when inserting", () => {
      sut.createDirectory("/any/other/folder", true);

      let newCurrent = sut.current.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      let op = sut.createDirectory("../../any2");
      expect(op).toEqual(Right(null));
      expect(sut.root.childs[0].name).toBe("any");
      expect(sut.root.childs[1].name).toBe("any2");

    })
  })

  describe("findDirectory", () => {
    let sut: FileSystem;

    beforeEach(() => {
      sut = new FileSystem();
    });

    it("should find directory in relative path", () => {
      sut.createDirectory("/any/other/folder", true);
      let newCurrent = sut.root.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent;

      let op = sut.findDirectory("other/folder")
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("folder");
    })

    it("should find directory in absolute path", () => {
      sut.createDirectory("/any/other/folder", true);

      let newCurrent = sut.current.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      newCurrent = sut.current.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> folder

      let op = sut.findDirectory("/any/other")
      expect(isRight(op)).toBe(true);
      let folder = isRight(op) ? op.right : undefined;
      expect(folder?.name).toBe("other");
    })

    it("should return error when folder don't exists", () => {
      sut.createDirectory("/any/other/folder", true);

      let op = sut.findDirectory("/any/other/structure");
      expect(op).toEqual(Left("no such file or directory: /any/other/structure"));
    })

    it("should return error when file exists in place", () => {
      sut.createDirectory("/any/other", true);

      let newCurrent = sut.current.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      newCurrent = sut.current.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> other

      const f1 = newFile("folder");
      sut.current.childs.push(f1);

      let op = sut.findDirectory("/any/other/folder");
      expect(op).toEqual(Left("not a directory: /any/other/folder"));
    })
  })

  describe("listDirectoryContent", () => {
    let sut: FileSystem;

    beforeEach(() => {
      sut = new FileSystem();
    });

    it("should return the directory child when found", () => {
      sut.createDirectory("any");

      let newCurrent = sut.current.childs[0];
      if (newCurrent.type == "file") expect(false).toBe(true);
      else sut.current = newCurrent; // current -> any

      let f1 = newFile("file1");
      sut.current.childs.push(f1);
      let f2 = newFile("file2");
      sut.current.childs.push(f2);
      let f3 = newFile("file3");
      sut.current.childs.push(f3);
      let f4 = newFile("file4");
      sut.current.childs.push(f4);

      let op = sut.listDirectoryContent("/any");
      expect(isRight(op)).toBe(true);
      let list = isRight(op) ? op.right : undefined;
      expect(list).toEqual([f1, f2, f3, f4]);

    })

    it("should return an error when directory not found", () => {
      let op = sut.listDirectoryContent("/any");
      expect(isLeft(op)).toBe(true);
    })

  })

  describe("removeDirectory", () => { })

  describe("insertFile", () => { })

  describe("readFile", () => { })

  describe("removeFile", () => { })
})
