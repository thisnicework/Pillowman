/**
 * THE PILLOWMAN - Interactive Application Logic
 * Seoul Institute of the Arts Musical Adaptation
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCountdown();
  initGuidelineTabs();
  initTeamTabs();
  initPosterModal();
  initBookingSystem();
  initLookupSystem();
  initAddressCopy();
  initAtmosphereAudio();
});

/* ==========================================================================
   1. NAVBAR & SCROLL INTERACTIONS
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const floatingBar = document.querySelector('.floating-ticket-bar');
  const heroSection = document.querySelector('.hero-section');
  const navLinkItems = document.querySelectorAll('.nav-link');

  // Sticky header and floating ticket bar on scroll
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (heroSection) {
      const heroHeight = heroSection.offsetHeight;
      if (scrollY > heroHeight * 0.7) {
        floatingBar.classList.add('visible');
      } else {
        floatingBar.classList.remove('visible');
      }
    }

    // Scrollspy for active nav link
    const sections = document.querySelectorAll('section[id]');
    let currentSectionId = '';

    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      const secHeight = sec.offsetHeight;
      if (scrollY >= secTop && scrollY < secTop + secHeight) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navLinkItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
    });

    navLinkItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('open');
        mobileToggle.classList.remove('active');
      });
    });
  }

  // Scroll to top button in floating bar
  const btnTop = document.querySelector('.btn-floating-top');
  if (btnTop) {
    btnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   2. TICKET OPEN COUNTDOWN TIMER
   Target: 2026. 10. 22. 20:00 (Thursday)
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minutesEl = document.getElementById('count-minutes');
  const secondsEl = document.getElementById('count-seconds');
  const statusBadge = document.getElementById('countdown-status-badge');

  // Target date: October 22, 2026 20:00 KST
  const targetDate = new Date('2026-10-22T20:00:00+09:00').getTime();

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      if (statusBadge) {
        statusBadge.textContent = 'TICKET OPEN NOW 예매 진행 중';
        statusBadge.style.background = '#10b981';
        statusBadge.style.color = '#fff';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   3. GUIDELINE TABS SWITCHER
   ========================================================================== */
function initGuidelineTabs() {
  const tabBtns = document.querySelectorAll('.guideline-tabs .tab-btn');
  const tabPanels = document.querySelectorAll('.guidelines-panels .guideline-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   4. TEAM SECTION TABS SWITCHER
   ========================================================================== */
function initTeamTabs() {
  const teamBtns = document.querySelectorAll('.team-nav-btn');
  const teamPanels = document.querySelectorAll('.team-tab-panel');

  teamBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-team-tab');

      teamBtns.forEach(b => b.classList.remove('active'));
      teamPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   5. POSTER ZOOM MODAL
   ========================================================================== */
function initPosterModal() {
  const posterWrap = document.querySelector('.poster-preview-wrap');
  const posterModal = document.getElementById('poster-modal');
  const closeBtn = posterModal?.querySelector('.btn-close-modal');

  if (posterWrap && posterModal) {
    posterWrap.addEventListener('click', () => {
      openModal(posterModal);
    });

    closeBtn?.addEventListener('click', () => {
      closeModal(posterModal);
    });

    posterModal.addEventListener('click', (e) => {
      if (e.target === posterModal) {
        closeModal(posterModal);
      }
    });
  }
}

/* ==========================================================================
   6. INTERACTIVE TICKET BOOKING SYSTEM (LocalStorage Mock Engine)
   ========================================================================== */
function initBookingSystem() {
  const bookBtns = document.querySelectorAll('.trigger-booking-modal');
  const bookingModal = document.getElementById('booking-modal');
  const closeBtn = bookingModal?.querySelector('.btn-close-modal');
  const bookingForm = document.getElementById('ticket-booking-form');
  const phoneInput = document.getElementById('book-phone');
  const bookingResult = document.getElementById('booking-result-card');

  // Auto-format phone input (010-XXXX-XXXX)
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^0-9]/g, '');
      if (val.length > 3 && val.length <= 7) {
        val = val.slice(0, 3) + '-' + val.slice(3);
      } else if (val.length > 7) {
        val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
      }
      e.target.value = val;
    });
  }

  // Open booking modal
  bookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Check if ticket open period
      const now = new Date().getTime();
      const openTime = new Date('2026-10-22T20:00:00+09:00').getTime();
      const closeTime = new Date('2026-10-30T23:59:59+09:00').getTime();

      // Show modal regardless for test/patron experience with alert if before open
      if (bookingForm) bookingForm.style.display = 'block';
      if (bookingResult) bookingResult.style.display = 'none';
      openModal(bookingModal);
    });
  });

  closeBtn?.addEventListener('click', () => {
    closeModal(bookingModal);
  });

  bookingModal?.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      closeModal(bookingModal);
    }
  });

  // Booking Form Submission
  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('book-name').value.trim();
    const phone = document.getElementById('book-phone').value.trim();
    const agreeAge = document.getElementById('agree-age').checked;
    const agreeTrigger = document.getElementById('agree-trigger').checked;
    const agreeCancellation = document.getElementById('agree-cancellation').checked;

    if (!name) {
      showToast('예매자 성함을 입력해 주세요.');
      return;
    }

    if (!phone || phone.length < 12) {
      showToast('올바른 휴대폰 번호를 입력해 주세요.');
      return;
    }

    if (!agreeAge || !agreeTrigger || !agreeCancellation) {
      showToast('모든 관람 안내 및 유의사항에 동의해 주세요.');
      return;
    }

    // Check existing booking in localStorage
    const reservations = getReservations();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const exists = reservations.some(r => r.phone.replace(/[^0-9]/g, '') === cleanPhone);

    if (exists) {
      showToast('이미 예매 내역이 존재합니다. 1인 1매만 예매 가능합니다.');
      return;
    }

    // Generate Reservation
    const bookingCode = 'PLW-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newReservation = {
      code: bookingCode,
      name: name,
      phone: phone,
      showTitle: '뮤지컬 〈필로우맨〉',
      date: '2026. 11. 1.(일) 13:00',
      venue: '서울예술대학교 마동 1층 예장',
      seatType: '전석 비지정석 (현장 수령 선착순 배정)',
      price: '전석 무료',
      bookedAt: new Date().toLocaleString('ko-KR')
    };

    reservations.push(newReservation);
    localStorage.setItem('pillowman_reservations', JSON.stringify(reservations));

    // Render Confirmation Voucher
    renderBookingResult(newReservation);
    showToast('예매가 정상적으로 완료되었습니다!');
  });
}

