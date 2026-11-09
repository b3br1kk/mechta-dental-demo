(() => {
  document.documentElement.classList.add('js');

  /* ---------- Схема зубов (FDI) ---------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const arch = document.getElementById('arch');
  const NAMES = ['центральный резец', 'боковой резец', 'клык', 'первый премоляр', 'второй премоляр', 'первый моляр', 'второй моляр', 'зуб мудрости'];
  const WIDTH = [8.6, 6.8, 7.8, 7.2, 7.0, 10.4, 9.8, 9.2]; // относительная ширина коронки
  const QUAD = { 1: 'верхний правый', 2: 'верхний левый', 3: 'нижний левый', 4: 'нижний правый' };

  const SYMPTOMS = [
    { id: 'pain', label: 'Болит' },
    { id: 'chip', label: 'Скол или трещина' },
    { id: 'filling', label: 'Выпала пломба' },
    { id: 'missing', label: 'Зуба нет' },
    { id: 'loose', label: 'Шатается' },
    { id: 'gum', label: 'Кровоточит десна' }
  ];

  function advise(pos, symptom) {
    const wisdom = pos === 8;
    switch (symptom) {
      case 'pain':
        return wisdom
          ? { doc: 'Хирург', note: 'Зубы мудрости часто болят из-за того, как они прорезываются. Решение, лечить или удалять, хирург примет после снимка.' }
          : { doc: 'Терапевт', note: 'Расскажите на приёме, когда болит: от холодного, при накусывании или ночью. Это помогает врачу.' };
      case 'chip':
        return { doc: 'Терапевт', note: 'Небольшой скол восстанавливают пломбой. Если разрушено много, врач предложит коронку у ортопеда.' };
      case 'filling':
        return { doc: 'Терапевт', note: 'Лучше не откладывать: открытая полость быстрее разрушается.' };
      case 'missing':
        return { doc: 'Ортопед или хирург-имплантолог', note: 'Врач расскажет про варианты: имплант, мост или протез.' };
      case 'loose':
        return { doc: 'Хирург', note: 'Подвижность зуба врач оценит на осмотре и по снимку.' };
      case 'gum':
        return { doc: 'Терапевт', note: 'Часто начинают с профессиональной чистки. Врач скажет, нужно ли больше.' };
      default:
        return { doc: 'Терапевт', note: '' };
    }
  }

  // Геометрия дуг: верх (∩) и низ (∪)
  const CX = 200;
  const ARCHES = [
    { cy: 200, rx: 150, ry: 168, dir: -1, quads: [1, 2] },  // верхняя
    { cy: 252, rx: 140, ry: 160, dir: 1, quads: [4, 3] }    // нижняя
  ];
  const total = WIDTH.reduce((a, b) => a + b, 0);

  let selected = null;
  let selectedSymptom = null;

  function makeTooth(quad, pos, angle, cy, rx, ry, dir) {
    const x = CX + rx * Math.cos(angle);
    const y = cy + dir * ry * Math.sin(angle);
    // касательная
    const tx = -rx * Math.sin(angle);
    const ty = dir * ry * Math.cos(angle);
    const rot = Math.atan2(ty, tx) * 180 / Math.PI;
    const w = WIDTH[pos - 1] * 3.25;
    const h = pos >= 6 ? 30 : pos >= 4 ? 25 : pos === 3 ? 24 : 20;
    const num = `${quad}${pos}`;

    const g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('class', 'tooth');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-pressed', 'false');
    g.setAttribute('aria-label', `Зуб ${num}, ${QUAD[quad]}, ${NAMES[pos - 1]}`);
    g.dataset.num = num;
    g.dataset.pos = pos;
    g.dataset.quad = quad;

    const shape = document.createElementNS(SVGNS, 'rect');
    shape.setAttribute('class', 'tooth__shape');
    shape.setAttribute('x', (x - w / 2).toFixed(1));
    shape.setAttribute('y', (y - h / 2).toFixed(1));
    shape.setAttribute('width', w.toFixed(1));
    shape.setAttribute('height', h);
    shape.setAttribute('rx', pos <= 3 ? w / 2.2 : 8);
    const rotG = document.createElementNS(SVGNS, 'g');
    rotG.setAttribute('transform', `rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`);
    rotG.appendChild(shape);

    const label = document.createElementNS(SVGNS, 'text');
    label.setAttribute('class', 'tooth__num');
    // номер выносим к центру дуги
    const lx = CX + (rx - 34) * Math.cos(angle);
    const ly = cy + dir * (ry - 34) * Math.sin(angle);
    label.setAttribute('x', lx.toFixed(1));
    label.setAttribute('y', ly.toFixed(1));
    label.textContent = num;

    // невидимая увеличенная зона нажатия
    const hit = document.createElementNS(SVGNS, 'circle');
    hit.setAttribute('cx', x.toFixed(1));
    hit.setAttribute('cy', y.toFixed(1));
    hit.setAttribute('r', 17);
    hit.setAttribute('fill', 'transparent');

    g.append(hit, rotG, label);
    return g;
  }

  if (arch) {
    ARCHES.forEach(({ cy, rx, ry, dir, quads }) => {
      // левая для зрителя половина: от моляра (angle=π) к резцу (π/2)
      let acc = 0;
      for (let pos = 8; pos >= 1; pos--) {
        const mid = acc + WIDTH[pos - 1] / 2;
        acc += WIDTH[pos - 1];
        const angle = Math.PI - (mid / total) * (Math.PI / 2) * 0.98 - 0.02;
        arch.appendChild(makeTooth(quads[0], pos, angle, cy, rx, ry, dir));
      }
      acc = 0;
      for (let pos = 1; pos <= 8; pos++) {
        const mid = acc + WIDTH[pos - 1] / 2;
        acc += WIDTH[pos - 1];
        const angle = Math.PI / 2 - (mid / total) * (Math.PI / 2) * 0.98 - 0.01;
        arch.appendChild(makeTooth(quads[1], pos, angle, cy, rx, ry, dir));
      }
    });

    arch.addEventListener('click', (e) => {
      const t = e.target.closest('.tooth');
      if (t) selectTooth(t);
    });
    arch.addEventListener('keydown', (e) => {
      const t = e.target.closest('.tooth');
      if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectTooth(t); }
    });
  }

  const empty = document.getElementById('panel-empty');
  const pick = document.getElementById('panel-pick');
  const slip = document.getElementById('slip');
  const chips = document.getElementById('chips');
  const hint = document.getElementById('chart-hint');

  SYMPTOMS.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = s.label;
    b.dataset.id = s.id;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => selectSymptom(s.id));
    chips && chips.appendChild(b);
  });

  function selectTooth(t) {
    arch.querySelectorAll('.tooth[aria-pressed="true"]').forEach((el) => el.setAttribute('aria-pressed', 'false'));
    t.setAttribute('aria-pressed', 'true');
    selected = { num: t.dataset.num, pos: +t.dataset.pos, quad: +t.dataset.quad };
    selectedSymptom = null;
    chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    document.getElementById('tooth-num').textContent = `Зуб ${selected.num}`;
    document.getElementById('tooth-name').textContent = `${QUAD[selected.quad]}, ${NAMES[selected.pos - 1]}`;
    empty.hidden = true;
    slip.hidden = true;
    // перезапуск входной анимации
    pick.hidden = true; void pick.offsetWidth; pick.hidden = false;
    hint.textContent = 'Выберите симптом';
  }

  function selectSymptom(id) {
    if (!selected) return;
    selectedSymptom = id;
    chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.id === id)));
    const a = advise(selected.pos, id);
    document.getElementById('slip-doc').textContent = a.doc;
    document.getElementById('slip-note').textContent = a.note;
    slip.hidden = true; void slip.offsetWidth; slip.hidden = false;
    hint.textContent = 'Готово';
  }

  const slipCta = document.getElementById('slip-cta');
  slipCta && slipCta.addEventListener('click', () => {
    if (!selected || !selectedSymptom) return;
    const s = SYMPTOMS.find((x) => x.id === selectedSymptom);
    const note = document.getElementById('f-note');
    const line = `Зуб ${selected.num} (${QUAD[selected.quad]}, ${NAMES[selected.pos - 1]}): ${s.label.toLowerCase()}`;
    note.value = note.value ? `${note.value}\n${line}` : line;
    setTimeout(() => document.getElementById('f-name').focus({ preventScroll: true }), 400);
  });

  /* ---------- Форма (демо) ---------- */
  const form = document.getElementById('form');
  const phone = document.getElementById('f-phone');

  phone && phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = d.slice(1);
    let out = '+7';
    if (p.length) out += ' ' + p.slice(0, 3);
    if (p.length > 3) out += ' ' + p.slice(3, 6);
    if (p.length > 6) out += '-' + p.slice(6, 8);
    if (p.length > 8) out += '-' + p.slice(8, 10);
    phone.value = out;
    if (phone.getAttribute('aria-invalid') === 'true' && p.length === 10) setErr(phone, false);
  });

  function setErr(input, on) {
    const err = document.getElementById(input.id + '-err');
    input.setAttribute('aria-invalid', String(on));
    if (err) err.hidden = !on;
  }

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('f-name');
    const digits = phone.value.replace(/\D/g, '');
    const nameBad = name.value.trim().length < 2;
    const phoneBad = digits.length !== 11;
    setErr(name, nameBad);
    setErr(phone, phoneBad);
    if (nameBad) { name.focus(); return; }
    if (phoneBad) { phone.focus(); return; }
    form.hidden = true;
    const ok = document.getElementById('form-ok');
    ok.hidden = false;
    ok.focus();
  });

  document.getElementById('f-name')?.addEventListener('input', (e) => {
    if (e.target.value.trim().length >= 2) setErr(e.target, false);
  });

  /* ---------- Появление при скролле ---------- */
  const items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const sibs = [...en.target.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
          const i = Math.max(0, sibs.indexOf(en.target));
          en.target.style.transitionDelay = `${Math.min(i, 5) * 60}ms`;
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }
})();
