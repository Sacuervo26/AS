const world = document.querySelector<HTMLElement>('.alma-world');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

const MAX_RATE = 0.18; // At most 18px of background per 100px of page scroll.
const MAX_VIEWPORT_TRAVEL = 0.48;
const BACKGROUND_RATIO = 3 / 2;
const INITIAL_POSITION = 0.15;

let frame = 0;
let start = 0;
let available = 0;
let scrollRange = 1;
let rate = 0;
let previous = -1;

const render = () => {
  frame = 0;
  const scrolled = Math.max(0, Math.min(scrollY, scrollRange));
  const offset = start + (reduce.matches ? 0 : scrolled * rate);
  const next = available > 0 ? (offset / available) * 100 : 0;
  if (previous === next) return;
  previous = next;
  world?.style.setProperty('--alma-image-position', `${next.toFixed(4)}%`);
};

const request = () => {
  if (!frame) frame = requestAnimationFrame(render);
};

const measure = () => {
  const width = world?.clientWidth || document.documentElement.clientWidth;
  const height = world?.clientHeight || innerHeight;
  // A small overscan keeps vertical travel available on tall mobile screens.
  const imageHeight = Math.max(width * BACKGROUND_RATIO, height * 1.18);
  world?.style.setProperty('--alma-image-height', `${imageHeight}px`);
  available = Math.max(0, imageHeight - height);
  start = available * INITIAL_POSITION;
  scrollRange = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
  rate = Math.min(MAX_RATE, height * MAX_VIEWPORT_TRAVEL / scrollRange, (available - start) / scrollRange);
  request();
};

if (world) {
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.visualViewport?.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  reduce.addEventListener('change', request);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  measure();
}
