/* ==========================================================================
   МЕЧТА® FAMILY DENTAL CLINIC (НЕФТЕЮГАНСК, 8 МКР, Д. 13) — APP.JS
   Choreography:
   1. Zoom-Through Arch Portal Preloader -> Hero Reveal
   2. Interactive Symptom Navigator ("Что вас беспокоит прямо сейчас?")
   3. Horizontal Expanding Accordion Deck (#services)
   4. Tactile Family Care Slip (#booking) with Scroll-Then-Act (1220ms) & Reset-On-Leave
   ========================================================================== */

(function () {
  "use strict";

  const hasGSAP = typeof window.gsap !== "undefined";
  const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  const hasLenis = typeof window.Lenis !== "undefined";

  if (hasGSAP && hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------------------------------------------------------
     1. LENIS SMOOTH SCROLL + ANCHOR INTERCEPTION
     -------------------------------------------------------------------------- */
  let lenis = null;
  if (hasLenis && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.12,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    if (hasGSAP && hasScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  function smoothScrollTo(targetSelector, offset = -84) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.15 });
    } else {
      const top = target.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      if (link.classList.contains("js-pick-service") || link.classList.contains("js-jump-symptom")) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        smoothScrollTo(href, href === "#top" ? 0 : -84);
      }
    });
  });

  /* --------------------------------------------------------------------------
     2. SLIDING NAVBAR INDICATOR PILL
     -------------------------------------------------------------------------- */
  const nav = document.getElementById("main-nav");
  const navIndicator = document.getElementById("nav-indicator");
  const navLinks = nav ? Array.from(nav.querySelectorAll(".nav__link")) : [];

  function moveNavIndicator(linkEl) {
    if (!nav || !navIndicator || !linkEl) return;
    const navRect = nav.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    const left = linkRect.left - navRect.left - 4;
    navIndicator.style.width = `${linkRect.width}px`;
    navIndicator.style.transform = `translate3d(${left}px, 0, 0)`;
    navIndicator.style.opacity = "1";
  }

  if (navLinks.length > 0) {
    const activeLink = nav.querySelector(".nav__link.is-active") || navLinks[0];
    window.addEventListener("load", () => moveNavIndicator(activeLink));
    window.addEventListener("resize", () => {
      const current = nav.querySelector(".nav__link.is-active") || navLinks[0];
      moveNavIndicator(current);
    });

    navLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => moveNavIndicator(link));
      link.addEventListener("click", () => {
        navLinks.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
        moveNavIndicator(link);
      });
    });

    nav.addEventListener("mouseleave", () => {
      const current = nav.querySelector(".nav__link.is-active") || navLinks[0];
      moveNavIndicator(current);
    });
  }

  /* --------------------------------------------------------------------------
     3. PRELOADER -> 5-PART ANGULAR BOTTOM-RIGHT TO TOP-LEFT CURTAIN & WORDMARK HANDOFF
     -------------------------------------------------------------------------- */
  function initAngularCurtainReveal() {
    const preloader = document.getElementById("preloader");
    const parts = preloader ? Array.from(preloader.querySelectorAll(".preloader__part")) : [];
    const masks = preloader ? Array.from(preloader.querySelectorAll(".preloader__mask")) : [];
    const words = preloader ? Array.from(preloader.querySelectorAll(".preloader__word")) : [];
    const heroTitle = document.getElementById("hero-title");
    const heroPortal = document.getElementById("hero-portal");
    const heroReveals = document.querySelectorAll(".hero-reveal");

    if (!preloader || !parts.length || !heroTitle || !hasGSAP || prefersReducedMotion || window.scrollY > 80) {
      if (preloader) preloader.classList.add("is-hidden");
      return;
    }

    const heroRect = heroTitle.getBoundingClientRect();
    const startOffsetX = Math.round(
      Math.max(0, (window.innerWidth - heroRect.width) * 0.45 - heroRect.left)
    );
    const startOffsetY = Math.round(
      (window.innerHeight - heroRect.height) * 0.52 - heroRect.top
    );

    function diagBandPoly(s1, s2) {
      return `polygon(${s1 - 200}% 200%, ${s1 + 100}% -100%, ${s2 + 100}% -100%, ${s2 - 200}% 200%)`;
    }

    const bands = [
      { s1: 0, s2Start: 40.4 },
      { s1: 40, s2Start: 80.4 },
      { s1: 80, s2Start: 120.4 },
      { s1: 120, s2Start: 160.4 },
      { s1: 160, s2Start: 200 },
    ];

    parts.forEach((part, idx) => {
      const b = bands[idx];
      if (b) gsap.set(part, { clipPath: diagBandPoly(b.s1, b.s2Start) });
    });

    gsap.set(masks, {
      left: heroRect.left + startOffsetX,
      top: heroRect.top + startOffsetY,
      x: 0,
      y: 0,
      opacity: 1,
    });
    gsap.set(words, { y: 0, yPercent: 112, color: "#181D1A" });
    gsap.set(heroTitle, { x: startOffsetX, y: startOffsetY });
    gsap.set(heroReveals, { y: 26, autoAlpha: 0 });
    if (heroPortal) {
      gsap.set(heroPortal, { xPercent: 6, yPercent: 6, scale: 1.06 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(heroTitle, { clearProps: "transform" });
        if (heroPortal) gsap.set(heroPortal, { clearProps: "transform" });
        preloader.classList.add("is-hidden");
        if (hasScrollTrigger) ScrollTrigger.refresh();
      },
    });

    // Beat 1: Dark wordmark rises out of baseline mask in the center of the loading screen
    tl.to(
      words,
      {
        y: 0,
        yPercent: 0,
        duration: 0.62,
        ease: "power4.out",
      },
      0.05
    );

    // Beat 2: All 5 angled diagonal parts wipe from bottom-right corner toward top-left corner while wordmark glides into Hero
    parts.forEach((part, idx) => {
      const b = bands[idx];
      if (!b) return;
      tl.to(
        part,
        {
          clipPath: diagBandPoly(b.s1, b.s1),
          duration: 0.94,
          ease: "expo.inOut",
        },
        0.72
      );
    });

    tl.to(
      masks,
      {
        x: -startOffsetX,
        y: -startOffsetY,
        duration: 0.94,
        ease: "expo.inOut",
      },
      0.72
    ).to(
      heroTitle,
      {
        x: 0,
        y: 0,
        duration: 0.94,
        ease: "expo.inOut",
      },
      0.72
    );

    if (heroPortal) {
      tl.to(
        heroPortal,
        {
          xPercent: 0,
          yPercent: 0,
          scale: 1,
          duration: 0.94,
          ease: "expo.inOut",
        },
        0.72
      );
    }

    // Beat 3: Hero UI elements rise smoothly after angular curtains open
    tl.to(
      heroReveals,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.58,
        stagger: 0.06,
        ease: "power3.out",
      },
      1.38
    );
  }

  initAngularCurtainReveal();

  /* --------------------------------------------------------------------------
     4. INTERACTIVE SYMPTOM NAVIGATOR ("ЧТО ВАС БЕСПОКОИТ ПРЯМО СЕЙЧАС?")
     -------------------------------------------------------------------------- */
  const SYMPTOM_DATA = {
    pain: {
      img: "assets/symptom-01-pain.webp?v=1",
      alt: "Бережная помощь при зубной боли в стоматологии Мечта",
      doctor: "Врач: Стоматолог-терапевт",
      time: "ПРИЁМ ЗА 30–45 МИНУТ · ОСМОТР 0 ₽",
      price: "от 4 500 ₽",
      title: "Снимем боль в первый же визит и спокойно сохраним зуб",
      serviceValue: "Болит зуб / реагирует на холодное (осмотр 0 ₽)",
      steps: [
        "Двухэтапное обезболивание: сначала обезболивающий гель на десну, затем мягкий укол",
        "Бережно уберём воспаление и поставим прочную пломбу за 1 приём",
        "Точную стоимость назовём после бесплатного осмотра до начала работы",
      ],
    },
    filling: {
      img: "assets/symptom-02-filling.webp?v=1",
      alt: "Замена выпавшей пломбы и реставрация зуба за 1 визит",
      doctor: "Врач: Терапевт-реставратор",
      time: "ВОССТАНОВЛЕНИЕ ЗА 1 ВИЗИТ · ОСМОТР 0 ₽",
      price: "от 4 500 ₽",
      title: "Аккуратно восстановим выпавшую пломбу или скол точно в цвет зуба",
      serviceValue: "Лечение кариеса / замена пломбы",
      steps: [
        "Осмотрим зуб бесплатно (0 ₽) и проверим, не задет ли нерв",
        "Подберём оттенок материала так, чтобы пломба была совершенно незаметна",
        "Отполируем зуб по прикусу, чтобы ничего не мешало с первой минуты",
      ],
    },
    wisdom: {
      img: "assets/symptom-03-wisdom.webp?v=1",
      alt: "Бережное удаление зуба мудрости в стоматологии Мечта",
      doctor: "Врач: Стоматолог-хирург",
      time: "БЕЗ БОЛИ И СТРЕССА · ОСМОТР 0 ₽",
      price: "от 6 500 ₽",
      title: "Бережно удалим проблемную «восьмёрку» без спешки и страха",
      serviceValue: "Бережное удаление зуба / зуба мудрости",
      steps: [
        "Сначала проведём бесплатный осмотр хирурга и оценим положение корней",
        "Дождёмся 100% действия современной анестезии перед началом процедуры",
        "Дадим понятную памятку по уходу дома и пригласим на бесплатный контроль",
      ],
    },
    family: {
      img: "assets/symptom-04-family.webp?v=1",
      alt: "Семейный и детский приём в стоматологии Мечта",
      doctor: "Врач: Семейный стоматолог",
      time: "ДЛЯ ВЗРОСЛЫХ И ДЕТЕЙ · ОСМОТР 0 ₽",
      price: "Осмотр 0 ₽",
      title: "Спокойный осмотр для ребёнка или всей семьи в удобное время подряд",
      serviceValue: "Семейный или детский осмотр (0 ₽)",
      steps: [
        "Доброжелательное знакомство с врачом в тёплой обстановке без страха",
        "Администратор подберёт соседние окна, чтобы принять семью за один приезд",
        "Честно скажем, какие зубы здоровы, а какие стоит полечить",
      ],
    },
    checkup: {
      img: "assets/hero-mechta-portal.webp?v=1",
      alt: "Бесплатный профилактический осмотр в стоматологии Мечта",
      doctor: "Врач: Ведущий терапевт",
      time: "ПРОФИЛАКТИКА 20–30 МИН · 0 ₽",
      price: "0 ₽",
      title: "Бесплатный профилактический осмотр и понятный план без обязательств",
      serviceValue: "Бесплатный осмотр — врач сам подскажет на приёме (0 ₽)",
      steps: [
        "Проверим состояние всех зубов и старых пломб без спешки (0 ₽)",
        "Ответим на все вопросы простыми человеческими словами",
        "Если лечение нужно — составим честную смету, решение всегда за вами",
      ],
    },
  };

  const symptomBtns = document.querySelectorAll(".symptom-btn");
  const symptomStage = document.getElementById("symptom-stage");
  const symptomImg = document.getElementById("symptom-img");
  const symptomDoctor = document.getElementById("symptom-doctor-badge");
  const symptomTime = document.getElementById("symptom-time-tag");
  const symptomPrice = document.getElementById("symptom-price-tag");
  const symptomTitle = document.getElementById("symptom-title");
  const symptomSteps = document.getElementById("symptom-steps");
  const symptomCta = document.getElementById("symptom-cta");

  function switchSymptom(key) {
    const data = SYMPTOM_DATA[key] || SYMPTOM_DATA.pain;
    symptomBtns.forEach((b) => {
      b.classList.toggle("is-active", b.getAttribute("data-symptom-key") === key);
    });

    if (hasGSAP && !prefersReducedMotion && symptomStage) {
      gsap.fromTo(
        symptomStage,
        { y: 8, autoAlpha: 0.72 },
        { y: 0, autoAlpha: 1, duration: 0.32, ease: "power2.out" }
      );
    }

    if (symptomImg) {
      symptomImg.src = data.img;
      symptomImg.alt = data.alt;
    }
    if (symptomDoctor) symptomDoctor.textContent = data.doctor;
    if (symptomTime) symptomTime.textContent = data.time;
    if (symptomPrice) symptomPrice.textContent = data.price;
    if (symptomTitle) symptomTitle.textContent = data.title;
    if (symptomCta) symptomCta.setAttribute("data-service", data.serviceValue);
    if (symptomSteps) {
      symptomSteps.innerHTML = data.steps.map((s) => `<li><span>+</span> ${s}</li>`).join("");
    }
  }

  symptomBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-symptom-key");
      if (key) switchSymptom(key);
    });
  });

  document.querySelectorAll(".js-jump-symptom").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const key = link.getAttribute("data-symptom");
      if (key) switchSymptom(key);
      smoothScrollTo("#navigator", -76);
    });
  });

  /* --------------------------------------------------------------------------
     5. SCROLL-DRIVEN HORIZONTAL EXPANDING ACCORDION DECK (#services)
        - Generous initial dwell (0.00 -> 0.28) so user calmly reads Panel 01 first
        - Smooth scroll-driven transitions across Panels 01 -> 02 -> 03 -> 04
        - Manual click also supported
     -------------------------------------------------------------------------- */
  const accPanels = Array.from(document.querySelectorAll(".acc-panel"));
  const accCountEl = document.getElementById("acc-count");
  const accFillEl = document.getElementById("acc-fill");
  const accPinWrap = document.getElementById("accordion-pin");
  let activeAccIdx = 0;

  function setActiveAccordionPanel(idx) {
    if (idx === activeAccIdx && accPanels[idx]?.classList.contains("is-open")) return;
    activeAccIdx = idx;
    accPanels.forEach((p, i) => {
      const isCurrent = i === idx;
      p.classList.toggle("is-open", isCurrent);
      const btn = p.querySelector(".acc-panel__trigger");
      if (btn) btn.setAttribute("aria-expanded", isCurrent ? "true" : "false");
    });
    if (accCountEl) accCountEl.textContent = `0${idx + 1} / 04`;
  }

  accPanels.forEach((panel, idx) => {
    const trigger = panel.querySelector(".acc-panel__trigger");
    if (trigger) {
      trigger.addEventListener("click", () => {
        setActiveAccordionPanel(idx);
      });
    }
  });

  if (accPinWrap && accPanels.length === 4 && hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1081px)", () => {
      ScrollTrigger.create({
        trigger: accPinWrap,
        pin: true,
        scrub: 0.35,
        start: "top top",
        end: "+=2700",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          // Generous reading hold on Panel 01 (first 28% of scroll) so it never switches prematurely
          let targetIdx = 0;
          if (p < 0.28) {
            targetIdx = 0;
          } else if (p < 0.54) {
            targetIdx = 1;
          } else if (p < 0.78) {
            targetIdx = 2;
          } else {
            targetIdx = 3;
          }
          setActiveAccordionPanel(targetIdx);
          if (accFillEl) {
            accFillEl.style.width = `${Math.max(25, Math.round(p * 100))}%`;
          }
        },
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. INTERACTIVE CLINIC RECEIPT DISPENSER (#booking)
        - Full RECEIPT_CATALOG with concrete ₽ price orientirs for every option
        - Vertical stepped print-in from .receipt-dispenser__slot-lip (x: 0, rotation: 0)
        - Scroll-Then-Act (1220ms delay when triggered via .js-pick-service)
        - Strict lock (isJumpingToBooking + isSlipAnimating) so it NEVER plays twice!
        - Reset-On-Leave (retracts when scrolling away so it replays on return)
     -------------------------------------------------------------------------- */
  const RECEIPT_CATALOG = {
    "Бесплатный осмотр — врач сам подскажет на приёме (0 ₽)": {
      code: "СМЕТА #00 · ОСМОТР И ПЛАН",
      cabinet: "ТЕРАПИЯ · ДИАГНОСТИКА",
      title: "Бесплатный осмотр — врач сам подскажет на приёме (0 ₽)",
      anesthesia: "2 этапа (гель + укол)",
      total: "от 4 500 ₽ (после осмотра)",
      lines: [
        ["01. Первичный осмотр профильного врача (20–30 мин)", "0 ₽"],
        ["02. Пошаговый план лечения и точная смета до старта", "0 ₽"],
        ["03. Ориентир: световая пломба / лечение кариеса", "от 4 500 ₽"],
        ["04. Ориентир: бережное удаление / коронки под ключ", "от 6 500 ₽"],
      ],
    },
    "Болит зуб / реагирует на холодное (осмотр 0 ₽)": {
      code: "СМЕТА #01 · СНЯТИЕ БОЛИ",
      cabinet: "ТЕРАПИЯ · КАБ. №1",
      title: "Острая боль или реакция зуба на холодное / горячее",
      anesthesia: "Гель + мягкий укол",
      total: "от 4 800 ₽",
      lines: [
        ["01. Бесплатный осмотр врача и прицельная диагностика", "0 ₽"],
        ["02. Двухэтапное обезболивание (аппликационный гель + анестетик)", "от 650 ₽"],
        ["03. Снятие воспаления и сохранение зуба за 1 визит", "от 4 800 ₽"],
        ["04. Контрольная проверка по прикусу и рекомендации", "0 ₽"],
      ],
    },
    "Лечение кариеса / замена пломбы": {
      code: "СМЕТА #02 · РЕСТАВРАЦИЯ",
      cabinet: "ТЕРАПИЯ · КАБ. №1",
      title: "Лечение кариеса или замена выпавшей пломбы в тон зуба",
      anesthesia: "Без боли (2 этапа)",
      total: "от 4 500 ₽",
      lines: [
        ["01. Первичный осмотр терапевта и согласование цены", "0 ₽"],
        ["02. Подбор оттенка материала точно под родную эмаль", "0 ₽"],
        ["03. Световая пломба / художественная реставрация скола", "от 4 500 ₽"],
        ["04. Многоступенчатая полировка и гарантия по договору", "включено"],
      ],
    },
    "Бережное удаление зуба / зуба мудрости": {
      code: "СМЕТА #03 · ХИРУРГИЯ",
      cabinet: "ХИРУРГИЯ · КАБ. №2",
      title: "Бережное удаление зуба или сложного зуба мудрости",
      anesthesia: "Усиленная мягкая",
      total: "от 6 500 ₽",
      lines: [
        ["01. Осмотр стоматолога-хирурга перед процедурой", "0 ₽"],
        ["02. Двухэтапная анестезия с полным ожиданием заморозки", "включено"],
        ["03. Атравматичное удаление зуба (в т.ч. «восьмёрки»)", "от 6 500 ₽"],
        ["04. Памятка по уходу дома и бесплатный контрольный осмотр", "0 ₽"],
      ],
    },
    "Семейный или детский осмотр (0 ₽)": {
      code: "СМЕТА #04 · СЕМЕЙНЫЙ ПРИЁМ",
      cabinet: "ДЕТСКИЙ И СЕМЕЙНЫЙ",
      title: "Спокойный осмотр и лечение для ребёнка или всей семьи",
      anesthesia: "Детский гель без слёз",
      total: "осмотр 0 ₽ · лечение от 3 500 ₽",
      lines: [
        ["01. Бережное знакомство с врачом и осмотр без страха", "0 ₽"],
        ["02. Профгигиена / герметизация фиссур для защиты эмали", "от 3 500 ₽"],
        ["03. Бережное лечение детского или взрослого кариеса", "от 3 800 ₽"],
        ["04. Запись 2–3 членов семьи на удобные окна подряд", "0 ₽"],
      ],
    },
    "Коронки и восстановление зубов": {
      code: "СМЕТА #05 · ОРТОПЕДИЯ",
      cabinet: "ОРТОПЕДИЯ · КАБ. №2",
      title: "Коронки из циркония и керамики · восстановление зубов",
      anesthesia: "Комфортная 2-этапная",
      total: "от 22 000 ₽",
      lines: [
        ["01. Первичная консультация врача-ортопеда и план", "0 ₽"],
        ["02. Подбор естественного цвета и формы под свои зубы", "0 ₽"],
        ["03. Коронка из диоксида циркония / цельной керамики", "от 22 000 ₽"],
        ["04. Примерка и комфортная посадка по прикусу", "включено"],
      ],
    },
  };

  const careSlip = document.getElementById("care-slip");
  const slipCodeEl = document.getElementById("slip-code");
  const slipCabinetEl = document.getElementById("slip-cabinet");
  const slipServiceName = document.getElementById("slip-service-name");
  const slipAnesthesiaEl = document.getElementById("slip-anesthesia");
  const slipLinesEl = document.getElementById("slip-lines");
  const slipTotalEl = document.getElementById("slip-total-price");
  const receiptTabs = Array.from(document.querySelectorAll(".receipt-tab"));
  const serviceSelect = document.getElementById("inp-service");
  const serviceHint = document.getElementById("service-picked-hint");

  let slipTl = null;
  let isSlipVisible = false;
  let isSlipAnimating = false;
  let isJumpingToBooking = false;
  let jumpTimeoutId = null;

  function populateSlipDOM(serviceLabel) {
    const key =
      serviceLabel && RECEIPT_CATALOG[serviceLabel]
        ? serviceLabel
        : "Бесплатный осмотр — врач сам подскажет на приёме (0 ₽)";
    const data = RECEIPT_CATALOG[key];

    if (slipCodeEl) slipCodeEl.textContent = data.code;
    if (slipCabinetEl) slipCabinetEl.textContent = data.cabinet;
    if (slipServiceName) slipServiceName.textContent = data.title;
    if (slipAnesthesiaEl) slipAnesthesiaEl.textContent = data.anesthesia;
    if (slipTotalEl) slipTotalEl.textContent = data.total;

    if (slipLinesEl) {
      slipLinesEl.innerHTML = data.lines
        .map(([label, price]) => `<li><span>${label}</span><strong>${price}</strong></li>`)
        .join("");
    }

    receiptTabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.getAttribute("data-receipt-service") === key);
    });
  }

  function playSlipPrintIn(serviceLabel) {
    if (serviceLabel) {
      populateSlipDOM(serviceLabel);
    }
    if (!careSlip || !hasGSAP || prefersReducedMotion) {
      isSlipVisible = true;
      isSlipAnimating = false;
      return;
    }

    if (slipTl) slipTl.kill();
    isSlipAnimating = true;

    gsap.set(careSlip, {
      yPercent: -104,
      y: 0,
      x: 0,
      rotation: 0,
      autoAlpha: 1,
    });

    const feedSteps = [-94, -85, -76, -67, -58, -49, -40, -31, -22, -14, -6, 0];
    slipTl = gsap.timeline({
      onComplete: () => {
        isSlipVisible = true;
        isSlipAnimating = false;
      },
    });

    feedSteps.forEach((pct, idx) => {
      const isLast = idx === feedSteps.length - 1;
      slipTl.to(careSlip, {
        yPercent: pct,
        y: 0,
        x: 0,
        rotation: 0,
        duration: isLast ? 0.12 : 0.062,
        ease: isLast ? "power3.out" : "power2.out",
      });
      if (!isLast) {
        slipTl.to(careSlip, { duration: 0.038 });
      }
    });
  }

  function playSlipRetractOut() {
    if (!careSlip || !hasGSAP || prefersReducedMotion) return;
    if (slipTl) slipTl.kill();
    isSlipAnimating = false;

    const retractSteps = [-15, -32, -50, -68, -86, -104];
    slipTl = gsap.timeline({
      onComplete: () => {
        isSlipVisible = false;
      },
    });

    retractSteps.forEach((pct) => {
      slipTl.to(careSlip, {
        yPercent: pct,
        y: 0,
        x: 0,
        rotation: 0,
        duration: 0.048,
        ease: "power2.in",
      });
    });
  }

  if (careSlip && hasGSAP && hasScrollTrigger && !prefersReducedMotion) {
    gsap.set(careSlip, { yPercent: -104, autoAlpha: 1 });

    ScrollTrigger.create({
      trigger: "#booking",
      start: "top 68%",
      end: "bottom 18%",
      onEnter: () => {
        if (!isSlipVisible && !isSlipAnimating && !isJumpingToBooking) {
          playSlipPrintIn();
        }
      },
      onEnterBack: () => {
        if (!isSlipVisible && !isSlipAnimating && !isJumpingToBooking) {
          playSlipPrintIn();
        }
      },
      onLeave: () => {
        if (!isJumpingToBooking) playSlipRetractOut();
      },
      onLeaveBack: () => {
        if (!isJumpingToBooking) playSlipRetractOut();
      },
    });
  }

  function selectServiceForBooking(serviceVal, scrollFirst = false) {
    if (serviceSelect) {
      let matched = false;
      Array.from(serviceSelect.options).forEach((o) => {
        const isMatch = o.value === serviceVal;
        o.selected = isMatch;
        if (isMatch) matched = true;
      });
      if (matched) serviceSelect.value = serviceVal;
    }

    const catEntry = RECEIPT_CATALOG[serviceVal];
    if (serviceHint) {
      serviceHint.textContent = catEntry
        ? `Выбрано: «${serviceVal}» (ориентир: ${catEntry.total}). Первичный осмотр врача — 0 ₽.`
        : `Выбрано: «${serviceVal}». Первичный осмотр врача — 0 ₽.`;
    }

    populateSlipDOM(serviceVal);

    if (scrollFirst) {
      isJumpingToBooking = true;
      if (jumpTimeoutId) clearTimeout(jumpTimeoutId);
      if (careSlip && hasGSAP && !prefersReducedMotion) {
        if (slipTl) slipTl.kill();
        gsap.set(careSlip, { yPercent: -104 });
        isSlipVisible = false;
        isSlipAnimating = false;
      }
      smoothScrollTo("#booking", 48);
      jumpTimeoutId = setTimeout(() => {
        isJumpingToBooking = false;
        playSlipPrintIn(serviceVal);
      }, 1220);
    } else {
      playSlipPrintIn(serviceVal);
    }
  }

  receiptTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const val = tab.getAttribute("data-receipt-service");
      if (val) selectServiceForBooking(val, false);
    });
  });

  document.querySelectorAll(".js-pick-service").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const val = btn.getAttribute("data-service");
      if (val) selectServiceForBooking(val, true);
    });
  });

  if (serviceSelect) {
    serviceSelect.addEventListener("change", () => {
      selectServiceForBooking(serviceSelect.value, false);
    });
  }

  /* --------------------------------------------------------------------------
     7. BOOKING FORM VALIDATION & FEEDBACK
     -------------------------------------------------------------------------- */
  const bookingForm = document.getElementById("booking-form");
  const formFeedback = document.getElementById("form-feedback");

  if (bookingForm && formFeedback) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("inp-name");
      const phoneInput = document.getElementById("inp-phone");
      const nameVal = nameInput ? nameInput.value.trim() : "";
      const phoneVal = phoneInput ? phoneInput.value.trim() : "";

      if (nameVal.length < 2 || phoneVal.replace(/\D/g, "").length < 10) {
        formFeedback.hidden = false;
        formFeedback.style.background = "rgba(217, 107, 56, 0.12)";
        formFeedback.style.borderColor = "rgba(217, 107, 56, 0.35)";
        formFeedback.style.color = "#9E4014";
        formFeedback.textContent = "Пожалуйста, укажите ваше имя и контактный номер телефона.";
        return;
      }

      formFeedback.hidden = false;
      formFeedback.style.background = "rgba(42, 123, 86, 0.12)";
      formFeedback.style.borderColor = "rgba(42, 123, 86, 0.3)";
      formFeedback.style.color = "#1B5E3F";
      formFeedback.textContent = `Спасибо, ${nameVal}! Это демо-концепт: в рабочей версии администратор «Мечты» перезвонит вам по номеру ${phoneVal} и предложит удобное время осмотра.`;
      bookingForm.reset();
    });
  }
})();
