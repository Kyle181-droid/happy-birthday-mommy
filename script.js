/**
 * A Little Universe — a birthday thank-you for Syahrani Akhyar.
 * Framework-free by design. All interactions are local, no analytics/tracking.
 */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Opening scene: one deliberate click blooms the rose and frees a flurry of petals.
  const intro = $('#rose-intro');
  const roseButton = $('#intro-rose-button');
  const skipIntro = $('#intro-skip');
  const petalField = $('#petal-field');
  let introAlreadyOpened = false;
  let nextIntroFocus = null;

  function finishIntro(skipAnimation = false) {
    if (!intro || introAlreadyOpened) return;
    introAlreadyOpened = true;
    if (skipAnimation || reduceMotion.matches) {
      intro.remove();
      document.body.classList.remove('intro-locked');
      $('#hero-title')?.focus({ preventScroll: true });
      return;
    }
    roseButton.disabled = true;
    intro.classList.add('is-opening');
    const bounds = roseButton.getBoundingClientRect();
    const originX = bounds.left + bounds.width * .5;
    const originY = bounds.top + bounds.height * .38;
    for (let i = 0; i < 34; i++) {
      const petal = document.createElement('i');
      petal.className = 'falling-rose-petal';
      const left = (Math.random() - .5) * 74;
      const top = (Math.random() - .5) * 62;
      const driftX = (Math.random() - .5) * Math.min(window.innerWidth * .85, 650);
      const driftY = window.innerHeight * (.46 + Math.random() * .73);
      const duration = 3.3 + Math.random() * 1.6;
      const delay = .12 + Math.random() * 1.35;
      const size = 10 + Math.random() * 17;
      petal.style.cssText = `left:${originX + left}px;top:${originY + top}px;--petal-size:${size}px;--dx:${driftX}px;--dy:${driftY}px;--r0:${Math.random()*360}deg;--r1:${(Math.random()-.5)*1100}deg;--delay:${delay}s;--duration:${duration}s`;
      petalField.append(petal);
      petal.addEventListener('animationend', () => petal.remove(), { once: true });
    }
    nextIntroFocus = window.setTimeout(() => {
      intro.classList.add('is-exiting');
      document.body.classList.remove('intro-locked');
      window.setTimeout(() => {
        intro.remove();
        $('#hero-title')?.focus({ preventScroll: true });
      }, 1100);
    }, 2750);
  }

  roseButton?.addEventListener('click', () => finishIntro());
  skipIntro?.addEventListener('click', () => finishIntro(true));

  // Lightweight scroll feedback and viewport-based entrance transitions.
  const progress = $('.scroll-progress');
  let scrollTicking = false;
  const updateScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
    scrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateScroll);
      scrollTicking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.09, rootMargin: '0px 0px -35px 0px' });
    reveals.forEach(node => observer.observe(node));
  } else {
    reveals.forEach(node => node.classList.add('is-visible'));
  }

  // Fold-out hidden letter with accessible state.
  const sealButton = $('.seal-button');
  const secret = $('#letter-secret');
  sealButton?.addEventListener('click', () => {
    const open = sealButton.getAttribute('aria-expanded') !== 'true';
    sealButton.setAttribute('aria-expanded', String(open));
    secret.setAttribute('aria-hidden', String(!open));
    secret.classList.toggle('is-open', open);
    $('.seal-label', sealButton).textContent = open ? 'Tutup pesan' : 'Buka pesan terakhir';
  });

  // Constellation: five unique, discoverable messages.
  const starButtons = $$('.wish-star');
  const seenStars = new Set();
  const wishMessage = $('#wish-message');
  const foundCount = $('#wishes-discovered');
  starButtons.forEach((star, index) => {
    star.addEventListener('click', () => {
      seenStars.add(index);
      star.classList.add('is-found');
      star.setAttribute('aria-label', `Baca lagi harapan ke-${index + 1}`);
      foundCount.textContent = String(seenStars.size);
      wishMessage.classList.remove('message-arrived');
      // Force reflow to replay a discreet crossfade, without re-rendering the section.
      void wishMessage.offsetWidth;
      wishMessage.textContent = star.dataset.wish || '';
      if (!reduceMotion.matches) wishMessage.classList.add('message-arrived');
      if (seenStars.size === starButtons.length) {
        $('.wish-instruction').innerHTML = 'SEMUA HARAPANKU UNTUKMU <span aria-hidden="true">♡</span>';
      }
    });
  });

  // Candle wish: replayable, grayscale confetti and a one-line blessing.
  const cake = $('#cake-illustration');
  const candleButton = $('#blow-candles');
  const candleLabel = $('.celebrate-button-label', candleButton);
  const celebrationText = $('#celebrate-response');
  const confettiColors = ['#e9e2d8', '#b2a69a', '#90867b', '#c9bbae', '#d8cec1', '#a7a7a4'];

  const showerConfetti = () => {
    if (reduceMotion.matches) return;
    const rect = cake.getBoundingClientRect();
    const startX = rect.left + rect.width * .5;
    const startY = rect.top + rect.height * .36;
    const count = 65;
    for (let i = 0; i < count; i++) {
      const bit = document.createElement('i');
      bit.className = 'confetti-bit';
      const angle = (Math.random() * Math.PI) + Math.PI;
      const travel = 90 + Math.random() * 270;
      const dx = Math.cos(angle) * travel;
      const dy = Math.sin(angle) * travel + 260 + Math.random() * 170;
      bit.style.cssText = `left:${startX}px;top:${startY}px;background:${confettiColors[i % confettiColors.length]};--dx:${dx}px;--dy:${dy}px;--turn:${Math.round(Math.random() * 980 - 490)}deg;animation-delay:${Math.random() * .18}s;`;
      document.body.appendChild(bit);
      bit.addEventListener('animationend', () => bit.remove(), { once: true });
    }
  };

  candleButton?.addEventListener('click', () => {
    const blown = cake.classList.toggle('is-blown');
    candleLabel.textContent = blown ? 'Nyalakan lagi' : 'Tiup lilinnya';
    $('.celebrate-button-symbol', candleButton).textContent = blown ? '♡' : '✳';
    celebrationText.textContent = blown
      ? 'Aamiin. Semoga semesta menjaga semua yang kamu impikan. ♡'
      : 'Your wish is safe with the universe. ♡';
    celebrationText.classList.toggle('is-active', blown);
    if (blown) showerConfetti();
  });

  // Subtle touch/click hearts. No overlay intercepts pointer events.
  const heartsLayer = $('#floating-hearts');
  let lastHeartTime = 0;
  window.addEventListener('pointerdown', event => {
    if (reduceMotion.matches || !heartsLayer || event.pointerType === 'touch') return;
    const now = performance.now();
    if (now - lastHeartTime < 170) return;
    lastHeartTime = now;
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = i === 1 ? '✧' : '♡';
      heart.style.cssText = `left:${event.clientX + (i - 1) * 10}px;top:${event.clientY}px;--sx:${(i - 1) * 40 + Math.random() * 20}px;--sy:${Math.random() * 80}px;--sr:${(i - 1) * 35}deg;animation-delay:${i * 65}ms;`;
      heartsLayer.append(heart);
      heart.addEventListener('animationend', () => heart.remove(), { once: true });
    }
  }, { passive: true });

  // Optional, softly synthesized bell-like melody: user-initiated only.
  const musicToggle = $('.music-toggle');
  const musicLabel = $('.music-label', musicToggle);
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let audioContext = null;
  let melodyTimer = null;
  let melodyIndex = 0;
  const melody = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66];

  function playNote(frequency) {
    if (!audioContext || audioContext.state !== 'running') return;
    const t = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, t);
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(.018, t + .045);
    gain.gain.exponentialRampToValueAtTime(.0001, t + .85);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(t);
    oscillator.stop(t + .88);
  }

  async function setMusic(enabled) {
    if (!AudioContextClass) return;
    if (enabled) {
      try {
        audioContext ??= new AudioContextClass();
        await audioContext.resume();
        if (melodyTimer !== null) window.clearInterval(melodyTimer);
        playNote(melody[melodyIndex++ % melody.length]);
        melodyTimer = window.setInterval(() => {
          if (!document.hidden) playNote(melody[melodyIndex++ % melody.length]);
        }, 650);
      } catch (error) {
        console.info('Audio playback unavailable:', error);
        enabled = false;
      }
    } else {
      if (melodyTimer !== null) window.clearInterval(melodyTimer);
      melodyTimer = null;
      if (audioContext?.state === 'running') await audioContext.suspend();
    }
    musicToggle.setAttribute('aria-pressed', String(enabled));
    musicToggle.setAttribute('aria-label', enabled ? 'Matikan musik lembut' : 'Nyalakan musik lembut');
    musicLabel.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
  }

  if (!AudioContextClass) {
    musicToggle.disabled = true;
    musicToggle.title = 'Browser tidak mendukung Web Audio';
    musicToggle.style.opacity = '.45';
  }
  musicToggle?.addEventListener('click', () => {
    void setMusic(musicToggle.getAttribute('aria-pressed') !== 'true');
  });
  document.addEventListener('visibilitychange', () => {
    if (!audioContext || musicToggle.getAttribute('aria-pressed') !== 'true') return;
    if (document.hidden) void audioContext.suspend();
    else void audioContext.resume();
  });
})();
