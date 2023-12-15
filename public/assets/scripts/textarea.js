/*
  Change element height to exand when Text area get new rows.
*/
function OnInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}
function ScrollTerminal() {
  const t = document.getElementById("terminal");
  t.scroll({ top: Number.MAX_SAFE_INTEGER });
}
const tx = document.getElementById("text-area-buffer");
tx.setAttribute("style", "height:" + (tx.scrollHeight) + "px;overflow-y:hidden;");
tx.addEventListener("input", OnInput, false);
tx.addEventListener("keyup", ScrollTerminal, false);
