import { MemoryFileSystem, newFile } from "../../@core/domain/file-system";
import { GithubRepository } from "../../@core/infra/GithubRepository";

export const createMemorySystem = (): MemoryFileSystem => {
  let ghRepo = new GithubRepository();
  let file_system = new MemoryFileSystem(ghRepo);

  file_system.create("/any/folder", undefined, true);
  file_system.create("/usr/bin", undefined, true);
  file_system.create("/github", undefined, true);
  file_system.create(
    "/",
    newFile(
      "info.txt",
      undefined,
      `A terminal flow-like browsing experience through Github

To navigate to a Github profile just use 'cd github/{user}'

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

  return file_system;
};
