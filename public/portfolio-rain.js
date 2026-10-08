"use strict";
const toggle = document.querySelector('.motion-toggle');
let paused = false;
try { paused = localStorage.getItem('portfolio-background-paused') === 'true'; } catch {}
function render() {
 document.body.classList.toggle('background-paused', paused);
 toggle.setAttribute('aria-pressed', String(paused));
 toggle.textContent = paused ? 'Resume background' : 'Pause background';
}
render();
toggle.addEventListener('click', () => {
 paused = !paused;
 render();
 try { localStorage.setItem('portfolio-background-paused', String(paused)); } catch {}
});

const backdrop = document.querySelector('.code-background');
const glyphs = '01{}[]<>/+=*;:abcdefxyz';
const random = (min, max) => min + Math.random() * (max - min);
function styleDrop(drop, width, firstRun) {
 drop.style.left = random(1, Math.max(2, width - 13)) + 'px';
 if (firstRun) {
  const duration = random(10, 21);
  drop.style.setProperty('--duration', duration + 's');
  drop.style.setProperty('--delay', -random(0, duration) + 's');
 }
 drop.style.setProperty('--drift', random(-9, 9) + 'px');
 drop.style.opacity = random(.13, .3);
 drop.replaceChildren();
 const length = Math.floor(random(5, 15));
 for (let i = 0; i < length; i++) {
  const chance = Math.random();
  const char = document.createElement(chance < .18 ? 'b' : chance < .3 ? 'em' : 'span');
  char.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
  char.style.opacity = .2 + .8 * (i / (length - 1));
  drop.append(char);
 }
}
function buildRain() {
 backdrop.replaceChildren();
 for (let side = 0; side < 2; side++) {
  const rail = document.createElement('div');
  rail.className = 'code-rail';
  backdrop.append(rail);
  const width = rail.clientWidth;
  const count = Math.min(50, Math.max(2, Math.round(width * innerHeight / 13000)));
  for (let i = 0; i < count; i++) {
   const drop = document.createElement('span');
   drop.className = 'rain-drop';
   styleDrop(drop, width, true);
   drop.addEventListener('animationiteration', () => styleDrop(drop, rail.clientWidth, false));
   rail.append(drop);
  }
 }
}
buildRain();
let resizeTimer;
window.addEventListener('resize', () => {
 clearTimeout(resizeTimer);
 resizeTimer = setTimeout(buildRain, 150);
});
document.addEventListener('visibilitychange', () => {
 backdrop.classList.toggle('rain-hidden', document.hidden);
});
