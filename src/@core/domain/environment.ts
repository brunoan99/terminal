class Env {
  constructor(public name: string, public value: string) {}
}

class EnvSet {
  constructor(public envs: Env[]) {}

  contains(name: string): Env | undefined {
    return this.envs.find((a) => (a.name === name ? a : undefined));
  }
}

class Var {
  constructor(public name: string, public value: string) {}
}

class VarSet {
  constructor(public vars: Var[]) {}

  contains(name: string): Var | undefined {
    return this.vars.find((a) => (a.name === name ? a : undefined));
  }
}

export { Env, EnvSet, Var, VarSet };
