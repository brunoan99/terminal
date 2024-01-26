import { Either, left as Left, right as Right, isLeft } from "fp-ts/lib/Either";
import { IGithubRepository } from "../infra/IGithubRepository";

type FileType = {
  name: string;
  body: string | undefined;
  parent: FolderType;
  type: "file";
};

const newFile = (
  name: string,
  parent: FolderType,
  body: string | undefined = undefined
): FileType => ({
  name,
  body,
  parent,
  type: "file",
});

type FolderType = {
  name: string;
  childs: (FileType | FolderType)[] | undefined;
  parent: FolderType | undefined;
  type: "folder";
};

const newFolder = (
  name: string,
  parent: FolderType | undefined = undefined,
  childs: (FileType | FolderType)[] | undefined
): FolderType => ({
  name,
  childs,
  parent,
  type: "folder",
});

const sortStruct = (
  a: FileType | FolderType,
  b: FileType | FolderType
): number => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
};

const createDirectoryOn = (
  parent: FolderType,
  name: string,
  childs: (FileType | FolderType)[] | undefined
): FolderType => {
  let newF: FolderType = newFolder(name, parent, childs);
  if (parent.childs) {
    parent.childs.push(newF);
    parent.childs.sort(sortStruct);
  } else {
    parent.childs = [newF];
  }
  return newF;
};

const createFileOn = (parent: FolderType, name: string, content?: string) => {
  let newF: FileType = newFile(name, parent, content);
  if (parent.childs) {
    parent.childs.push(newF);
    parent.childs.sort(sortStruct);
  } else {
    parent.childs = [newF];
  }
};

class MemoryFileSystem {
  root: FolderType;
  current: FolderType;

  constructor(private ghRepo: IGithubRepository) {
    this.ghRepo = ghRepo;
    this.root = newFolder("/", undefined, []);
    this.current = this.root;
  }

  get currentPath(): string {
    let current = this.current;
    let path = "";
    while (current.name != "/") {
      let oldPath = path == "" ? path : "/" + path;
      path = current.name + oldPath;
      current = current.parent || this.root;
    }
    return "/" + path;
  }

  getAbsolutePath(path: string): Either<string, string> {
    let op = this.findDirectory(path);
    if (isLeft(op)) return op;
    let current = op.right;
    let computed_path = "";
    while (current.name != "/") {
      let oldPath = computed_path == "" ? computed_path : "/" + computed_path;
      computed_path = current.name + oldPath;
      current = current.parent || this.root;
    }
    return Right("/" + computed_path);
  }

  changeCurrentDirectory(path: string): Either<string, null> {
    let findOp = this.findDirectory(path);
    if (isLeft(findOp)) return findOp;
    let folder = findOp.right;
    this.current = folder;
    return Right(null);
  }

  createDirectory(
    path: string,
    parents: boolean = false,
    childs: (FileType | FolderType)[] | undefined
  ): Either<string, null> {
    let pathSplited = path.split("/");
    let currentNav: FolderType;
    if (path.startsWith("/")) {
      currentNav = this.root;
      pathSplited.shift(); // when split left side of '/' becomes '' in array
    } else {
      currentNav = this.current;
    }

    while (pathSplited) {
      let toFind = pathSplited[0];
      if (toFind === "." && pathSplited.length === 1) {
        // '.' is always existent
        return Left(`cannot create directory ‘${path}’: File exists`);
      } else if (toFind === ".") {
        pathSplited.shift();
        continue;
      }
      if (toFind === "..") {
        // '..' represents parent folder
        currentNav = currentNav.parent || this.root;
        pathSplited.shift();
        continue;
      }
      let child = currentNav.childs?.find((c) => c.name == toFind);

      if (child && pathSplited.length === 1) {
        // exists in the place of folder to be created and its a file
        return Left(`cannot create directory ‘${path}’: File exists`);
      } else if (child?.type == "file") {
        // exists in the middle of the path to folder to be created and its a file
        return Left(`cannot create directory ‘${path}’: Not a directory`);
      } else if (child) {
        // exists and its a folder
        currentNav = child;
        pathSplited.shift();
        continue;
      } else if (!child && pathSplited.length == 1) {
        // not exists and needs to be created cause its folder
        createDirectoryOn(currentNav, toFind, childs);
        return Right(null);
      } else if (!child && parents) {
        // not exists and needs to be created cause parents option on
        let newChild = createDirectoryOn(currentNav, toFind, childs);
        currentNav = newChild;
        pathSplited.shift();
        continue;
      } else {
        // not exists and parents option off
        return Left(
          `cannot create directory ‘${path}’: No such file or directory`
        );
      }
    }

    return Left(`cannot create directory ‘${path}’: File exists`);
  }

