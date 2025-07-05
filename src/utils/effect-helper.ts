import { Either } from "effect";

const Error = Either.left;
const isError = Either.isLeft;

const Ok = Either.right;
const isOk = Either.isRight;

type Result<T, E> = Either.Either<T, E>;

export {
  Error,
  isError,
  Ok,
  isOk
};
export type { Result };

export * from "effect"
