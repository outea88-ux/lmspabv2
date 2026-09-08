/**
 * Makes a banner header float above its scroll container and slide out of
 * view when the user scrolls down, sliding back in on scroll-up or near top.
 */
export function initAutoHideHeader(bannerSelector: string, scrollSelector: string): void {
  const banner = document.querySelector<HTMLElement>(bannerSelector);
  const scroll = document.querySelector<HTMLElement>(scrollSelector);
  if (!banner || !scroll) return;

  const bannerHeight = banner.offsetHeight;
  scroll.style.paddingTop = `${bannerHeight}px`;

  let lastScrollTop = 0;
  let hidden = false;
  const threshold = 8;
  const showAtTop = 24;

  scroll.addEventListener(
    "scroll",
    () => {
      const top = scroll.scrollTop;

      if (top <= showAtTop) {
        if (hidden) {
          banner.style.transform = "translateY(0)";
          hidden = false;
        }
        lastScrollTop = top;
        return;
      }

      const delta = top - lastScrollTop;
      if (delta > threshold && !hidden) {
        banner.style.transform = `translateY(-${bannerHeight}px)`;
        hidden = true;
      } else if (delta < -threshold && hidden) {
        banner.style.transform = "translateY(0)";
        hidden = false;
      }
      lastScrollTop = top;
    },
    { passive: true },
  );
}
