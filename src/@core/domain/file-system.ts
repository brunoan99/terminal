import {
  Either,
  left as Left,
  right as Right,
  isLeft,
  isRight,
} from "fp-ts/lib/Either";
import { IGithubRepository } from "../infra/IGithubRepository";

type FileType = {
  name: string;
  body: string | undefined;
  parent: FolderType | undefined;
  fullyVerified?: boolean;
  type: "file";
};

type FolderType = {
  name: string;
  childs: Map<string, FileType | FolderType>;
  parent: FolderType | undefined;
  fullyVerified?: boolean;
  type: "folder";
};

const newFile = (
  name: string,
  parent: FolderType | undefined = undefined,
  body: string | undefined = undefined,
  fullyVerified: boolean = false
): FileType => ({
  name,
  body,
  parent,
  fullyVerified,
  type: "file",
});

const newFolder = (
  name: string,
  parent: FolderType | undefined = undefined,
  childs: Map<string, FileType | FolderType> = new Map(),
  fullyVerified: boolean = false
): FolderType => ({
  name,
  childs,
  parent,
  fullyVerified,
  type: "folder",
});

const insertOn = (parent: FolderType, elem: FolderType | FileType) => {
  elem.parent = parent;
  let existent = parent.childs.get(elem.name);

  // if no exist in parent, just insert;
  if (!existent) {
    parent.childs.set(elem.name, elem);
    return;
  }

  // if exists and elem is a file than just replace;
  if (elem.type == "file") {
    parent.childs.set(elem.name, elem);
    return;
  }

  // if exists as a file just replace
  // because if elem is a file will replace existent
  // if elem is a folder will replace existent
  if (existent.type == "file") {
    parent.childs.set(elem.name, elem);
    return;
  }

  const newChilds = new Map();
  const fullyVerified: string[] = [];

  // if exists and elem is a folder than should merge childs;
  // first fill with existent
  for (const [name, newElem] of existent.childs.entries()) {
    if (newElem.fullyVerified) fullyVerified.push(name);
    newChilds.set(name, newElem);
  }
  // after it fill with elem
  // cause if both have child with same nam, the final will be
  // the elem child
  for (const [name, newElem] of elem.childs.entries()) {
    if (fullyVerified.includes(name)) continue;
    newChilds.set(name, newElem);
  }
  elem.childs = newChilds;
  parent.childs.set(elem.name, elem);
};

class MemoryFileSystem {
  root: FolderType;
  current: FolderType;

