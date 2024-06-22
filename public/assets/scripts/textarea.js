/*
  Change scroll position to follow new output lines
*/
const tm = document.getElementById("inner");

function scrollTotal() {
  tm.scrollTop = tm.scrollHeight;
}

let observer = new MutationObserver(function() {
  scrollTotal();
})
let observerConfig = { childList: true, subtree: true };
observer.observe(tm, observerConfig);

