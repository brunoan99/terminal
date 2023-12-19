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

/*
  Change scroll position to follow new output lines
*/
const tm = document.getElementById("terminal");

function scrollTotal() {
  tm.scrollTop = tm.scrollHeight;
}

let observer = new MutationObserver(function() {
  scrollTotal();
})
let observerConfig = { childList: true, subtree: true };
observer.observe(tm, observerConfig);

