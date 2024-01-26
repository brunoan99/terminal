const envs = [
  { name: "GITHUB_ADDRESS", source: process.env.NEXT_PUBLIC_GITHUB_ADDRESS },
  { name: "GITHUB_TOKEN", source: process.env.NEXT_PUBLIC_GITHUB_TOKEN },
];

const checkEnvs = (): Error[] =>
  envs
    .map((env) => (env.source ? null : new Error(`${env.name}, Not provided`)))
    .filter((error) => error != null) as Error[];

export { checkEnvs };
