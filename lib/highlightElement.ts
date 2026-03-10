export function highlightElement(el: HTMLElement) {
  el.classList.add("echly-highlight");

  setTimeout(() => {
    el.classList.remove("echly-highlight");
  }, 2000);
}

