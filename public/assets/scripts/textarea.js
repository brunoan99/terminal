const tx = document.getElementById("text-area-buffer");
console.log("Text-area: ", tx);
tx.setAttribute("style", "height:" + (tx.scrollHeight) + "px;overflow-y:hidden;");
tx.addEventListener("input", OnInput, false);


function OnInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}
