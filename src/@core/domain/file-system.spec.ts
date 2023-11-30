import { left as Left, right as Right, } from "fp-ts/lib/Either";
import { FileSystem, newFolder } from "./file-system";

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

    /*

    mkdir foo
          |- create on current

    mkdir -p foo/bar/baz/qux
             |----create---| on current

    mkdir /home/snape/workspace/js/terminal/newfolder
          |-------------exists-------------|-create-| on root

    mkdir /home/snape/workspace/js/new-project/foo/bar/baz/qux
          |---------exists--------| error:
            cannot create directory '/home/snape/workspace/js/new-project/foo/bar/baz/qux': No such file or directory

    mkdir -p /home/snape/workspace/js/new-project/foo/bar/baz/qux
             |---------exists--------|----------create----------| on root

    */

    it("should insert it in relative path", () => {
      let op = sut.createDirectory("any");
      expect(op).toEqual(Right(null));
      let root = sut.root;
      let current = sut.current;
      let f1 = newFolder("any", current);
      expect(current.childs).toEqual([f1]);
      expect(root.childs).toEqual([f1]);
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
      sut.createDirectory("/any")
    })

    it("should insert it and parents in absolute path", () => {

    })
  })

  describe("findDirectory", () => { })

  describe("listDirectoryContent", () => { })

  describe("removeDirectory", () => { })

  describe("insertFile", () => { })

  describe("readFile", () => { })

  describe("removeFile", () => { })
})