function renderBookingResult(res) {
  const form = document.getElementById('ticket-booking-form');
  const resultCard = document.getElementById('booking-result-card');

  if (form) form.style.display = 'none';
  if (resultCard) {
    resultCard.style.display = 'block';
    resultCard.innerHTML = `
      <div class="eticket-card">
        <div class="eticket-header">
          <div>
            <div class="eticket-title">뮤지컬 〈필로우맨〉 E-TICKET</div>
            <div style="font-family: var(--font-sans); font-size: 0.78rem; color: #10b981; margin-top: 4px;">● 예매 완료 (OFFICIAL VOUCHER)</div>
          </div>
          <div class="eticket-num">${res.code}</div>
        </div>
        <div class="eticket-grid">
          <div class="eticket-field">
            <div class="lbl">예매자 성명</div>
            <div class="val">${res.name}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">연락처</div>
            <div class="val">${res.phone}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">공연 일시</div>
            <div class="val">${res.date}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">공연 장소</div>
            <div class="val">${res.venue}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">좌석 등급</div>
            <div class="val">${res.seatType}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">티켓 가격</div>
            <div class="val" style="color: #10b981;">전석 무료 (1매)</div>
          </div>
        </div>
        <div class="eticket-barcode-wrap">
          <svg class="barcode-svg" viewBox="0 0 280 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="4" height="40" fill="#fff" />
            <rect x="8" y="0" width="2" height="40" fill="#fff" />
            <rect x="14" y="0" width="6" height="40" fill="#fff" />
            <rect x="24" y="0" width="2" height="40" fill="#fff" />
            <rect x="30" y="0" width="4" height="40" fill="#fff" />
            <rect x="38" y="0" width="8" height="40" fill="#fff" />
            <rect x="50" y="0" width="3" height="40" fill="#fff" />
            <rect x="58" y="0" width="6" height="40" fill="#fff" />
            <rect x="68" y="0" width="2" height="40" fill="#fff" />
            <rect x="74" y="0" width="5" height="40" fill="#fff" />
            <rect x="84" y="0" width="3" height="40" fill="#fff" />
            <rect x="92" y="0" width="7" height="40" fill="#fff" />
            <rect x="104" y="0" width="4" height="40" fill="#fff" />
            <rect x="112" y="0" width="2" height="40" fill="#fff" />
            <rect x="118" y="0" width="8" height="40" fill="#fff" />
            <rect x="130" y="0" width="4" height="40" fill="#fff" />
            <rect x="138" y="0" width="2" height="40" fill="#fff" />
            <rect x="144" y="0" width="6" height="40" fill="#fff" />
            <rect x="154" y="0" width="3" height="40" fill="#fff" />
            <rect x="162" y="0" width="5" height="40" fill="#fff" />
            <rect x="172" y="0" width="2" height="40" fill="#fff" />
            <rect x="178" y="0" width="8" height="40" fill="#fff" />
            <rect x="190" y="0" width="4" height="40" fill="#fff" />
            <rect x="198" y="0" width="6" height="40" fill="#fff" />
            <rect x="208" y="0" width="2" height="40" fill="#fff" />
            <rect x="214" y="0" width="4" height="40" fill="#fff" />
            <rect x="222" y="0" width="7" height="40" fill="#fff" />
            <rect x="234" y="0" width="3" height="40" fill="#fff" />
            <rect x="242" y="0" width="5" height="40" fill="#fff" />
            <rect x="252" y="0" width="2" height="40" fill="#fff" />
            <rect x="258" y="0" width="8" height="40" fill="#fff" />
            <rect x="270" y="0" width="4" height="40" fill="#fff" />
          </svg>
          <div class="eticket-barcode-code">${res.code}</div>
        </div>
      </div>
      <div style="font-family: var(--font-serif); font-size: 0.88rem; color: var(--parchment-muted); margin-bottom: 20px; line-height: 1.6;">
        ※ 공연 당일 1시간 전부터 마동 로비 티켓부스에서 <strong>예매자 성함 및 연락처 뒷자리</strong>를 제시하시면 지류 티켓으로 수령하실 수 있습니다.<br>
        ※ 공연 시작 5분 전까지 미수령 시 현장 취소표로 전환됩니다.
      </div>
      <div class="modal-actions-dual">
        <button type="button" class="btn-modal-print" onclick="window.print()">
          🖨️ 티켓 인쇄 / 저장
        </button>
        <button type="button" class="btn-modal-cancel-ticket" onclick="closeModal(document.getElementById('booking-modal'))">
          확인 완료
        </button>
      </div>
    `;
  }
}