  findDirectory(path: string): Either<string, FolderType> {
    let pathSplited = path.split("/");
    let currentNav: FolderType;
    if (path.startsWith("/")) {
      currentNav = this.root;
      pathSplited.shift(); // when split left side of '/' becomes '' in array
    } else {
      currentNav = this.current;
    }

    while (pathSplited) {
      let toFind = pathSplited[0];
      if ((toFind === "." || toFind === "") && pathSplited.length === 1) {
        return Right(currentNav);
      }
      if (toFind === "." || toFind === "") {
        pathSplited.shift();
        continue;
      }
      if (toFind === ".." && pathSplited.length === 1) {
        return Right(currentNav.parent || this.root);
      }
      if (toFind === "..") {
        currentNav = currentNav.parent || this.root;
        pathSplited.shift();
        continue;
      }

      let child = currentNav.childs?.find((c) => c.name == toFind);

      if (child?.type == "folder" && pathSplited.length === 1) {
        // exists in place and must be returned
        return Right(child);
      } else if (child?.type == "folder") {
        // exists in the middle of the path to folder to be find
        currentNav = child;
        pathSplited.shift();
        continue;
      } else if (child?.type == "file") {
        // exists in path to folder to be find and its a file
        return Left(`not a directory: ${path}`);
      } else {
        // not exists
        return Left(`no such file or directory: ${path}`);
      }
    }
    return Left(`no such file or directory: ${path}`);
  }

  async listDirectoryContent(
    path: string
  ): Promise<Either<string, (FileType | FolderType)[]>> {
    // console.log("Listing on Directory: ", path);
    let findOp = this.findDirectory(path);
    if (isLeft(findOp)) return findOp;

    let folder = findOp.right;

    // if (path == "actions") console.log("Folder: ", folder);
    // if (path == "actions") console.log("Childs: ", folder.childs);

    if (folder.childs !== undefined) return Right(folder.childs);

    let current = folder;
    let computed_path = "";
    while (current.name != "/") {
      let oldPath = computed_path == "" ? computed_path : "/" + computed_path;
      computed_path = current.name + oldPath;
      current = current.parent || this.root;
    }
    computed_path = "/" + computed_path;

    // console.log("Will check Github on Directory: ", computed_path);

    if (computed_path.startsWith("/github")) {
      let [_1, _2, username, repo, ...rest] = computed_path.split("/");
      let path = rest.join("/");
      // let struct = await this.ghRepo.getFolderContent(username, repo, path);
      // console.log(struct);
    }
    return Right([]);
  }

  createFile(path: string, content: string): Either<string, null> {
    let pathSplited = path.split("/");
    let currentNav: FolderType;
    if (path.startsWith("/")) {
      currentNav = this.root;
      pathSplited.shift(); // when split left side of '/' becomes '' in array
    } else {
      currentNav = this.current;
    }

    while (pathSplited) {
      let toFind = pathSplited[0];
      if (toFind === "." && pathSplited.length === 1) {
        // '.' is always existent
        return Left(`cannot create ‘${path}’: File exists`);
      } else if (toFind === ".") {
        pathSplited.shift();
        continue;
      }
      if (toFind === "..") {
        // '..' represents parent folder
        currentNav = currentNav.parent || this.root;
        pathSplited.shift();
        continue;
      }
      let child = currentNav.childs?.find((c) => c.name == toFind);

      if (child && pathSplited.length === 1) {
        // exists in the place of folder to be created and its a file
        return Left(`cannot create ‘${path}’: File exists`);
      } else if (child?.type == "file") {
        // exists in the middle of the path to folder to be created and its a file
        return Left(`cannot create ‘${path}’: Not a directory`);
      } else if (child) {
        // exists and its a folder
        currentNav = child;
        pathSplited.shift();
        continue;
      } else if (!child && pathSplited.length == 1) {
        // not exists and needs to be created cause its file
        createFileOn(currentNav, toFind, content);
        return Right(null);
      } else {
        // not exists
        return Left(`cannot create ‘${path}’: No such file or directory`);
      }
    }

    return Left(`cannot create ‘${path}’: No such file or directory`);
  }

