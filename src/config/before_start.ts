import { checkEnvs } from "./env";

function stopApp() {
  console.log("Cause of error, app will be stopped");
  process.exit(0);
}

function initiation() {
  console.log("Performing Env Check");

  let errors = checkEnvs();
  errors.map((error: Error) => console.error(error.message));
  if (errors.length !== 0) stopApp();

  console.log("Env Check Ended");
}

export { initiation };
