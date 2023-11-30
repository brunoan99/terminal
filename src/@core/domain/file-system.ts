import { Either, left as Left, right as Right, isLeft, isRight } from "fp-ts/lib/Either";

type FileType = {
  name: string,
  body: string | undefined,
  type: "file",
}

const newFile = (
  name: string,
  body: string | undefined,): FileType => ({
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
  parent?: FolderType,
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
    this.current = this.root
  }



  get currentPath(): string {
    throw new Error("method not implemented yet")
  }

  changeCurrentDirectory(path: string): Either<string, null> {
    return Left("method not implemented yet")
  }

  private createDirectoryAbsolute(path: string, parents: boolean): Either<string, null> {
    return Left("method not implemented yet")
  }

  private createDirectoryRelative(path: string, parents: boolean): Either<string, null> {
    if (path.split("/").length < 2) {
      createDirectoryOn(this.current, path);
      return Right(null);
    }

    let pathSplited = path.split("/");
    let currentNav: FolderType = this.current;
    while (pathSplited) {
      let toFind = pathSplited[0];
      let child = currentNav.childs.find((c) => c.name == toFind);

      if (child && child.type == "file") {
        // exists and its a file
        return Left(`cannot create directory ‘${path}’: Not a directory`);
      } else if (child) {
        // exists and its a folder
        currentNav = child;
        pathSplited.shift();
        continue;
      } else if (child == undefined && pathSplited.length == 1) {
        // not exists and needs to be created cause its folder
        createDirectoryOn(currentNav, toFind);
        return Right(null);
      } else if (child == undefined && parents) {
        // not exists and needs to be created cause parents option on
        let newC = createDirectoryOn(currentNav, toFind);
        currentNav = newC;
        pathSplited.shift();
        continue;
      } else {
        // not exists and parents option off
        return Left(`cannot create directory ‘${path}’: No such file or directory`);
      }
    }

    return Left(`cannot create directory ‘${path}’: File exists`);
  }

  createDirectory(path: string, parents: boolean = false): Either<string, null> {
    if (path.startsWith("/")) return this.createDirectoryAbsolute(path, parents);
    return this.createDirectoryRelative(path, parents);
  }

  findDirectory(path: string): Either<string, FolderType> {
    return Left("method not implemented yet")
  }

  listDirectoryContent(path: string): Either<string, FolderType> {
    return Left("method not implemented yet")
  }

  removeDirectory(path: string): Either<string, null> {
    return Left("method not implemented yet")
  }

  insertFile(path: string, content: string): Either<string, null> {
    return Left("method not implemented yet")
  }

  readFile(path: string): Either<string, string> {
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
