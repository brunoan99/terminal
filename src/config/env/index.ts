const envs = [
  { name: "GITHUB_ADDRESS", source: process.env.GITHUB_ADDRESS },
  { name: "GITHUB_TOKEN", source: process.env.GITHUB_TOKEN },
  { name: "LOCAL_ADDRESS", source: process.env.NEXT_PUBLIC_LOCAL_ADDRESS },
];

const checkEnvs = (): Error[] =>
  envs
    .map((env) => (env.source ? null : new Error(`${env.name}, Not provided`)))
    .filter((error) => error != null) as Error[];

export { checkEnvs };