/* ==========================================================================
   7. INTERACTIVE BOOKING LOOKUP & CANCELLATION
   ========================================================================== */
function initLookupSystem() {
  const lookupBtn = document.querySelector('.trigger-lookup-modal');
  const lookupModal = document.getElementById('lookup-modal');
  const closeBtn = lookupModal?.querySelector('.btn-close-modal');
  const lookupForm = document.getElementById('ticket-lookup-form');
  const lookupPhoneInput = document.getElementById('lookup-phone');
  const lookupResult = document.getElementById('lookup-result-card');

  if (lookupPhoneInput) {
    lookupPhoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^0-9]/g, '');
      if (val.length > 3 && val.length <= 7) {
        val = val.slice(0, 3) + '-' + val.slice(3);
      } else if (val.length > 7) {
        val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
      }
      e.target.value = val;
    });
  }

  lookupBtn?.addEventListener('click', () => {
    if (lookupForm) lookupForm.style.display = 'block';
    if (lookupResult) lookupResult.style.display = 'none';
    openModal(lookupModal);
  });

  closeBtn?.addEventListener('click', () => {
    closeModal(lookupModal);
  });

  lookupModal?.addEventListener('click', (e) => {
    if (e.target === lookupModal) {
      closeModal(lookupModal);
    }
  });

  lookupForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('lookup-name').value.trim();
    const phone = document.getElementById('lookup-phone').value.trim();

    if (!name || !phone) {
      showToast('성함과 연락처를 모두 입력해 주세요.');
      return;
    }

    const reservations = getReservations();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const found = reservations.find(r => 
      r.name === name && r.phone.replace(/[^0-9]/g, '') === cleanPhone
    );

    if (!found) {
      showToast('일치하는 예매 내역을 찾을 수 없습니다.');
      return;
    }

    renderLookupResult(found);
  });
}

