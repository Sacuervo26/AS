const world = document.querySelector<HTMLElement>('.alma-world');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const scenes = Array.from(world?.querySelectorAll<HTMLElement>('.alma-world__image') ?? []).map((layer, index) => ({
  layer,
  section: layer.dataset.scene ? document.getElementById(layer.dataset.scene) : null,
  source: layer.dataset.source,
  ready: index === 0,
  start: Infinity,
  end: Infinity,
  opacity: index === 0 ? 1 : 0,
}));

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
  if (previous !== next) {
    previous = next;
    world?.style.setProperty('--alma-image-position', `${next.toFixed(4)}%`);
  }

  // Leave the previous scene opaque beneath the incoming one: no dark dip.
  let base = 0;
  let overlay = -1;
  let blend = 0;
  for (let index = 1; index < scenes.length; index++) {
    const scene = scenes[index];
    const finish = reduce.matches ? (scene.start + scene.end) / 2 : scene.end;
    if (scrolled >= finish) {
      if (scene.ready) base = index;
      continue;
    }
    if (!reduce.matches && scene.ready && scrolled >= scene.start) {
      const t = Math.min(1, (scrolled - scene.start) / (scene.end - scene.start));
      overlay = index;
      blend = t * t * (3 - 2 * t);
    }
    break;
  }
  scenes.forEach((scene, index) => {
    const opacity = index === base ? 1 : index === overlay ? blend : 0;
    if (opacity === scene.opacity) return;
    scene.opacity = opacity;
    scene.layer.style.opacity = String(opacity);
  });
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
  let previousEnd = 0;
  scenes.forEach(scene => {
    if (!scene.section) return;
    const sectionStart = scene.section.getBoundingClientRect().top + scrollY;
    const halfFade = height * 0.23;
    const midpoint = sectionStart - height * 0.46;
    scene.start = Math.min(scrollRange, Math.max(midpoint - halfFade, previousEnd));
    scene.end = Math.min(scrollRange, Math.max(midpoint + halfFade, scene.start + 1));
    previousEnd = scene.end;
  });
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
  for (const scene of scenes) {
    if (!scene.source || !scene.section) continue;
    const image = new Image();
    image.fetchPriority = 'low';
    image.onload = async () => {
      try { await image.decode(); } catch { /* onload already succeeded */ }
      scene.layer.style.backgroundImage = `url("${scene.source}")`;
      scene.ready = true;
      request();
    };
    image.src = scene.source;
  }
}
