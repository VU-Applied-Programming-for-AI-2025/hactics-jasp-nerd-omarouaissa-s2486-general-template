// effects.js
// Yellow dim light follows mouse, and click sound on click

// --- Mouse-following yellow light effect ---
const mouseLight = document.createElement('div');
mouseLight.id = 'mouse-light';
// Add a small dot in the center of the light
const mouseDot = document.createElement('div');
mouseDot.id = 'mouse-dot';
mouseLight.appendChild(mouseDot);
document.body.appendChild(mouseLight);

// Style the light (also add fallback in CSS)
mouseLight.style.position = 'fixed';
mouseLight.style.pointerEvents = 'none';
mouseLight.style.zIndex = '9999';
mouseLight.style.width = '50px';
mouseLight.style.height = '50px';
mouseLight.style.borderRadius = '50%';
mouseLight.style.background = 'radial-gradient(circle, rgba(255,230,102,0.22) 0%, rgba(255,230,102,0.10) 60%, rgba(255,230,102,0.01) 100%)';
mouseLight.style.mixBlendMode = 'screen';
mouseLight.style.transition = 'opacity 0.2s';
mouseLight.style.opacity = '0.85';
mouseLight.style.left = '0px';
mouseLight.style.top = '0px';
mouseLight.style.transform = 'translate(-50%, -50%)';

// Style the dot
mouseDot.style.position = 'absolute';
mouseDot.style.pointerEvents = 'none';
mouseDot.style.width = '8px';
mouseDot.style.height = '8px';
mouseDot.style.borderRadius = '50%';
mouseDot.style.background = 'rgba(255, 255, 255, 0.8)';
mouseDot.style.left = '50%';
mouseDot.style.top = '50%';
mouseDot.style.transform = 'translate(-50%, -50%)';

// Move the light with the mouse
window.addEventListener('mousemove', function(e) {
  mouseLight.style.left = e.clientX + 'px';
  mouseLight.style.top = e.clientY + 'px';
  mouseLight.style.opacity = '0.85';
});
window.addEventListener('mouseleave', function() {
  mouseLight.style.opacity = '0';
});
window.addEventListener('mouseenter', function() {
  mouseLight.style.opacity = '0.85';
});

// --- Click sound effect and light flash ---
const clickAudio = new Audio('images/click.mp3');
clickAudio.preload = 'auto';

window.addEventListener('mousedown', function(e) {
  // Only play for left/middle/right click, not for keyboard
  if (e.button === 0 || e.button === 1 || e.button === 2) {
    // Clone to allow overlapping clicks
    const sound = clickAudio.cloneNode();
    sound.volume = 0.18;
    sound.play();
    // Flash the light
    mouseLight.style.transition = 'none';
    mouseLight.style.opacity = '1';
    mouseLight.style.boxShadow = '0 0 80px 40px #ffe06666, 0 0 180px 60px #ffe06633';
    setTimeout(() => {
      mouseLight.style.transition = 'opacity 0.2s, box-shadow 0.3s';
      mouseLight.style.opacity = '0.85';
      mouseLight.style.boxShadow = '';
    }, 120);
  }
});

// Hide the mouse cursor on all elements (JS fallback for browsers that ignore CSS !important)
function hideCursorEverywhere() {
  const all = document.querySelectorAll('*');
  for (let i = 0; i < all.length; i++) {
    all[i].style.cursor = 'none';
  }
}
// Initial call
hideCursorEverywhere();
// Also re-apply on mousemove and DOM changes
window.addEventListener('mousemove', hideCursorEverywhere);
const observer = new MutationObserver(hideCursorEverywhere);
observer.observe(document.body, { childList: true, subtree: true, attributes: true });
