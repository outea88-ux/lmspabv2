const el = document.getElementById("overlay") as HTMLDivElement;

export function showOverlay(html: string): void {
  el.innerHTML = html;
  el.classList.add("visible");
  el.scrollTop = 0;
  const scroll = el.querySelector(".overlay-scroll");
  if (scroll) scroll.scrollTop = 0;
}

export function hideOverlay(): void {
  el.classList.remove("visible");
  el.innerHTML = "";
}

export function overlayRoot(): HTMLDivElement {
  return el;
}
