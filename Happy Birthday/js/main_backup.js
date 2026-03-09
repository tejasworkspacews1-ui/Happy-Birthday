/**
 * =====================================================
 * BIRTHDAY CELEBRATION - JAVASCRIPT
 * =====================================================
 */

// Application State
const App = {
  state: {
    audioContext: null,
    volume: 0.7,
    theme: 'dark',
    celebrationActive: false,
    wishIndex: 0,
    countdownStarted: false,
    candleCount: 0,
    giftsOpened: 0
  },

  config: {
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
    confettiColors: ['#ff6b9d', '#ffd700', '#00d2ff', '#c084fc', '#ffaa00', '#ff6b6b', '#a855f7', '#22d3ee'],
    balloonColors: ['#ff6b9d', '#ffd700', '#00d2ff', '#c084fc', '#ffaa00', '#ff6b6b', '#a855f7', '#f472b6'],
    candles: ['🎂', '🕯️', '🎁', '⭐', '🌟'],
    giftSurprises: ['🎉', '💝', '🎁', '🎊', '✨', '💫', '❤️', '🥳']
  },

  elements: {},

  // Initialize
  init() {
    this.cacheElements();
    this.initEventListeners();
    this.startCountdown();
  },

  cacheElements() {
    this.elements = {
      countdownOverlay: document.getElementById('countdown-overlay'),
      countdownNumber: document.getElementById('countdown-number'),
      countdownLabel: document.getElementById('countdown-label'),
      celebrationReveal: document.getElementById('celebration-reveal'),
      celebrationTitle: document.getElementById('celebration-title'),
      mainContent: document.getElementById('main-content'),
      balloonsContainer: document.getElementById('balloons-container'),
      themeBtn: document.getElementById('theme-btn'),
      themePanel: document.getElementById('theme-panel'),
      themeOptions: document.querySelectorAll('.theme-option'),
      volumeIcon: document.getElementById('volume-icon'),
      volumeSlider: document.getElementById('volume-slider'),
      celebrateBtn: document.getElementById('celebrate-btn'),
      fullscreenBtn: document.getElementById('fullscreen-btn'),
      resetBtn: document.getElementById('reset-btn'),
      wishCard: document.getElementById('wish-card'),
      wishEmoji: document.getElementById('wish-emoji'),
      wishText: document.getElementById('wish-text'),
      newWishBtn: document.getElementById('new-wish-btn'),
      shareWishBtn: document.getElementById('share-wish-btn'),
      giftBoxes: document.querySelectorAll('.gift-box'),
      candles: document.querySelectorAll('.candle'),
      confettiCanvas: document.getElementById('confetti-canvas'),
      fireworkCanvas: document.getElementById('firework-canvas')
    };
    
    this.confettiCtx = this.elements.confettiCanvas.getContext('2d');
    this.fireworkCtx = this.elements.fireworkCanvas.getContext('2d');
  },

  initEventListeners() {
    // Theme
    this.elements.themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.elements.themePanel?.classList.toggle('visible');
    });

    this.elements.themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.changeTheme(option.dataset.theme);
      });
    });

    document.addEventListener('click', (e) => {
      if (this.elements.themePanel && !this.elements.themePanel.contains(e.target) && 
          this.elements.themeBtn && !this.elements.themeBtn.contains(e.target)) {
        this.elements.themePanel.classList.remove('visible');
      }
    });

    // Volume
    this.elements.volumeSlider?.addEventListener('input', (e) => {
      this.state.volume = e.target.value / 100;
      this.updateVolumeIcon();
    });

    this.elements.volumeIcon?.addEventListener('click', () => {
      if (this.state.volume > 0) {
        this.elements.volumeSlider.value = 0;
        this.state.volume = 0;
      } else {
        this.elements.volumeSlider.value = 70;
        this.state.volume = 0.7;
      }
      this.updateVolumeIcon();
    });

    // Control buttons
    this.elements.celebrateBtn?.addEventListener('click', () => this.startFullCelebration());
    this.elements.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
    this.elements.resetBtn?.addEventListener('click', () => this.resetAll());

    // Wish buttons
    this.elements.newWishBtn?.addEventListener('click', () => this.showNewWish());
    this.elements.shareWishBtn?.addEventListener('click', () => this.shareWish());

    // Gift boxes
    this.elements.giftBoxes.forEach(box => {
      box.addEventListener('click', () => this.openGift(box));
    });

    // Candles
    this.elements.candles.forEach(candle => {
      candle.addEventListener('click', () => this.litCandle(candle));
    });

    // Resize
    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') this.toggleFullscreen();
      if (e.key === 'r' || e.key === 'R') this.resetAll();
    });
  },

  updateVolumeIcon() {
    const icon = this.elements.volumeIcon;
    if (!icon) return;
    
    if (this.state.volume === 0) {
      icon.className = 'ph ph-speaker-slash volume-icon';
    } else if (this.state.volume < 0.5) {
      icon.className = 'ph ph-speaker-low volume-icon';
    } else {
      icon.className = 'ph ph-speaker-high volume-icon';
    }
  },

  // ============================================
  // COUNTDOWN & REVEAL
  // ============================================
  startCountdown() {
    let count = 10;
    
    const tick = () => {
      if (count > 0) {
        this.elements.countdownNumber.textContent = count;
        this.playCountSound();
        
        // Scale animation
        this.elements.countdownNumber.style.transform = 'scale(1.2)';
        setTimeout(() => {
          this.elements.countdownNumber.style.transform = 'scale(1)';
        }, 100);
        
        count--;
        setTimeout(tick, 500); // 500ms * 10 = 5 seconds total
      } else {
        this.showCelebration();
      }
    };
    
    tick();
  },

  playCountSound() {
    if (!this.state.audioContext) {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = this.state.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(this.state.volume * 0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  },

  showCelebration() {
    // Hide countdown
    this.elements.countdownOverlay.classList.add('hidden');
    
    // Show celebration title
    this.elements.celebrationReveal.classList.add('active');
    
    // Play celebration sound
    this.playCelebrationSound();
    
    // Big effects
    this.confettiBurst(200);
    this.launchFireworks(15);
    this.createBalloons(30);
    
    // After 4 seconds, show main content
    setTimeout(() => {
      this.elements.celebrationReveal.classList.remove('active');
      this.elements.mainContent.classList.add('visible');
      this.playBirthdaySong();
    }, 4000);
  },

  playCelebrationSound() {
    if (!this.state.audioContext) {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = this.state.audioContext;
    
    // Play multiple notes for celebration
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gainNode.gain.setValueAtTime(this.state.volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      }, i * 100);
    });
  },

  // ============================================
  // AUDIO - BIRTHDAY SONG
  // ============================================
  playBirthdaySong() {
    if (!this.state.audioContext) {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = this.state.audioContext;
    let currentTime = ctx.currentTime + 0.1;

    // Happy Birthday melody (two verses)
    const melody = [
      // First verse
      { note: 'C4', duration: 0.5 },
      { note: 'C4', duration: 0.5 },
      { note: 'D4', duration: 1 },
      { note: 'C4', duration: 1 },
      { note: 'F4', duration: 1 },
      { note: 'E4', duration: 2 },
      // Second verse
      { note: 'C4', duration: 0.5 },
      { note: 'C4', duration: 0.5 },
      { note: 'D4', duration: 1 },
      { note: 'C4', duration: 1 },
      { note: 'G4', duration: 1 },
      { note: 'F4', duration: 2 },
      // Third verse
      { note: 'C4', duration: 0.5 },
      { note: 'C4', duration: 0.5 },
      { note: 'C5', duration: 1 },
      { note: 'A4', duration: 1 },
      { note: 'F4', duration: 1 },
      { note: 'E4', duration: 1 },
      { note: 'D4', duration: 2 },
      // Fourth verse
      { note: 'B4', duration: 0.5 },
      { note: 'B4', duration: 0.5 },
      { note: 'A4', duration: 1 },
      { note: 'F4', duration: 1 },
      { note: 'G4', duration: 1 },
      { note: 'F4', duration: 2 }
    ];

    const NOTE_FREQUENCIES = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25
    };

    melody.forEach(({ note, duration }) => {
      const frequency = NOTE_FREQUENCIES[note];
      if (frequency) {
        this.playTone(frequency, currentTime, duration * 0.85);
        currentTime += duration;
      }
    });
  },

  playTone(frequency, startTime, duration) {
    const ctx = this.state.audioContext;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Envelope for smoother sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.state.volume * 0.35, startTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  },

  // ============================================
  // BALLOONS
  // ============================================
  createBalloons(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.createBalloon();
      }, i * 150);
    }
  },

  createBalloon() {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    
    const color = this.config.balloonColors[Math.floor(Math.random() * this.config.balloonColors.length)];
    const left = Math.random() * 90 + 5;
    const delay = Math.random() * 3;
    const duration = 15 + Math.random() * 10;
    
    balloon.style.left = left + '%';
    balloon.style.animationDuration = duration + 's';
    balloon.style.animationDelay = delay + 's';
    
    balloon.innerHTML = `
      <div class="balloon-body" style="background: linear-gradient(135deg, ${color}, ${this.adjustColor(color, -30)});"></div>
      <div class="balloon-string"></div>
    `;
    
    this.elements.balloonsContainer.appendChild(balloon);
    
    setTimeout(() => {
      balloon.remove();
    }, (duration + delay) * 1000);
  },

  adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  },

  // ============================================
  // CONFETTI
  // ============================================
  confettiBurst(count = 100) {
    const defaults = {
      particleCount: count,
      spread: 70,
      origin: { y: 0.5 },
      colors: this.config.confettiColors,
      disableForReducedMotion: true,
      ticks: 200,
      gravity: 0.8,
      scalar: 1.2
    };
    
    // Multiple bursts
    confetti(defaults);
    
    setTimeout(() => {
      confetti({
        ...defaults,
        origin: { x: Math.random() * 0.5 + 0.25, y: 0.3 }
      });
    }, 200);
  },

  // ============================================
  // FIREWORKS
  // ============================================
  fireworks: [],

  launchFireworks(count = 5) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
        const y = Math.random() * window.innerHeight * 0.4 + window.innerHeight * 0.1;
        this.createFirework(x, y);
      }, i * 300);
    }
  },

  createFirework(x, y) {
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
        color: this.config.confettiColors[Math.floor(Math.random() * this.config.confettiColors.length)],
        size: 2 + Math.random() * 3
      });
    }
    
    this.fireworks.push({ particles, age: 0, maxAge: 80 });
  },

  animateFireworks() {
    if (!this.fireworkCtx || !this.elements.fireworkCanvas) return;
    
    this.fireworkCtx.clearRect(0, 0, this.elements.fireworkCanvas.width, this.elements.fireworkCanvas.height);
    
    this.fireworks = this.fireworks.filter(fw => {
      fw.age++;
      
      fw.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.alpha = 1 - (fw.age / fw.maxAge);
        
        if (p.alpha > 0) {
          this.fireworkCtx.beginPath();
          this.fireworkCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          this.fireworkCtx.fillStyle = p.color;
          this.fireworkCtx.globalAlpha = p.alpha;
          this.fireworkCtx.fill();
          this.fireworkCtx.globalAlpha = 1;
        }
      });
      
      return fw.age < fw.maxAge;
    });
    
    requestAnimationFrame(() => this.animateFireworks());
  },

  resizeCanvas() {
    if (this.elements.confettiCanvas) {
      this.elements.confettiCanvas.width = window.innerWidth;
      this.elements.confettiCanvas.height = window.innerHeight;
    }
    if (this.elements.fireworkCanvas) {
      this.elements.fireworkCanvas.width = window.innerWidth;
      this.elements.fireworkCanvas.height = window.innerHeight;
    }
  },

  // ============================================
  // GIFTS
  // ============================================
  openGift(box) {
    if (box.classList.contains('opened')) return;
    
    box.classList.add('opened');
    this.state.giftsOpened++;
    
    // Show surprise
    const surprise = box.querySelector('.gift-surprise');
    if (surprise) {
      const surpriseText = this.config.giftSurprises[Math.floor(Math.random() * this.config.giftSurprises.length)];
      surprise.textContent = surpriseText;
    }
    
    // Effects
    this.confettiBurst(50);
    this.playGiftSound();
    
    // If all gifts opened, big celebration
    if (this.state.giftsOpened >= 3) {
      setTimeout(() => {
        this.confettiBurst(100);
        this.launchFireworks(5);
      }, 500);
    }
  },

  playGiftSound() {
    if (!this.state.audioContext) {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = this.state.audioContext;
    const notes = [523.25, 659.25, 783.99];
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(this.state.volume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }, i * 80);
    });
  },

  // ============================================
  // CANDLES
  // ============================================
  litCandle(candle) {
    if (candle.classList.contains('lit')) return;
    
    candle.classList.add('lit');
    this.state.candleCount++;
    
    // Play blow sound
    this.playCandleSound();
    
    // If all candles lit
    if (this.state.candleCount >= 5) {
      setTimeout(() => {
        this.celebrateAllCandles();
      }, 500);
    }
  },

  celebrateAllCandles() {
    // Blow out all candles
    this.elements.candles.forEach(candle => {
      candle.classList.remove('lit');
    });
    
    // Big celebration
    this.confettiBurst(150);
    this.launchFireworks(8);
    this.playBirthdaySong();
    
    this.state.candleCount = 0;
  },

  playCandleSound() {
    if (!this.state.audioContext) {
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = this.state.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(this.state.volume * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  },

  // ============================================
  // WISHES
  // ============================================
  showNewWish() {
    const wishes = this.config.wishes;
    this.state.wishIndex = (this.state.wishIndex + 1) % wishes.length;
    
    const emojis = ['💝', '🎉', '✨', '🌟', '💫', '❤️', '🎊', '🥳', '⭐', '🎈', '🎁', '🌈'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Animate out
    this.elements.wishEmoji.style.transform = 'scale(0) rotate(-180deg)';
    this.elements.wishText.style.opacity = '0';
    this.elements.wishText.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      this.elements.wishEmoji.textContent = randomEmoji;
      this.elements.wishText.textContent = wishes[this.state.wishIndex];
      
      // Animate in
      this.elements.wishEmoji.style.transform = 'scale(1) rotate(0deg)';
      this.elements.wishText.style.opacity = '1';
      this.elements.wishText.style.transform = 'translateY(0)';
      
      // Sparkles
      this.confettiBurst(30);
    }, 300);
  },

  shareWish() {
    const wishText = this.elements.wishText.textContent;
    const shareText = `${wishText} — From Birthday Celebration! 🎂`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Birthday Wish',
        text: shareText,
        url: window.location.href
      }).catch(() => {
        this.copyToClipboard(shareText);
      });
    } else {
      this.copyToClipboard(shareText);
    }
  },

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const btn = this.elements.shareWishBtn;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="ph ph-check"></i> Copied!';
      setTimeout(() => { btn.innerHTML = originalHTML; }, 2000);
    });
  },

  // ============================================
  // FULL CELEBRATION
  // ============================================
  startFullCelebration() {
    if (this.state.celebrationActive) return;
    this.state.celebrationActive = true;
    
    this.playBirthdaySong();
    this.launchFireworks(10);
    this.confettiBurst(150);
    this.createBalloons(25);
    
    // Periodic effects
    let celebrationCount = 0;
    const celebrationInterval = setInterval(() => {
      if (celebrationCount >= 3) {
        clearInterval(celebrationInterval);
        this.state.celebrationActive = false;
        return;
      }
      
      this.launchFireworks(3);
      this.confettiBurst(80);
      this.createBalloon();
      celebrationCount++;
    }, 2500);
  },

  // ============================================
  // THEME
  // ============================================
  changeTheme(themeName) {
    this.state.theme = themeName;
    document.body.setAttribute('data-theme', themeName);
    
    this.elements.themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === themeName);
    });
    
    this.elements.themePanel?.classList.remove('visible');
  },

  // ============================================
  // RESET
  // ============================================
  resetAll() {
    // Clear balloons
    if (this.elements.balloonsContainer) {
      this.elements.balloonsContainer.innerHTML = '';
    }
    
    // Reset state
    this.state.celebrationActive = false;
    this.state.wishIndex = 0;
    this.state.candleCount = 0;
    this.state.giftsOpened = 0;
    
    // Reset gift boxes
    this.elements.giftBoxes.forEach(box => {
      box.classList.remove('opened');
    });
    
    // Reset candles
    this.elements.candles.forEach(candle => {
      candle.classList.remove('lit');
    });
    
    // Reset wish card
    this.elements.wishEmoji.textContent = '💝';
    this.elements.wishText.textContent = this.config.wishes[0];
    
    // Reset visibility
    this.elements.mainContent.classList.remove('visible');
    this.elements.celebrationReveal.classList.remove('active');
    this.elements.countdownOverlay.classList.remove('hidden');
    
    // Restart countdown
    setTimeout(() => {
      this.startCountdown();
    }, 500);
  },

  // ============================================
  // FULLSCREEN
  // ============================================
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
};

// Start application
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  App.animateFireworks();
});

