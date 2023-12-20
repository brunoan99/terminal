type Env = string;
type EnvSet = { [key: string]: Env };

class Environment {
  public envSet: EnvSet = {};

  constructor() {}

  get set(): EnvSet {
    return this.envSet;
  }

  change(name: string, value: string): void {
    this.envSet[name] = value;
  }

  contains(name: string): boolean {
    return this.envSet[name] !== undefined;
  }

  getEnv(name: string): Env {
    return this.envSet[name] || "";
  }
}

export { Environment };
export type { Env, EnvSet };
