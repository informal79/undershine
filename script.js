const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '메뉴 열기');
  mobileNav.classList.remove('open');
  header.classList.remove('menu-open');
  document.body.style.overflow = '';
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? '메뉴 열기' : '메뉴 닫기');
  mobileNav.classList.toggle('open', !isOpen);
  header.classList.toggle('menu-open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu();
});

const heroVideo = document.querySelector('.hero-video');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (heroVideo) {
  const syncHeroMotion = () => {
    if (reduceMotion.matches) {
      heroVideo.pause();
      heroVideo.classList.remove('is-ready');
      return;
    }

    if (heroVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      heroVideo.classList.add('is-ready');
    }
    heroVideo.play().catch(() => heroVideo.classList.remove('is-ready'));
  };

  heroVideo.addEventListener('loadeddata', syncHeroMotion);
  reduceMotion.addEventListener('change', syncHeroMotion);
  syncHeroMotion();
}
