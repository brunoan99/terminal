import { Either, left as Left, right as Right, isLeft, isRight } from "fp-ts/lib/Either";

type FileType = {
  name: string,
  body: string | undefined,
  type: "file",
}

const newFile = (
  name: string,
  body: string | undefined = undefined
): FileType => ({
  name,
  body,
  type: "file"
})

type FolderType = {
  name: string,
  childs: (FileType | FolderType)[],
  parent: FolderType | undefined,
  type: "folder",
}

const newFolder = (
  name: string,
  parent: FolderType | undefined = undefined,
  childs: (FileType | FolderType)[] = [],
): FolderType => ({
  name,

  childs,
  parent,
  type: "folder"
})

const sortStruct = (a: (FileType | FolderType), b: (FileType | FolderType)): number => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}

const createDirectoryOn = (parent: FolderType, name: string): FolderType => {
  let newF: FolderType = newFolder(name, parent);
  parent.childs.push(newF);
  parent.childs.sort(sortStruct)
  return newF;
}

class FileSystem {
  root: FolderType;
  current: FolderType;

  constructor() {
    this.root = newFolder("/");
    this.current = this.root;
  }

  get currentPath(): string {
    throw new Error("method not implemented yet");
  }

  changeCurrentDirectory(path: string): Either<string, null> {
    return Left("method not implemented yet");
  }

  createDirectory(path: string, parents: boolean = false): Either<string, null> {
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
      let child = currentNav.childs.find((c) => c.name == toFind);

      if (child && pathSplited.length === 1) {
        // exists in the place of folder to be created and its a file
        return Left(`cannot create directory ‘${path}’: File exists`);
      } else if (child && child.type == "file") {
        // exists in the middle of the path to folder to be created and its a file
        return Left(`cannot create directory ‘${path}’: Not a directory`);
      } else if (child) {
        // exists and its a folder
        currentNav = child;
        pathSplited.shift();
        continue;
      } else if (typeof child === "undefined" && pathSplited.length == 1) {
        // not exists and needs to be created cause its folder
        createDirectoryOn(currentNav, toFind);
        return Right(null);
      } else if (typeof child === "undefined" && parents) {
        // not exists and needs to be created cause parents option on
        let newChild = createDirectoryOn(currentNav, toFind);
        currentNav = newChild;
        pathSplited.shift();
        continue;
      } else {
        // not exists and parents option off
        return Left(`cannot create directory ‘${path}’: No such file or directory`);
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
      let child = currentNav.childs.find((c) => c.name == toFind);

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
        return Left(`no such file or directory: ${path}`);
      }
    }
    return Left(`no such file or directory: ${path}`);
  }

  listDirectoryContent(path: string): Either<string, (FileType | FolderType)[]> {
    let folderOp = this.findDirectory(path)
    if (isLeft(folderOp)) return folderOp;
    let folder = folderOp.right;
    return Right(folder.childs);
  }

  removeDirectory(path: string): Either<string, null> {
    return Left("method not implemented yet")
  }

  createFile(path: string, content: string): Either<string, null> {
    return Left("method not implemented yet")
  }

  findFile(path: string): Either<string, string> {
    return Left("method not implemented yet")
  }

  removeFile(path: string): Either<string, null> {
    return Left("method not implemented yet")
  }


}

export { FileSystem, newFile, newFolder }
export type { FileType, FolderType }

/*

// File System



~ -> |  workspace ->  |  js  ->  |  pomodoro
                                 |  blog
                                 |  terminal
                                 ------------
                      |  rust   ->  | git-check-cli
                                    | process-test
                                    | data-structures
                                    ------------------
                      |  elixir ->  | adoptiong elixir
                                    ------------------
     |  pictures
     |  videos
     |  documents
     |  downloads
     |  musics




*/
