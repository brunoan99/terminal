import { left as Left, right as Right, } from "fp-ts/lib/Either";
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
  })

  describe("findDirectory", () => { })

  describe("listDirectoryContent", () => { })

  describe("removeDirectory", () => { })

  describe("insertFile", () => { })

  describe("readFile", () => { })

  describe("removeFile", () => { })
})
