import { Result, Ok, Error } from "../../utils/effect-helper"

type File = {
  name: string;
  body: string | undefined;
  parent: Root | Folder;
  fullyVerified: boolean;
  type: "file";
};

type Folder = {
  name: string;
  childs: Map<string, Node>;
  parent: Root | Folder;
  fullyVerified: boolean;
  type: "folder";
};

type Root = {
  childs: Map<string, Node>;
  type: "root";
}

type Node = Folder | File;

const newFile = (
  name: string,
  parent: Root | Folder,
  body: string | undefined = undefined,
  fullyVerified: boolean = false
): File => ({
  name,
  parent,
  body,
  fullyVerified,
  type: "file"
})

const newFolder = (
  name: string,
  parent: Root | Folder,
  childs: Map<string, File | Folder> | undefined = undefined,
  fullyVerified: boolean = false,
): Folder => ({
  name,
  parent,
  childs: childs === undefined ? new Map<string, Node>() : childs,
  fullyVerified,
  type: "folder"
})

const genRoot = (): Root => ({
  type: "root",
  childs: new Map<string, Node>(),
})

const insertNodeOn = (parent: Folder, elem: Node): Result<null, string> => {
  let ExistsChildWithSameName = parent.childs.get(elem.name);
  if (ExistsChildWithSameName) {
    return Error("parent already has child with the element name")
  } else {
    elem.parent = parent;
    parent.childs.set(elem.name, elem);
    return Ok(null);
  }
}

class NewMemoryFileSystem {
  root: Root;
  // the current path control should be with the shell. So the functions
  // currentPath, getAbsolutePath and changeCurrentDirectory will not be here
  // but in the shell

  constructor() {
    this.root = genRoot();
  }

  private checkNodeType(node: Node, expected: "file" | "folder"): Result<null, string> {
    if (node.type == expected) {
      return Ok(null);
    } else {
      return Error(`the ${node.name} has type ${node.type} and the expected type was ${expected}`);
    }
  }

  private createRecursively(path: string, elem: Node) {
    // No path -> Error
    //  - create until
    // Navigate until reach path
    //  - if path end is a file -> Error
    //  - if already a file on the path with elem.name -> Error
  }

  private createNonRecursively(path: string, elem: Node) {
    // No path -> Error
    // Navigate until reach path
    //  - if path end is a file -> Error
    //  - if already a file on the path with elem.name -> Error
  }


  async create(path: string, elem: Node, recursively: boolean = false): Promise<Result<null, string>> {
    if (recursively) {
      this.createRecursively(path, elem);
    } else {
      this.createNonRecursively(path, elem);
    }
    return Ok(null);
  }
}

export { NewMemoryFileSystem }