function renderLookupResult(res) {
  const form = document.getElementById('ticket-lookup-form');
  const resultCard = document.getElementById('lookup-result-card');

  if (form) form.style.display = 'none';
  if (resultCard) {
    resultCard.style.display = 'block';
    resultCard.innerHTML = `
      <div class="eticket-card">
        <div class="eticket-header">
          <div>
            <div class="eticket-title">뮤지컬 〈필로우맨〉 예매 내역</div>
            <div style="font-family: var(--font-sans); font-size: 0.78rem; color: #10b981; margin-top: 4px;">● 유효한 예매 내역 (ACTIVE)</div>
          </div>
          <div class="eticket-num">${res.code}</div>
        </div>
        <div class="eticket-grid">
          <div class="eticket-field">
            <div class="lbl">예매자</div>
            <div class="val">${res.name}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">연락처</div>
            <div class="val">${res.phone}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">공연 일시</div>
            <div class="val">${res.date}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">공연 장소</div>
            <div class="val">${res.venue}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">좌석 구분</div>
            <div class="val">${res.seatType}</div>
          </div>
          <div class="eticket-field">
            <div class="lbl">티켓 가격</div>
            <div class="val" style="color: #10b981;">전석 무료 (1매)</div>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 24px; padding: 14px; background: rgba(220, 38, 38, 0.1); border-left: 3px solid var(--crimson-blood); border-radius: 4px;">
        <p style="font-family: var(--font-serif); font-size: 0.88rem; color: #fca5a5; line-height: 1.5;">
          ※ 관람이 어려우실 경우, 다른 관객분들이 기회를 얻을 수 있도록 예매를 취소해 주시기 바랍니다.
        </p>
      </div>
      <div class="modal-actions-dual">
        <button type="button" class="btn-modal-cancel-ticket" id="btn-cancel-reservation" data-code="${res.code}">
          예매 취소하기
        </button>
        <button type="button" class="btn-modal-print" onclick="window.print()">
          티켓 인쇄
        </button>
      </div>
    `;

    document.getElementById('btn-cancel-reservation')?.addEventListener('click', () => {
      if (confirm('정말로 예매를 취소하시겠습니까? 취소된 좌석은 다른 관객에게 즉시 반환됩니다.')) {
        cancelReservation(res.code);
      }
    });
  }
}

function cancelReservation(code) {
  let reservations = getReservations();
  reservations = reservations.filter(r => r.code !== code);
  localStorage.setItem('pillowman_reservations', JSON.stringify(reservations));

  showToast('예매가 성공적으로 취소되었습니다.');
  closeModal(document.getElementById('lookup-modal'));
}

function getReservations() {
  try {
    const data = localStorage.getItem('pillowman_reservations');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/* ==========================================================================
   8. ADDRESS COPY FUNCTION WITH TOAST
   ========================================================================== */
function initAddressCopy() {
  const copyBtn = document.querySelector('.btn-copy-address');
  const addressText = '경기도 안산시 단원구 예술대학로 171, 서울예술대학교 마동 1층 예장';

  copyBtn?.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(addressText).then(() => {
        showToast('공연장 주소가 클립보드에 복사되었습니다.');
      }).catch(() => {
        fallbackCopy(addressText);
      });
    } else {
      fallbackCopy(addressText);
    }
  });
}

function fallbackCopy(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast('공연장 주소가 클립보드에 복사되었습니다.');
}

function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   9. MODAL HELPER UTILS
   ========================================================================== */
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ==========================================================================
   10. OPTIONAL THEATRICAL ATMOSPHERE AUDIO (Web Audio API Synthesizer)
   Produces a subtle, spine-chilling vintage cello drone & typewriter clack
   ========================================================================== */
function initAtmosphereAudio() {
  const toggleBtn = document.getElementById('audio-toggle-btn');
  let audioCtx = null;
  let isPlaying = false;
  let droneOsc1 = null;
  let droneOsc2 = null;
  let masterGain = null;

  toggleBtn?.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isPlaying) {
      startAtmosphere();
      isPlaying = true;
      toggleBtn.classList.add('active');
      toggleBtn.innerHTML = '🔊 ATMOSPHERE SOUND: ON';
      showToast('취조실 앰비언스 사운드가 켜졌습니다.');
    } else {
      stopAtmosphere();
      isPlaying = false;
      toggleBtn.classList.remove('active');
      toggleBtn.innerHTML = '🔈 ATMOSPHERE SOUND: OFF';
      showToast('사운드가 음소거되었습니다.');
    }
  });

  function startAtmosphere() {
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 3);
    masterGain.connect(audioCtx.destination);

    // Deep low cello drone (C2 - 65.4Hz)
    droneOsc1 = audioCtx.createOscillator();
    droneOsc1.type = 'sawtooth';
    droneOsc1.frequency.setValueAtTime(65.4, audioCtx.currentTime);

    // Low pass filter to make it dark and muffled
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, audioCtx.currentTime);

    droneOsc1.connect(filter);
    filter.connect(masterGain);
    droneOsc1.start();

    // Subtle haunting dissonance (69.3Hz - C#2)
    droneOsc2 = audioCtx.createOscillator();
    droneOsc2.type = 'sine';
    droneOsc2.frequency.setValueAtTime(69.3, audioCtx.currentTime);
    droneOsc2.connect(filter);
    droneOsc2.start();
  }

  function stopAtmosphere() {
    if (masterGain && audioCtx) {
      masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
      setTimeout(() => {
        droneOsc1?.stop();
        droneOsc2?.stop();
        droneOsc1?.disconnect();
        droneOsc2?.disconnect();
      }, 1000);
    }
  }
}