  findFile(path: string): Either<string, FileType> {
    let pathSplited = path.split("/");
    let currentNav: FolderType;
    if (path.startsWith("/")) {
      currentNav = this.root;
      pathSplited.shift();
    } else {
      currentNav = this.current;
    }

    while (pathSplited) {
      let toFind = pathSplited[0];
      if (toFind === ".") return Left(`${path}: Is a directory`);
      if (toFind === "..") return Left(`${path}: Is a directory`);
      if (toFind === "") {
        pathSplited.shift();
        continue;
      }

      let child = currentNav.childs?.find((c) => c.name == toFind);

      if (child?.type === "file" && pathSplited.length === 1) {
        return Right(child);
      } else if (child?.type === "folder" && pathSplited.length === 1) {
        return Left(`${path}: Is a directory`);
      } else if (child?.type === "folder") {
        currentNav = child;
        pathSplited.shift();
        continue;
      } else if (child?.type === "file") {
        // exists in path to folder to be find and its a file
        return Left(`cannot remove '${path}': Not a directory`);
      } else {
        return Left(`cannot remove  ‘${path}’: No such file or directory`);
      }
    }

    return Left(`'${path}': No such file or directory`);
  }

  remove(
    path: string,
    recursively: boolean,
    empty: boolean
  ): Either<string, null> {
    if (path === "/")
      return Left(`it is dangerous to operate recursively on '/'`);

    let pathSplited = path.split("/");
    let currentNav: FolderType;
    if (path.startsWith("/")) {
      currentNav = this.root;
      pathSplited.shift(); // when split left side of '/' becomes '' in array
    } else {
      currentNav = this.current;
    }

    while (pathSplited) {
      let toFind = pathSplited[0];
      if (toFind === ".")
        return Left(
          `refusing to remove '.' or '..' directory: skipping '${path}'`
        );
      if (toFind === "..")
        return Left(
          `refusing to remove '.' or '..' directory: skipping '${path}'`
        );
      if (toFind === "") {
        pathSplited.shift();
        continue;
      }

      let child = currentNav.childs?.find((c) => c.name == toFind);

      if (child?.type === "folder" && pathSplited.length === 1) {
        let name = child.name;
        if (child.childs?.length === 0 && empty)
          child.parent?.childs?.filter((c) => c.name != name);
        if (recursively) return Left(`cannot remove '${name}': Is a directory`);
        child.parent?.childs?.filter((c) => c.name != name);
        return Right(null);
      } else if (child?.type === "file" && pathSplited.length === 1) {
        let name = child.name;
        child.parent?.childs?.filter((c) => c.name != name);
        return Right(null);
      } else if (child?.type === "folder") {
        currentNav = child;
        pathSplited.shift();
        continue;
      } else if (child?.type === "file") {
        // exists in path to folder to be find and its a file
        return Left(`cannot remove '${path}': Not a directory`);
      } else {
        return Left(`cannot remove  ‘${path}’: No such file or directory`);
      }
    }

    return Left(`cannot remove  ‘${path}’: No such file or directory`);
  }
}

export { MemoryFileSystem, newFile, newFolder };
export type { FileType, FolderType };

/*

// File System

~ -> |  workspace ->  |  js  ->  |  pomodoro
                                 |  blog
                                 |  terminal
                      -----------------------
                      |  rust   ->  | git-check-cli
                                    | process-test
                                    | data-structures
                      --------------------------------
                      |  go ->  | adoptiong go
                      -------------------------
     |  pictures
     |  videos
     |  documents
     |  downloads
     |  musics

*/
