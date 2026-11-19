const world = document.querySelector<HTMLElement>('.alma-world');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;
let scrollRange = 1;
let previous = -1;
const render = () => {
  frame = 0;
  const next = reduce.matches ? 0 : Math.max(0, Math.min(1, scrollY / scrollRange));
  if (Math.abs(next - previous) < .0005 && next !== 0 && next !== 1) return;
  previous = next;
  world?.style.setProperty('--alma-image-position', `${(next * 100).toFixed(3)}%`);
};
const request = () => {
  if (!frame) frame = requestAnimationFrame(render);
};
const measure = () => {
  scrollRange = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
  request();
};
if (world) {
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  reduce.addEventListener('change', request);
  new ResizeObserver(measure).observe(document.body);
  measure();
}