  constructor(private ghRepo: IGithubRepository) {
    this.ghRepo = ghRepo;
    this.root = newFolder("/", undefined, new Map(), true);
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

  getAbsolutePath(path: string): string {
    if (path.startsWith("/")) return path;
    else {
      let splited_path = `${this.currentPath}/${path}`
        .split("/")
        .filter((p) => p !== "" && p !== ".");
      let index = 0;
      while (index < splited_path.length) {
        if (splited_path[index] === "..") {
          splited_path.splice(index - 1, 2);
          continue;
        }
        index++;
      }
      return `/${splited_path.join("/")}`;
    }
  }

  async changeCurrentDirectory(path: string): Promise<Either<string, null>> {
    let findOp = await this.find(path);
    if (isLeft(findOp)) return findOp;
    let element = findOp.right;
    if (!(element.type === "folder")) return Left(`not a directory: ${path}`);
    this.current = element;
    return Right(null);
  }

  private createRecursively(
    path: string,
    elem: FolderType | FileType | undefined
  ) {
    let pathSplited = path.split("/").filter((p) => p !== "." && p !== "");
    let current: FolderType = this.root;

    while (pathSplited.length != 0) {
      let toFind = pathSplited[0];

      let nextCurrent = current.childs?.get(toFind);
      if (nextCurrent === undefined) {
        // there is no folder in path to elem, than it must to be created
        nextCurrent = newFolder(toFind, current);
        insertOn(current, nextCurrent);
      }
      if (nextCurrent.type == "file") {
        // there is no correct solution in this case
        // will proced to replace file to a folder
        current.childs.delete(toFind);
        nextCurrent = newFolder(toFind, current);
        insertOn(current, nextCurrent);
      }
      current = nextCurrent;
      pathSplited.shift();
      continue;
    }
    // only needs to create the path;
    if (!elem) return;
    insertOn(current, elem);
  }

  private createDefault(
    path: string,
    elem: FolderType | FileType | undefined
  ): Either<null, null> {
    let pathSplited = path.split("/").filter((p) => p !== "." && p !== "");
    let current: FolderType = this.root;

    while (pathSplited.length != 0) {
      let toFind = pathSplited[0];

      let nextCurrent = current.childs?.get(toFind);
      if (nextCurrent === undefined) {
        // there is no folder in path to elem
        return Left(null);
      }
      if (nextCurrent.type == "file") {
        // there is a file in path to elem
        return Left(null);
      }
      current = nextCurrent;
      pathSplited.shift();
      continue;
    }
    if (elem) insertOn(current, elem);
    return Right(null);
  }

  async create(
    path: string,
    elem: FolderType | FileType | undefined,
    recursively: boolean = false
  ): Promise<Either<string, null>> {
    if (recursively) {
      // in recursively every single folder not found must to be created
      // and then add the elem
      this.createRecursively(path, elem);
      return Right(null);
    } else {
      // in default if not part isn't found than search entire path on github
      // case exists create and then add the elem
      // to do it create must be called in github search with recursively option
      const mkOp = this.createDefault(path, elem);
      if (isRight(mkOp)) return Right(null);
      return this.getGithubContent(path);
    }
  }

  async remove(
    path: string,
    recursively: boolean = false,
    empty: boolean = false
  ): Promise<Either<string, null>> {
    let findOp = await this.find(path);
    if (isLeft(findOp)) return findOp;

    let elem = findOp.right;
    let parent = elem.parent;

    // if parent is undefined elem is root
    if (parent == undefined && recursively)
      return Left("it is dangerous to operate recursively on '/'");
    if (parent == undefined) return Left("cannot remove '/': Is a directory");

    if (elem.type == "file") {
      parent.childs.delete(elem.name);
      return Right(null);
    } else {
      if (recursively) {
        parent.childs.delete(elem.name);
        return Right(null);
      }
      if (empty) {
        if (elem.childs.size == 0) {
          parent.childs.delete(elem.name);
          return Right(null);
        } else {
          return Left(`cannot remove '${path}': Directory not empty`);
        }
      }
      return Left(`cannot remove '${path}': Is a directory`);
    }
  }

  async find(path: string): Promise<Either<string, FileType | FolderType>> {
    let abs_path = this.getAbsolutePath(path);
    // both "." and "" does not affect the navigation process;
    let pathSplited = abs_path.split("/").filter((p) => p !== "." && p !== "");
    let current: FolderType | FileType = this.root;
    let pastCurrent: FolderType | FileType = this.root;

    while (pathSplited.length != 0) {
      let toFind = pathSplited[0];

      if (current.type == "file") return Left(`not a directory: ${path}`);

      let nextCurrent: FolderType | FileType | undefined =
        current.childs?.get(toFind);
      if (nextCurrent === undefined) {
        const ghOp = await this.getGithubContent(abs_path);
        if (isLeft(ghOp)) return ghOp;
        nextCurrent = current.childs?.get(toFind) as FolderType | FileType;
      }
      pastCurrent = current;
      current = nextCurrent;
      pathSplited.shift();
      continue;
    }
    if (current == undefined) return Left(`no such file or directory: ${path}`);
    if (current.type == "folder" && !current.fullyVerified) {
      await this.getGithubContent(abs_path);
      current = pastCurrent.childs.get(current.name) as FolderType;
    }
    if (current.type == "file" && !current.fullyVerified) {
      await this.getGithubContent(abs_path);
      current = pastCurrent.childs.get(current.name) as FileType;
    }
    return Right(current);
  }

  async listDirectoryContent(
    path: string
  ): Promise<Either<string, Map<string, FileType | FolderType>>> {
    let findOp = await this.find(path);
    if (isLeft(findOp)) return findOp;

    let elem = findOp.right;

    if (elem.type == "folder") return Right(elem.childs);
    return Right(new Map().set(elem.name, elem));
  }

  private async getGithubContent(
    abs_path: string
  ): Promise<Either<string, null>> {
    if (!abs_path.startsWith("/github"))
      return Left(`no such file or directory: ${abs_path}`);
    const splited = abs_path.split("/").filter((p) => p !== "");

    let [_, username, repo, path] = splited;
    let path_str = splited.slice(3).join("/");

    if (path !== undefined && path !== "repository_info.json") {
      // it means that is inside a Repository
      // because for the path to be something username and repo must also be
      let op = await this.ghRepo.getPathContent(username, repo, path_str);
      if (!op) return Left(`cannot find on github`);
      const path_to_include = `/${splited
        .slice(0, splited.length - 1)
        .join("/")}`;
      const name = splited[splited.length - 1];

      if (op.type == "file") {
        const body = Buffer.from(op.content, "base64").toString();
        const nf = newFile(name, undefined, body, true);
        this.create(path_to_include, nf, true);
        return Right(null);
      }

      if (Array.isArray(op)) {
        const nf = newFolder(name, undefined, new Map(), true);
        const childs = new Map();
        for (const obj of op) {
          obj.type == "file"
            ? childs.set(obj.name, newFile(obj.name, nf))
            : childs.set(obj.name, newFolder(obj.name, nf));
        }
        nf.childs = childs;
        this.create(path_to_include, nf, true);
        return Right(null);
      }

      return Left(`cannot process this submit`);
    }
    path = "";

    if (repo !== undefined && repo !== "profile_info.json") {
      // it means is the Repository
      // so it have to get the content and the infos
      let [content, info] = await Promise.all([
        this.ghRepo.getPathContent(username, repo, path),
        this.ghRepo.getRepositoryInformation(username, repo),
      ]);

      if (!content) return Left(`cannot find repo on github`);

      if (!info) return Left(`cannot find repo info on github`);

      const path_to_include = `/github/${username}`;
      const name = repo;
      const nfi = newFile(
        "repository_info.json",
        undefined,
        JSON.stringify(info, null, "  "),
        true
      );
      const nfo = newFolder(name, undefined, new Map(), true);
      let childs: Map<string, FolderType | FileType> = new Map();

      for (const obj of content) {
        obj.type == "file"
          ? childs.set(obj.name, newFile(obj.name, nfo))
          : childs.set(obj.name, newFolder(obj.name, nfo));
      }

      childs.set(nfi.name, nfi);

      nfo.fullyVerified = true;
      nfo.childs = childs;

      this.create(path_to_include, nfo, true);

      return Right(null);
    }
    repo = "";

    if (username !== undefined) {
      // it means is the Profile
      // so it have to get the infos and the repositories
      let page = 1;
      const per_page = 100;
      let info = await this.ghRepo.getUserInformation(username);

      if (!info) return Left(`cannot find user info on github`);

      const path_to_include = "/github";
      const name = username;

      const nfi = newFile(
        "profile_info.json",
        undefined,
        JSON.stringify(info, null, "  "),
        true
      );
      const nfo = newFolder(name, undefined, new Map(), true);
      let childs: Map<string, FolderType | FileType> = new Map();
      let repos: any[] = [];

      do {
        repos = await this.ghRepo.getUserRepositories(username, page, per_page);
        for (const obj of repos) {
          obj.type == "file"
            ? childs.set(obj.name, newFile(obj.name, nfo))
            : childs.set(obj.name, newFolder(obj.name, nfo));
        }
        page++;
      } while (repos.length == per_page);

      nfo.childs = childs;

      this.create(path_to_include, nfo, true);
      this.create(`/github/${username}`, nfi, true);

      return Right(null);
    }
    return Left(`no such file or directory: ${abs_path}`);
  }

  private cascadianAux(elem: FolderType | FileType, acc: number): string {
    if (elem.type == "file") {
      return `${" ".repeat(acc)} .: ${elem.name}`;
    } else {
      let child_str = "";
      for (const c of elem.childs.values()) {
        const str = this.cascadianAux(c, acc + 4);
        child_str += child_str ? `\n${str}` : str;
      }
      child_str = child_str ? `\n${child_str}` : "";
      return `${" ".repeat(acc)} d: ${elem.name}${child_str}`;
    }
  }

  printCascadian() {
    console.log("Cascadian Representation\n", this.cascadianAux(this.root, 0));
  }
}

export { MemoryFileSystem, newFile, newFolder };
export type { FileType, FolderType };
