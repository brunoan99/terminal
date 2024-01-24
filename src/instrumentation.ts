import { initiation } from "./config/before_start";

export async function register() {
  initiation();
  console.log("hi from init");
}
