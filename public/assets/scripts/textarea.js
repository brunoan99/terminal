/*
  Change element height to exand when Text area get new rows.
*/
function OnInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}
const tx = document.getElementById("text-area-buffer");
tx.setAttribute("style", "height:" + (tx.scrollHeight) + "px;overflow-y:hidden;");
tx.addEventListener("input", OnInput, false);

