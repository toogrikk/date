/* ===================================================================
   РОМАНТИЧЕСКИЙ ИНТЕРАКТИВНЫЙ САЙТ ДЛЯ НАШЕГО СВИДАНИЯ — SCRIPT.JS
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // -------------------------------------------------------------------
  // 1. АМБИЕНТНЫЙ CANVAS: ПАРЯЩИЕ ИСКОРКИ ОГНЯ И МЯГКИЕ СЕРДЕЧКИ
  // -------------------------------------------------------------------
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const PARTICLE_COLORS = [
    'rgba(255, 51, 102, ',   // Яркий рубин
    'rgba(255, 107, 53, ',   // Янтарно-огненный
    'rgba(255, 184, 52, ',   // Тёплое золото
    'rgba(255, 138, 168, '   // Нежно-розовый
  ];

  class AmbientParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2.8 + 1.2;
      this.speedY = Math.random() * 0.7 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.colorBase = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.6 + 0.2;
      this.fadeSpeed = 0.008;
      this.isHeart = Math.random() < 0.18; // 18% шанс частицы в форме сердечка
      this.heartScale = Math.random() * 0.6 + 0.5;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.01;
    }

    update() {
      this.y -= this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.4 + this.speedX;

      // Плавное появление и затухание
      if (this.y > height * 0.85) {
        this.alpha = Math.min(this.alpha + this.fadeSpeed, this.maxAlpha);
      } else if (this.y < height * 0.2) {
        this.alpha = Math.max(this.alpha - this.fadeSpeed, 0);
      }

      if (this.y < -15 || this.alpha <= 0 && this.y < height * 0.5) {
        this.reset();
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.fillStyle = this.colorBase + this.alpha + ')';

      if (this.isHeart) {
        // Отрисовка маленького парящего сердечка
        ctx.translate(this.x, this.y);
        ctx.scale(this.heartScale, this.heartScale);
        ctx.beginPath();
        const topCurveHeight = this.size * 0.7;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -this.size, 0, -this.size, topCurveHeight);
        ctx.bezierCurveTo(-this.size, (this.size + topCurveHeight) / 1.5, 0, this.size * 1.8, 0, this.size * 2);
        ctx.bezierCurveTo(0, this.size * 1.8, this.size, (this.size + topCurveHeight) / 1.5, this.size, topCurveHeight);
        ctx.bezierCurveTo(this.size, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
      } else {
        // Огненная искорка
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.colorBase + '0.8)';
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Создаем 35 частиц (оптимально для гладких 60fps на смартфонах)
  const particleCount = window.innerWidth < 600 ? 32 : 55;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new AmbientParticle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  // -------------------------------------------------------------------
  // 2. НАШ САУНДТРЕК: МОНЕТОЧКА — «ТВОЁ ИМЯ» (АВТОЗАПУСК + ТИХИЙ ЗВУК)
  // -------------------------------------------------------------------
  let audioCtx = null;
  const bgMusic = document.getElementById('bg-music');
  const audioToggleBtn = document.getElementById('audio-toggle');
  const audioToggleLabel = document.getElementById('audio-toggle-label');
  const musicCard = document.getElementById('music-card');

  // Делаем музыку комфортно тихой (20% от максимальной громкости)
  const QUIET_VOLUME = 0.20;
  if (bgMusic) {
    bgMusic.volume = QUIET_VOLUME;
  }

  let isMusicPlaying = false;

  function startQuietMusic() {
    if (!bgMusic) return;
    bgMusic.volume = QUIET_VOLUME;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isMusicPlaying = true;
          if (audioToggleBtn) audioToggleBtn.classList.add('playing');
          if (audioToggleLabel) audioToggleLabel.textContent = 'Твоё имя 🎵';
        })
        .catch(err => {
          // Если браузер заблокировал автовоспроизведение до первого касания,
          // трек включится при первом клике на конверт или экран
          console.log('Autoplay deferred until user gesture:', err);
        });
    }
  }

  // 1. Пробуем запустить сразу при загрузке страницы
  startQuietMusic();

  // 2. Запускаем при любом первом касании экрана (тач, клик, скролл)
  const triggerUserGesture = () => {
    if (!isMusicPlaying && bgMusic && bgMusic.paused) {
      startQuietMusic();
    }
  };
  ['click', 'touchstart', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, triggerUserGesture, { once: true, passive: true });
  });

  // Кнопка в правом верхнем углу: пауза / возобновление тихой музыки
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!bgMusic) return;

      if (bgMusic.paused) {
        startQuietMusic();
      } else {
        bgMusic.pause();
        isMusicPlaying = false;
        audioToggleBtn.classList.remove('playing');
        if (audioToggleLabel) audioToggleLabel.textContent = 'Пауза ⏸';
      }
    });
  }

  // Нежный колокольчик для тактильного отклика при тапах по чек-листу и печати
  function playSweetChime() {
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      // Опциональный звук
    }
  }


  // -------------------------------------------------------------------
  // 3. ОТКРЫТИЕ КОНВЕРТА
  // -------------------------------------------------------------------
  const envelopeScreen = document.getElementById('envelope-screen');
  const envelopeCard = document.getElementById('envelope-card');
  const waxSeal = document.getElementById('wax-seal');
  const mainContent = document.getElementById('main-content');

  function openEnvelope() {
    envelopeCard.classList.add('open');
    playSweetChime();

    // Запускаем музыку при открытии письма, если еще не началась
    if (bgMusic && bgMusic.paused) {
      startQuietMusic();
    }

    // Легкий взрыв конфетти из восковой печати
    if (typeof confetti === 'function') {
      const rect = waxSeal.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x, y },
        colors: ['#ff3366', '#ffb834', '#ffd3b6', '#ff6b35'],
        disableForReducedMotion: true
      });
    }

    setTimeout(() => {
      envelopeScreen.classList.add('opened');
      mainContent.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 700);
  }

  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  envelopeCard.addEventListener('click', () => {
    openEnvelope();
  });


  // -------------------------------------------------------------------
  // 4. ДАТА ПЯТНИЦЫ И ТАЙМЕР ОБРАТНОГО ОТСЧЕТА
  // -------------------------------------------------------------------
  function getNextFriday() {
    const now = new Date();
    const resultDate = new Date(now);
    const currentDay = now.getDay(); // 0 - Вс, 5 - Пт
    
    // Вычисляем сколько дней до пятницы
    let daysUntilFriday = (5 - currentDay + 7) % 7;
    
    // Если сегодня пятница, но время уже после 21:00 — берем следующую пятницу
    if (daysUntilFriday === 0 && now.getHours() >= 21) {
      daysUntilFriday = 7;
    }

    resultDate.setDate(now.getDate() + daysUntilFriday);
    resultDate.setHours(20, 0, 0, 0); // Время свидания: 20:00
    return resultDate;
  }

  const targetDate = getNextFriday();

  // Форматируем красивый текст для пятницы (например: "В эту пятницу, 25 сентября")
  const monthsRu = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const dynamicFridayText = document.getElementById('dynamic-friday-text');
  const ticketDateStr = document.getElementById('ticket-date-str');
  const formattedDate = `Пятница, ${targetDate.getDate()} ${monthsRu[targetDate.getMonth()]}`;
  
  if (dynamicFridayText) {
    dynamicFridayText.textContent = `В эту пятницу (${targetDate.getDate()} ${monthsRu[targetDate.getMonth()]})`;
  }
  if (ticketDateStr) {
    ticketDateStr.textContent = formattedDate;
  }

  // Обновление цифр таймера
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);


  // -------------------------------------------------------------------
  // 5. ИНТЕРАКТИВНЫЙ ЧЕК-ЛИСТ («ПРИ СЕБЕ ИМЕТЬ»)
  // -------------------------------------------------------------------
  const checkboxes = document.querySelectorAll('.custom-checkbox');
  const checklistBanner = document.getElementById('checklist-banner');

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      playSweetChime();
      
      const allChecked = Array.from(checkboxes).every(item => item.checked);
      if (allChecked) {
        checklistBanner.classList.remove('hidden');
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 40,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#ff3366', '#ffb834', '#ffd3b6']
          });
        }
      } else {
        checklistBanner.classList.add('hidden');
      }
    });
  });


  // -------------------------------------------------------------------
  // 6. КНОПКИ РЕШЕНИЯ («Я СОГЛАСНА» И «Я ПОДУМАЮ...»)
  // -------------------------------------------------------------------
  const btnAccept = document.getElementById('btn-accept');
  const btnPlayful = document.getElementById('btn-playful');
  const playfulText = document.getElementById('playful-text');
  const ticketModal = document.getElementById('ticket-modal');
  const modalClose = document.getElementById('modal-close');

  function triggerCelebration() {
    // Автоматически отмечаем все пункты в чек-листе, если еще не отмечены
    checkboxes.forEach(cb => cb.checked = true);
    checklistBanner.classList.remove('hidden');

    // Праздничный фейерверк из конфетти
    if (typeof confetti === 'function') {
      const end = Date.now() + 2500;
      const colors = ['#ff3366', '#ff758c', '#ffb834', '#ff6b35', '#ffe5a3'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }

    playSweetChime();
    ticketModal.classList.remove('hidden');
  }

  btnAccept.addEventListener('click', triggerCelebration);

  modalClose.addEventListener('click', () => {
    ticketModal.classList.add('hidden');
  });

  ticketModal.addEventListener('click', (e) => {
    if (e.target === ticketModal || e.target.classList.contains('modal-backdrop')) {
      ticketModal.classList.add('hidden');
    }
  });

  // Логика игривой кнопки «Я подумаю...»
  let playfulClickCount = 0;
  const playfulStages = [
    { text: 'Точно подумаешь? 😉', x: 25, y: -8 },
    { text: 'А если с двойными чипсиками? 🍟🥤', x: -25, y: 10 },
    { text: 'Ну без вариантов, ты же любишь меня! 🥰', x: 15, y: -12 },
    { text: 'Ладно, уговорил! Я согласна! ❤️', isFinal: true }
  ];

  btnPlayful.addEventListener('click', (e) => {
    if (playfulClickCount < playfulStages.length) {
      const stage = playfulStages[playfulClickCount];
      playSweetChime();

      if (stage.isFinal) {
        // Кнопка превращается в кнопку согласия
        btnPlayful.style.transform = 'none';
        btnPlayful.style.background = 'linear-gradient(135deg, #ff3366, #ff9e00)';
        btnPlayful.style.color = '#fff';
        btnPlayful.style.borderColor = 'transparent';
        playfulText.textContent = stage.text;
        
        // По следующему клику или прямо сейчас запускаем согласие
        btnPlayful.onclick = triggerCelebration;
        triggerCelebration();
      } else {
        playfulText.textContent = stage.text;
        btnPlayful.style.transform = `translate(${stage.x}px, ${stage.y}px)`;
        playfulClickCount++;
      }
    }
  });


  // -------------------------------------------------------------------
  // 7. СОХРАНЕНИЕ В КАЛЕНДАРЬ (.ICS ФАЙЛ ДЛЯ IPHONE И ANDROID)
  // -------------------------------------------------------------------
  const btnCalendar = document.getElementById('btn-calendar');

  function generateAndDownloadICS() {
    // Начало и конец события (Пятница 20:00 - 23:00)
    const startDate = new Date(targetDate);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 0, 0, 0);

    function formatICSDate(d) {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    const startICS = formatICSDate(startDate);
    const endICS = formatICSDate(endDate);

    const title = 'Свидание с любимым ❤️ (видеозвонок с камерами)';
    const description = 'Уютное свидание! При себе иметь: 1. Мою любимую девушку (тебя), 2. Вкусняшки, энергосики и чипсики, 3. Хорошее настроение. Люблю тебя безумно!';
    const location = 'Домашний уют, видеозвонок с включенными камерами 📹❤️';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Our Romantic Date//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${startICS}`,
      `DTEND:${endICS}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Напоминание: Свидание через 1 час! Пора открывать чипсики и краситься 🥰',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'date_with_love.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Дополнительно уведомим
    playSweetChime();
  }

  if (btnCalendar) {
    btnCalendar.addEventListener('click', generateAndDownloadICS);
  }


  // -------------------------------------------------------------------
  // 8. ОТПРАВИТЬ ОТВЕТ В TELEGRAM
  // -------------------------------------------------------------------
  const btnShareTelegram = document.getElementById('btn-share-telegram');

  if (btnShareTelegram) {
    btnShareTelegram.addEventListener('click', () => {
      const message = encodeURIComponent(
        'Любимый, я согласна на свидание в эту пятницу! ❤️\nЧипсики, энергосики и хорошее настроение уже готовлю 🥰 📹'
      );
      // Ссылка для отправки себе в Telegram
      window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${message}`, '_blank');
    });
  }

});
