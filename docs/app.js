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
     3. PRELOADER -> ZOOM-THROUGH ARCH PORTAL HERO REVEAL
     -------------------------------------------------------------------------- */
  function initArchPortalReveal() {
    const preloader = document.getElementById("preloader");
    const preloaderArch = document.getElementById("preloader-arch");
    const preloaderWord = document.getElementById("preloader-word");
    const heroPortal = document.getElementById("hero-portal");
    const heroImg = document.getElementById("hero-bg-img");
    const heroReveals = document.querySelectorAll(".hero-reveal");

    if (!preloader || !hasGSAP || prefersReducedMotion) {
      if (preloader) preloader.style.display = "none";
      return;
    }

    gsap.set(preloaderWord, { y: 0, yPercent: 112, color: "#181D1A" });
    gsap.set(preloaderArch, { scale: 0.94, autoAlpha: 1 });
    gsap.set(heroPortal, {
      clipPath: "inset(12% 24% 12% 24% round 240px 240px 28px 28px)",
    });
    if (heroImg) gsap.set(heroImg, { scale: 1.15 });
    gsap.set(heroReveals, { y: 24, autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        preloader.style.display = "none";
        if (hasScrollTrigger) ScrollTrigger.refresh();
      },
    });

    tl.to(preloaderWord, {
      y: 0,
      yPercent: 0,
      duration: 0.56,
    })
      .to(
        preloaderArch,
        {
          scale: 2.25,
          autoAlpha: 0,
          duration: 0.72,
          ease: "expo.in",
        },
        "+=0.14"
      )
      .to(
        preloader,
        {
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.35"
      )
      .to(
        heroPortal,
        {
          clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)",
          duration: 0.96,
          ease: "expo.out",
        },
        "-=0.58"
      )
      .to(
        heroImg,
        {
          scale: 1,
          duration: 1.15,
          ease: "power3.out",
        },
        "-=0.92"
      )
      .to(
        heroReveals,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.62,
          stagger: 0.08,
        },
        "-=0.55"
      );
  }

  initArchPortalReveal();

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
     5. HORIZONTAL EXPANDING ACCORDION DECK (#services)
     -------------------------------------------------------------------------- */
  const accPanels = document.querySelectorAll(".acc-panel");

  accPanels.forEach((panel) => {
    const trigger = panel.querySelector(".acc-panel__trigger");
    const openPanel = () => {
      accPanels.forEach((p) => {
        const isCurrent = p === panel;
        p.classList.toggle("is-open", isCurrent);
        const btn = p.querySelector(".acc-panel__trigger");
        if (btn) btn.setAttribute("aria-expanded", isCurrent ? "true" : "false");
      });
    };
    if (trigger) {
      trigger.addEventListener("click", openPanel);
    }
    panel.addEventListener("mouseenter", () => {
      if (window.innerWidth > 1080) openPanel();
    });
  });

  /* --------------------------------------------------------------------------
     6. TACTILE FAMILY CARE SLIP (#booking)
        - Vertical stepped print-in from .care-slip-slot (x: 0, rotation: 0)
        - Scroll-Then-Act (1220ms delay when triggered via .js-pick-service)
        - Reset-On-Leave (retracts when scrolling away so it replays on return)
     -------------------------------------------------------------------------- */
  const careSlip = document.getElementById("care-slip");
  const slipServiceName = document.getElementById("slip-service-name");
  const serviceSelect = document.getElementById("inp-service");
  const serviceHint = document.getElementById("service-picked-hint");

  let slipTl = null;
  let isSlipVisible = false;

  function playSlipPrintIn(serviceLabel) {
    if (serviceLabel && slipServiceName) {
      slipServiceName.textContent = serviceLabel;
    }
    if (!careSlip || !hasGSAP || prefersReducedMotion) {
      isSlipVisible = true;
      return;
    }

    if (slipTl) slipTl.kill();

    gsap.set(careSlip, {
      yPercent: -92,
      y: 0,
      x: 0,
      rotation: 0,
      autoAlpha: 1,
    });

    const steps = [-80, -68, -56, -44, -32, -20, -10, -4, 0];
    slipTl = gsap.timeline({
      onComplete: () => {
        isSlipVisible = true;
      },
    });

    steps.forEach((pct) => {
      slipTl.to(careSlip, {
        yPercent: pct,
        y: 0,
        x: 0,
        rotation: 0,
        duration: 0.058,
        ease: "power2.out",
      });
      if (pct !== 0) {
        slipTl.to(careSlip, { duration: 0.036 });
      }
    });
  }

  function playSlipRetractOut() {
    if (!careSlip || !hasGSAP || prefersReducedMotion) return;
    if (slipTl) slipTl.kill();

    const retractSteps = [-20, -48, -74, -94];
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
    gsap.set(careSlip, { yPercent: -94, autoAlpha: 1 });

    ScrollTrigger.create({
      trigger: "#booking",
      start: "top 68%",
      end: "bottom 18%",
      onEnter: () => {
        if (!isSlipVisible) playSlipPrintIn();
      },
      onEnterBack: () => {
        if (!isSlipVisible) playSlipPrintIn();
      },
      onLeave: () => {
        playSlipRetractOut();
      },
      onLeaveBack: () => {
        playSlipRetractOut();
      },
    });
  }

  function selectServiceForBooking(serviceVal, scrollFirst = false) {
    if (serviceSelect) {
      const opts = Array.from(serviceSelect.options);
      const match = opts.find((o) => o.value === serviceVal);
      if (match) serviceSelect.value = serviceVal;
    }

    if (serviceHint) {
      serviceHint.textContent = `Выбрано: «${serviceVal}». Первичный осмотр врача — 0 ₽.`;
    }

    if (scrollFirst) {
      if (careSlip && hasGSAP && !prefersReducedMotion) {
        if (slipTl) slipTl.kill();
        gsap.set(careSlip, { yPercent: -94 });
        isSlipVisible = false;
      }
      smoothScrollTo("#booking", -72);
      setTimeout(() => {
        playSlipPrintIn(serviceVal);
      }, 1220);
    } else {
      playSlipPrintIn(serviceVal);
    }
  }

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
