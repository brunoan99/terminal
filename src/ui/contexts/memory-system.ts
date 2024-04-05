import { MemoryFileSystem, newFile } from "../../@core/domain/file-system";
import { GithubRepository } from "../../@core/infra/GithubRepository";

const insertBinaries = (fs: MemoryFileSystem) => {
  fs.create("/usr/bin", undefined, true);
  fs.create("/usr/bin/cat", newFile("cat"));
  fs.create("/usr/bin/cd", newFile("cd"));
  fs.create("/usr/bin/echo", newFile("echo"));
  fs.create("/usr/bin/ls", newFile("ls"));
  fs.create("/usr/bin/mkdir", newFile("mkdir"));
  fs.create("/usr/bin/pwd", newFile("pwd"));
  fs.create("/usr/bin/rm", newFile("rm"));
  fs.create("/usr/bin/touch", newFile("touch"));
};

const insertGithubDir = (fs: MemoryFileSystem) => {
  fs.create("/github", undefined, true);
};

const insertInfoFile = (fs: MemoryFileSystem) => {
  fs.create(
    "/",
    newFile(
      "info.txt",
      undefined,
      `This project offers a terminal flow experience into navigate through Github

To navigate to a Github profile just use 'cd github/{user}' or to a repository
use 'cd github/{user}/{repo}';

The following commands will work as like in a shell:
  - cat:    Concatenate FILE(s) to standard output;
  - cd:     Change working directory;
  - echo:   Display a line of text;
  - ls:     List information about the FILEs (the current directory by default);
  - mkdir:  Create the DIRECTORY(ies), if they do not already exist;
  - pwd:    Print the full filename of the current working directory;
  - rm:     Remove the FILE(s);
  - touch:  A FILE argument that does not exist is created empty.`,
      true
    )
  );
};

export const createMemorySystem = (): MemoryFileSystem => {
  let ghRepo = new GithubRepository();
  let fs = new MemoryFileSystem(ghRepo);

  insertBinaries(fs);
  insertGithubDir(fs);
  insertInfoFile(fs);

  return fs;
};
