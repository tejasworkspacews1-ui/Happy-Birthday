/**
 * =====================================================
 * BIRTHDAY CELEBRATION - MAIN JAVASCRIPT
 * =====================================================
 */

(function() {
  'use strict';
  
  // State
  let state = {
    audioContext: null,
    volume: 0.7,
    theme: 'dark',
    celebrationActive: false,
    wishIndex: 0,
    candleCount: 0,
    giftsOpened: 0,
    audioInitialized: false
  };

  // Config
  const config = {
    wishes: [
      "Wishing you a day as bright as your smile! 🌟",
      "May your year ahead be filled with endless joy! 🎊",
      "May all your dreams take flight this year! ✨",
      "Here's to another amazing year of adventures! 🎂",
      "May your heart be full of love and laughter today! ❤️",
      "Wishing you success, health, and happiness always! 🌈",
      "May every moment of your special day be magical! 🎆",
      "Here's to love, laughter, and all your wishes! 💫",
      "Wishing you 365 days of pure happiness! 🎈",
      "May this year be your best one yet! 🥳",
      "Celebrate big, dream big, live loud! 🎉",
      "May all your wishes come true today! ⭐"
    ],
    confettiColors: ['#ff6b9d', '#ffd700', '#00d2ff', '#c084fc', '#ffaa00', '#ff6b6b', '#a855f7', '#22d3ee', '#f472b6', '#fbbf24'],
    balloonColors: ['#ff6b9d', '#ffd700', '#00d2ff', '#c084fc', '#ffaa00', '#ff6b6b', '#a855f7', '#f472b6'],
    giftSurprises: ['🎉', '💝', '🎁', '🎊', '✨', '💫', '❤️', '🥳']
  };

  // DOM Elements
  const elements = {};

  // Initialize
  function init() {
    cacheElements();
    setupEventListeners();
    startCountdown();
    animateFireworks();
  }

  function cacheElements() {
    elements.countdownOverlay = document.getElementById('countdown-overlay');
    elements.countdownNumber = document.getElementById('countdown-number');
    elements.celebrationReveal = document.getElementById('celebration-reveal');
    elements.mainContent = document.getElementById('main-content');
    elements.balloonsContainer = document.getElementById('balloons-container');
    elements.themeBtn = document.getElementById('theme-btn');
    elements.themePanel = document.getElementById('theme-panel');
    elements.themeOptions = document.querySelectorAll('.theme-option');
    elements.muteBtn = document.getElementById('mute-btn');
    elements.muteIcon = document.getElementById('mute-icon');
    elements.volumeSlider = document.getElementById('volume-slider');
    elements.volumeSliderContainer = document.getElementById('volume-slider-container');
    elements.celebrateBtn = document.getElementById('celebrate-btn');
    elements.fullscreenBtn = document.getElementById('fullscreen-btn');
    elements.resetBtn = document.getElementById('reset-btn');
    elements.startCelebrationBtn = document.getElementById('start-celebration-btn');
    elements.wishEmoji = document.getElementById('wish-emoji');
    elements.wishText = document.getElementById('wish-text');
    elements.newWishBtn = document.getElementById('new-wish-btn');
    elements.shareWishBtn = document.getElementById('share-wish-btn');
    elements.giftBoxes = document.querySelectorAll('.gift-box');
    elements.candles = document.querySelectorAll('.candle');
    elements.confettiCanvas = document.getElementById('confetti-canvas');
    elements.fireworkCanvas = document.getElementById('firework-canvas');
    
    elements.confettiCtx = elements.confettiCanvas?.getContext('2d');
    elements.fireworkCtx = elements.fireworkCanvas?.getContext('2d');
  }

  function setupEventListeners() {
    // Volume slider
    if (elements.volumeSlider) {
      elements.volumeSlider.value = state.volume * 100;
      elements.volumeSlider.addEventListener('input', function(e) {
        state.volume = parseInt(e.target.value) / 100;
        updateMuteIcon();
      });
    }

    // Mute button
    if (elements.muteBtn) {
      elements.muteBtn.addEventListener('click', function() {
        if (state.volume > 0) {
          // Store previous volume before muting
          state.previousVolume = state.volume;
          elements.volumeSlider.value = 0;
          state.volume = 0;
        } else {
          // Restore previous volume or default to 70%
          const restoreVolume = state.previousVolume || 0.7;
          elements.volumeSlider.value = restoreVolume * 100;
          state.volume = restoreVolume;
        }
        updateMuteIcon();
      });
    }

    // Theme
    if (elements.themeBtn) {
      elements.themeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        elements.themePanel.classList.toggle('visible');
      });
    }

    elements.themeOptions.forEach(function(option) {
      option.addEventListener('click', function() {
        changeTheme(option.dataset.theme);
      });
    });

    document.addEventListener('click', function(e) {
      if (elements.themePanel && !elements.themePanel.contains(e.target) && 
          elements.themeBtn && !elements.themeBtn.contains(e.target)) {
        elements.themePanel.classList.remove('visible');
      }
    });

    // Control buttons
    if (elements.celebrateBtn) {
      elements.celebrateBtn.addEventListener('click', startFullCelebration);
    }
    if (elements.startCelebrationBtn) {
      elements.startCelebrationBtn.addEventListener('click', startFullCelebration);
    }
    if (elements.fullscreenBtn) {
      elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    if (elements.resetBtn) {
      elements.resetBtn.addEventListener('click', resetAll);
    }

    // Wish buttons
    if (elements.newWishBtn) {
      elements.newWishBtn.addEventListener('click', showNewWish);
    }
    if (elements.shareWishBtn) {
      elements.shareWishBtn.addEventListener('click', shareWish);
    }

    // Gift boxes
    elements.giftBoxes.forEach(function(box) {
      box.addEventListener('click', function() {
        openGift(box);
      });
    });

    // Candles
    elements.candles.forEach(function(candle) {
      candle.addEventListener('click', function() {
        litCandle(candle);
      });
    });

    // Resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
  }

  function updateMuteIcon() {
    if (!elements.muteIcon) return;
    
    if (state.volume === 0) {
      elements.muteIcon.textContent = '🔇';
    } else if (state.volume < 0.5) {
      elements.muteIcon.textContent = '🔉';
    } else {
      elements.muteIcon.textContent = '🔊';
    }
  }

  // Audio
  function initAudio() {
    if (state.audioInitialized) return;
    try {
      state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      state.audioInitialized = true;
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  function playTone(freq, startTime, duration, type) {
    if (!state.audioContext) return;
    
    const ctx = state.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(state.volume * 0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Countdown
  function startCountdown() {
    let count = 10;
    
    function tick() {
      if (count > 0) {
        initAudio();
        elements.countdownNumber.textContent = count;
        
        if (state.audioContext) {
          playTone(400 + (10 - count) * 30, state.audioContext.currentTime, 0.15, 'sine');
        }
        
        elements.countdownNumber.style.transform = 'scale(1.2)';
        setTimeout(function() {
          elements.countdownNumber.style.transform = 'scale(1)';
        }, 100);
        
        count--;
        setTimeout(tick, 400);
      } else {
        showCelebration();
      }
    }
    
    tick();
  }

  // Celebration - same as startFullCelebration
  function showCelebration() {
    initAudio();
    
    elements.countdownOverlay.classList.add('hidden');
    elements.celebrationReveal.classList.add('active');
    
    // Play celebration sounds
    playCelebrationSound();
    playBirthdaySong();
    
    // Effects - confetti from corners diagonally inward
    confettiCorners(200);
    launchFireworks(15);
    createBalloons(30);
    
    // More effects after delay
    setTimeout(function() {
      confettiCorners(150);
      launchFireworks(10);
    }, 500);
    
    // Show main content after 4 seconds
    setTimeout(function() {
      elements.celebrationReveal.classList.remove('active');
      elements.mainContent.classList.add('visible');
    }, 4000);
  }

  function playCelebrationSound() {
    if (!state.audioContext) return;
    
    const ctx = state.audioContext;
    let t = ctx.currentTime;
    
    // Bass boom
    for (let i = 0; i < 3; i++) {
      playTone(80 + i * 20, t + i * 0.1, 0.5, 'sawtooth');
    }
    
    // High notes
    const notes = [523, 659, 784, 1047, 1319, 1568, 2093];
    notes.forEach(function(freq, i) {
      playTone(freq, t + 0.15 + i * 0.05, 0.25, i % 2 === 0 ? 'square' : 'sawtooth');
    });
    
    // Drums
    for (let i = 0; i < 8; i++) {
      playTone(100 + Math.random() * 50, t + 0.4 + i * 0.08, 0.06, 'square');
    }
  }

  function playBirthdaySong() {
    if (!state.audioContext) return;
    
    const ctx = state.audioContext;
    let currentTime = ctx.currentTime + 0.1;

    const melody = [
      { note: 'C4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'D4', duration: 0.8 },
      { note: 'C4', duration: 0.8 },
      { note: 'F4', duration: 0.8 },
      { note: 'E4', duration: 1.6 },
      { note: 'C4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'D4', duration: 0.8 },
      { note: 'C4', duration: 0.8 },
      { note: 'G4', duration: 0.8 },
      { note: 'F4', duration: 1.6 },
      { note: 'C4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'C5', duration: 0.8 },
      { note: 'A4', duration: 0.8 },
      { note: 'F4', duration: 0.8 },
      { note: 'E4', duration: 0.8 },
      { note: 'D4', duration: 1.6 },
      { note: 'B4', duration: 0.4 },
      { note: 'B4', duration: 0.4 },
      { note: 'A4', duration: 0.8 },
      { note: 'F4', duration: 0.8 },
      { note: 'G4', duration: 0.8 },
      { note: 'F4', duration: 1.6 }
    ];

    const NOTE_FREQUENCIES = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
    };

    melody.forEach(function(item) {
      const freq = NOTE_FREQUENCIES[item.note];
      if (freq) {
        playTone(freq, currentTime, item.duration * 0.8, 'sine');
        currentTime += item.duration;
      }
    });
  }

  // Effects
  function createBalloons(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(createBalloon, i * 100);
    }
  }

  function createBalloon() {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    
    const color = config.balloonColors[Math.floor(Math.random() * config.balloonColors.length)];
    const left = Math.random() * 90 + 5;
    const delay = Math.random() * 3;
    const duration = 12 + Math.random() * 8;
    
    balloon.style.left = left + '%';
    balloon.style.animationDuration = duration + 's';
    balloon.style.animationDelay = delay + 's';
    
    balloon.innerHTML = 
      '<div class="balloon-body" style="background: linear-gradient(135deg, ' + color + ', ' + adjustColor(color, -30) + ');"></div>' +
      '<div class="balloon-string"></div>';
    
    elements.balloonsContainer.appendChild(balloon);
    
    setTimeout(function() {
      balloon.remove();
    }, (duration + delay) * 1000);
  }

  function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  // Confetti - Directional bursts (from corners diagonally)
  function confettiBurst(count, origin = 'center') {
    if (typeof confetti !== 'function') return;
    
    let confettiOptions = {
      particleCount: count,
      spread: 70,
      colors: config.confettiColors,
      disableForReducedMotion: true,
      gravity: 0.9,
      scalar: 1.2
    };
    
    // Different origin points based on direction
    if (origin === 'left') {
      confettiOptions.origin = { x: 0, y: 0.5 };
      confettiOptions.spread = 90;
      confettiOptions.angle = 0; // shoots right
    } else if (origin === 'right') {
      confettiOptions.origin = { x: 1, y: 0.5 };
      confettiOptions.spread = 90;
      confettiOptions.angle = 180; // shoots left
    } else if (origin === 'bottom') {
      confettiOptions.origin = { x: 0.5, y: 1 };
      confettiOptions.spread = 100;
    } else if (origin === 'corner-bl') {
      // Bottom Left corner - shoots diagonally up-right
      confettiOptions.origin = { x: 0, y: 1 };
      confettiOptions.spread = 60;
      confettiOptions.angle = 55; // diagonal up-right
    } else if (origin === 'corner-br') {
      // Bottom Right corner - shoots diagonally up-left
      confettiOptions.origin = { x: 1, y: 1 };
      confettiOptions.spread = 60;
      confettiOptions.angle = 125; // diagonal up-left
    } else if (origin === 'corners') {
      // Both corners shooting inward
      confettiBurst(Math.floor(count / 2), 'corner-bl');
      confettiBurst(Math.floor(count / 2), 'corner-br');
      return;
    } else if (origin === 'random-sides') {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      confettiBurst(Math.floor(count / 2), side);
      confettiBurst(Math.floor(count / 2), 'bottom');
      return;
    } else {
      confettiOptions.origin = { y: 0.5 }; // center default
    }
    
    confetti(confettiOptions);
  }

  // Shorthand for directional confetti
  function confettiLeft(count) { confettiBurst(count, 'left'); }
  function confettiRight(count) { confettiBurst(count, 'right'); }
  function confettiBottom(count) { confettiBurst(count, 'bottom'); }
  function confettiCorners(count) { confettiBurst(count, 'corners'); }
  function confettiSidesAndBottom(count) { confettiBurst(count, 'random-sides'); }

  // Fireworks
  let fireworks = [];

  function launchFireworks(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(function() {
        const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
        const y = Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.1;
        createFirework(x, y);
      }, i * 150);
    }
  }

  function createFirework(x, y) {
    const particles = [];
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        alpha: 1,
        color: config.confettiColors[Math.floor(Math.random() * config.confettiColors.length)],
        size: 2 + Math.random() * 3
      });
    }
    
    fireworks.push({ particles: particles, age: 0, maxAge: 60 });
  }

  function animateFireworks() {
    if (!elements.fireworkCtx || !elements.fireworkCanvas) {
      requestAnimationFrame(animateFireworks);
      return;
    }
    
    elements.fireworkCtx.clearRect(0, 0, elements.fireworkCanvas.width, elements.fireworkCanvas.height);
    
    fireworks = fireworks.filter(function(fw) {
      fw.age++;
      
      fw.particles.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.alpha = 1 - (fw.age / fw.maxAge);
        
        if (p.alpha > 0) {
          elements.fireworkCtx.beginPath();
          elements.fireworkCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          elements.fireworkCtx.fillStyle = p.color;
          elements.fireworkCtx.globalAlpha = p.alpha;
          elements.fireworkCtx.fill();
          elements.fireworkCtx.globalAlpha = 1;
        }
      });
      
      return fw.age < fw.maxAge;
    });
    
    requestAnimationFrame(animateFireworks);
  }

  function resizeCanvas() {
    if (elements.confettiCanvas) {
      elements.confettiCanvas.width = window.innerWidth;
      elements.confettiCanvas.height = window.innerHeight;
    }
    if (elements.fireworkCanvas) {
      elements.fireworkCanvas.width = window.innerWidth;
      elements.fireworkCanvas.height = window.innerHeight;
    }
  }

  // Gifts
  function openGift(box) {
    if (box.classList.contains('opened')) return;
    
    initAudio();
    box.classList.add('opened');
    state.giftsOpened++;
    
    const surprise = box.querySelector('.gift-surprise');
    if (surprise) {
      surprise.textContent = config.giftSurprises[Math.floor(Math.random() * config.giftSurprises.length)];
    }
    
    confettiBottom(60);
    playGiftSound();
    
    if (state.giftsOpened >= 3) {
      setTimeout(function() {
        confettiBottom(150);
        launchFireworks(8);
        playBirthdaySong();
      }, 500);
    }
  }

  function playGiftSound() {
    if (!state.audioContext) return;
    
    const ctx = state.audioContext;
    const notes = [523, 659, 784, 1047];
    
    notes.forEach(function(freq, i) {
      setTimeout(function() {
        playTone(freq, ctx.currentTime, 0.25, 'sine');
      }, i * 60);
    });
  }

  // Candles
  function litCandle(candle) {
    if (candle.classList.contains('lit')) return;
    
    initAudio();
    candle.classList.add('lit');
    state.candleCount++;
    
    playCandleSound();
    
    if (state.candleCount >= 5) {
      setTimeout(celebrateAllCandles, 500);
    }
  }

  function celebrateAllCandles() {
    elements.candles.forEach(function(candle) {
      candle.classList.remove('lit');
    });
    
    confettiBottom(200);
    launchFireworks(12);
    playBirthdaySong();
    createBalloons(25);
    
    state.candleCount = 0;
  }

  function playCandleSound() {
    if (!state.audioContext) return;
    
    const ctx = state.audioContext;
    playTone(660, ctx.currentTime, 0.35, 'triangle');
    playTone(330, ctx.currentTime + 0.1, 0.3, 'triangle');
  }

  // Wishes
  function showNewWish() {
    initAudio();
    state.wishIndex = (state.wishIndex + 1) % config.wishes.length;
    
    const emojis = ['💝', '🎉', '✨', '🌟', '💫', '❤️', '🎊', '🥳', '⭐', '🎈', '🎁', '🌈'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    elements.wishEmoji.style.transform = 'scale(0) rotate(-180deg)';
    elements.wishText.style.opacity = '0';
    elements.wishText.style.transform = 'translateY(-20px)';
    
    setTimeout(function() {
      elements.wishEmoji.textContent = randomEmoji;
      elements.wishText.textContent = config.wishes[state.wishIndex];
      
      elements.wishEmoji.style.transform = 'scale(1) rotate(0deg)';
      elements.wishText.style.opacity = '1';
      elements.wishText.style.transform = 'translateY(0)';
      
      confettiBottom(30);
    }, 300);
  }

  function shareWish() {
    const wishText = elements.wishText.textContent;
    const shareText = wishText + ' — From Birthday Celebration! 🎂';
    
    if (navigator.share) {
      navigator.share({
        title: 'Birthday Wish',
        text: shareText,
        url: window.location.href
      }).catch(function() {
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
      const originalHTML = elements.shareWishBtn.innerHTML;
      elements.shareWishBtn.innerHTML = '<i class="ph ph-check"></i> Copied!';
      setTimeout(function() {
        elements.shareWishBtn.innerHTML = originalHTML;
      }, 2000);
    });
  }

  // Full celebration
  function startFullCelebration() {
    initAudio();
    
    playCelebrationSound();
    playBirthdaySong();
    
    // Effects - confetti from corners diagonally inward
    confettiCorners(200);
    launchFireworks(15);
    createBalloons(30);
    
    // More effects after delay
    setTimeout(function() {
      confettiCorners(150);
      launchFireworks(10);
    }, 500);
  }

  // Theme
  function changeTheme(themeName) {
    state.theme = themeName;
    document.body.setAttribute('data-theme', themeName);
    
    elements.themeOptions.forEach(function(opt) {
      opt.classList.toggle('active', opt.dataset.theme === themeName);
    });
    
    elements.themePanel.classList.remove('visible');
  }

  // Reset
  function resetAll() {
    elements.balloonsContainer.innerHTML = '';
    
    state.celebrationActive = false;
    state.wishIndex = 0;
    state.candleCount = 0;
    state.giftsOpened = 0;
    
    elements.giftBoxes.forEach(function(box) {
      box.classList.remove('opened');
    });
    
    elements.candles.forEach(function(candle) {
      candle.classList.remove('lit');
    });
    
    elements.wishEmoji.textContent = '💝';
    elements.wishText.textContent = config.wishes[0];
    
    elements.mainContent.classList.remove('visible');
    elements.celebrationReveal.classList.remove('active');
    elements.countdownOverlay.classList.remove('hidden');
    
    setTimeout(startCountdown, 500);
  }

  // Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

