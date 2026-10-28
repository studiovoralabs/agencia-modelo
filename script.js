const body = document.body;
const toggle = document.querySelector('.nav__toggle');
const menu = document.querySelector('.menu');

// abrir o menu
function openMenu() {
  menu.classList.add('is-open');
  toggle.classList.add('active');
  toggle.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-hidden', 'false');
  body.classList.add('body-lock');
}

// fechar o menu
function closeMenu() {
  menu.classList.remove('is-open');
  toggle.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  body.classList.remove('body-lock');
}

// alternar com o mesmo botão (hambúrguer ↔ X)
toggle?.addEventListener('click', () => {
  const isActive = toggle.classList.contains('active');
  if (isActive) closeMenu();
  else openMenu();
});

// fechar ao clicar em qualquer link
menu?.querySelectorAll('[data-close]').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// fechar com ESC
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('is-open')) {
    closeMenu();
  }
});

// ===== HERO: movimento suave controlado pelo scroll =====
(function(){
  const hero = document.querySelector('.hero');
  const inner = document.querySelector('.hero__inner');
  const left = document.querySelector('.line-left');
  const right = document.querySelector('.line-right');
  if(!hero || !left || !right || !inner) return;

  const SIDE_MARGIN = 160; // quanto “deixa de folga” antes de se tocar
  let lastProgress = 0;

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function getProgress(){
    const rect = hero.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const start = vh * 0.05;  // começa leve
    const end   = vh * 0.65;  // termina quando ~65% da seção estiver visível
    const visible = vh - rect.top;
    return clamp((visible - start) / (end - start), 0, 1);
  }

  function update(){
    const p = getProgress();             // progresso da rolagem
    if (Math.abs(p - lastProgress) < 0.001) return; // evita jitter
    lastProgress = p;

    const maxShift = inner.clientWidth / 2 - SIDE_MARGIN;
    const shift = maxShift * p;          // deslocamento px

    // esquerda → direita, direita → esquerda
    left.style.transform  = `translateX(${ shift }px)`;
    right.style.transform = `translateX(${-shift }px)`;

    // opacidade suave
    const op = 0.6 + 0.4 * p;
    left.style.opacity  = op.toFixed(3);
    right.style.opacity = op.toFixed(3);
  }

  // Atualiza apenas quando necessário
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update);
  update(); // estado inicial
})();






// ===== Arcos que trocam de lugar conforme a direção do scroll =====
(function(){
  const section = document.querySelector('.manifesto');
  if(!section) return;

  let lastY = window.scrollY;
  let shift = 0;                // deslocamento acumulado (px)
  const LIMIT = 180;            // o quanto pode ir para cada lado
  const FOLLOW = 0.22;          // sensibilidade ao scroll (0.12 ~ 0.30)

  const root = document.documentElement;

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function tick(){
    const y = window.scrollY;
    const delta = y - lastY;    // >0 descendo, <0 subindo
    lastY = y;

    // acumula deslocamento, limitado
    shift = clamp(shift + delta * FOLLOW, -LIMIT, LIMIT);

    // arcos opostos (um vai +x, o outro -x)
    root.style.setProperty('--arcA', `${ shift }px`);
    root.style.setProperty('--arcB', `${-shift }px`);
  }

  tick();
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
})();

// ===== Reveal suave ao entrar na viewport =====
(function(){
  const els = document.querySelectorAll('.manifesto .reveal');
  if(!els.length) return;

  const io = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-in');
        // dispara uma vez
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  els.forEach(el=> io.observe(el));
})();



// util
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ====== Scale on scroll (0 → 1 progress dentro da seção) ====== */
(function(){
  const section = document.querySelector('.grow');
  const img = document.querySelector('.grow__img');
  if(!section || !img) return;

  // escala entre 0.92 e 1.12 (ajuste livre)
  const SCALE_MIN = 0.92;
  const SCALE_MAX = 1.52;

  function progressInSection(){
    const top = section.offsetTop;
    const h   = section.offsetHeight;
    const y   = window.scrollY;
    const vh  = window.innerHeight;

    // total “rolável” da seção (precisa ser >0 para ter progressão)
    const total = Math.max(1, h - vh);
    return clamp((y - top) / total, 0, 1);
  }

  function update(){
    const p = progressInSection();
    const s = SCALE_MIN + (SCALE_MAX - SCALE_MIN) * p;
    img.style.setProperty('--scale', s.toFixed(4));
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();

/* ====== Botão voltar ao topo ====== */
(function(){
  const btn = document.querySelector('.toTop');
  if(!btn) return;

  const SHOW_AT = 500; // px de rolagem para começar a mostrar

  function onScroll(){
    if(window.scrollY > SHOW_AT){
      btn.classList.add('is-visible');
    }else{
      btn.classList.remove('is-visible');
    }
  }

btn.addEventListener('click', () => {
  const start = window.scrollY;
  const duration = 1800; // milissegundos (1.8s)
  const startTime = performance.now();

  function easeOutQuad(t) {
    return t * (2 - t); // curva de desaceleração
  }

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 6);
    const eased = easeOutQuad(progress);
    window.scrollTo(0, start * (1 - eased));

    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});


  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();


// Acordeão + giro do arco vermelho (sem dependências)
(() => {
  const section = document.querySelector('.fullseven');
  if (!section) return;

  const acc  = section.querySelector('#fs-acc');
  const ring = section.querySelector('.ring');

  acc.addEventListener('click', (e) => {
    const btn = e.target.closest('.acc-item');
    if (!btn) return;

    // fecha todos
    acc.querySelectorAll('.acc-item').forEach(b => b.classList.remove('is-open'));
    acc.querySelectorAll('.acc-panel').forEach(p => p.style.height = '0');

    // abre o clicado
    btn.classList.add('is-open');
    const panel  = btn.nextElementSibling;
    const target = getComputedStyle(panel).getPropertyValue('--h').trim() || '140px';
    panel.style.height = target;

    // gira o arco conforme data-angle
    const angle = btn.dataset.angle || '0';
    ring.style.setProperty('--arc-angle', `${angle}deg`);
  });

  // estado inicial
  const open = acc.querySelector('.acc-item.is-open');
  if (open) open.click();
})();


(() => {
  const wrap = document.querySelector('.services__wrap');
  if (!wrap) return;

  const tip = wrap.querySelector('.svc-tip');
  const tipBox = tip?.querySelector('.svc-tip__inner');
  if (!tip || !tipBox) return;

  let currentBtn = null;

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function setTipContent(btn){
    const title = (btn.textContent || '').trim();
    const desc  = btn.dataset.desc || '';
    tipBox.innerHTML = `
      <div class="svc-tip__title">${title}</div>
      <div class="svc-tip__text">${desc}</div>
    `;
  }

  function positionTip(btn){
    // mede depois que o conteúdo foi inserido
    const rootR = wrap.getBoundingClientRect();
    const btnR  = btn.getBoundingClientRect();

    // mede largura real do tooltip
    tip.style.left = '-9999px';
    tip.style.top  = '-9999px';
    tip.classList.add('is-on'); // garantir que ele tenha dimensão pra medir
    const tipR = tip.getBoundingClientRect();
    const tipW = tipR.width;
    const tipH = tipR.height;

    // horizontal: centraliza no botão mas mantém dentro do wrap
    const centerX = btnR.left + btnR.width/2;
    let left = centerX - tipW/2 - rootR.left;
    left = clamp(left, 8, wrap.clientWidth - tipW - 8);

    // vertical: tenta acima; se não couber, vai abaixo
    const spaceAbove = btnR.top - rootR.top;                 // espaço dentro do container
    const spaceBelow = wrap.clientHeight - (btnR.bottom - rootR.top);
    const gap = 14;                                         // respiro
    let top, placeBelow = false;

    if (spaceAbove >= tipH + gap){
      top = btnR.top - rootR.top - tipH - gap;
      placeBelow = false;
    } else {
      top = btnR.bottom - rootR.top + gap;
      placeBelow = true;
    }

    tip.style.left = `${left}px`;
    tip.style.top  = `${top}px`;
    tip.classList.toggle('is-below', placeBelow);

    // opcional: alinhar a setinha com o centro do botão (se você tiver .svc-tip__arrow)
    const arrow = tip.querySelector('.svc-tip__arrow');
    if (arrow){
      const arrowCenter = clamp(centerX - rootR.left - left, 10, tipW - 10);
      arrow.style.left = `${arrowCenter - 6}px`; // -6 = metade da largura do diamond (12px)
    }
  }

  function showTip(btn){
    currentBtn = btn;
    setTipContent(btn);
    positionTip(btn);
    tip.classList.add('is-on');
  }

  function hideTip(){
    currentBtn = null;
    tip.classList.remove('is-on', 'is-below');
  }

  // ---- Eventos de interação
  wrap.addEventListener('mouseover', e => {
    const btn = e.target.closest('.svc-item');
    if (!btn) return;
    showTip(btn);
  });

  wrap.addEventListener('mouseout', e => {
    const btn = e.target.closest('.svc-item');
    if (!btn) return;
    // se o mouse sair do item e não entrar no tooltip, fecha
    if (!tip.contains(e.relatedTarget)) hideTip();
  });

  // Mantém aberto se passar o mouse por cima do tooltip
  tip.addEventListener('mouseleave', () => hideTip());

  // Clique/Toque: alterna (bom para mobile)
  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.svc-item');
    if (!btn) return;
    if (currentBtn === btn && tip.classList.contains('is-on')) hideTip();
    else showTip(btn);
  });

  // Acessibilidade: foco via teclado
  wrap.addEventListener('focusin', e => {
    const btn = e.target.closest('.svc-item');
    if (btn) showTip(btn);
  });
  wrap.addEventListener('focusout', e => {
    const goingTo = e.relatedTarget;
    if (!wrap.contains(goingTo)) hideTip();
  });

  // Fecha em ESC
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideTip();
  });

  // Fecha em scroll/resize (ou reposiciona se quiser manter)
  window.addEventListener('scroll', () => hideTip(), { passive:true });
  window.addEventListener('resize', () => {
    if (currentBtn) positionTip(currentBtn);
  });
})();






(() => {
  const title = document.getElementById('deliverTitle'); // o único que vai mexer
  if (!title) return;

  const stage = title.parentElement; // deve ser o .deliver__stage
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));

  // limites (em px)
  let BASE = 0;   // início (direita, parte escondida)
  let MINX = 0;   // fim (esquerda, negativo)
  let RANGE = 0;  // distância total: BASE -> MINX

  // estado do movimento
  let lastY = window.scrollY;
  let acc   = 0;               // 0 => no BASE; RANGE => no MINX
  const FOLLOW = 0.54;         // sensibilidade (0.12 a 0.35)

  function computeBounds(){
    const w = (stage?.clientWidth || window.innerWidth);

    // ajuste fino: comece bem fora à direita e termine bem à esquerda
    BASE  =  w * 0.45;   // direita (positivo)
    MINX  = -w * 0.120;   // esquerda (negativo)
    RANGE = BASE - MINX;

    // mantém o acumulador dentro dos novos limites
    acc = clamp(acc, 0, RANGE);

    // posiciona imediatamente no ponto atual (sem “pulo”)
    const x = BASE - acc;
    title.style.transform = `translate3d(${x}px,0,0)`;
  }

  function tick(){
    const y = window.scrollY;
    const delta = y - lastY; // >0 descendo, <0 subindo
    lastY = y;

    // só acumula quando o título está visível na viewport
    const r = title.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const visible = r.bottom > 0 && r.top < vh;
    if (!visible) return;

    // acumula e limita
    acc = clamp(acc + delta * FOLLOW, 0, RANGE);

    // mapeia 0..RANGE => BASE..MINX (direita -> esquerda)
    const x = BASE - acc;
    title.style.transform = `translate3d(${x}px,0,0)`;
  }

  // inicializa
  computeBounds();
  // garante início fora à direita
  title.style.transform = `translate3d(${BASE}px,0,0)`;

  // listeners
  window.addEventListener('scroll', tick, { passive:true });
  window.addEventListener('resize', computeBounds);
})();





// === máscara do WhatsApp (permite apagar () e -) ===
const phoneInput = document.getElementById("q-whats");
phoneInput.addEventListener("input", (e) => {
  let digits = e.target.value.replace(/\D/g, "");
  if (digits.length > 11) digits = digits.slice(0,11);

  let out = "";
  if (digits.length > 6) {
    out = digits.replace(/^(\d{2})(\d{1})(\d{4})(\d{0,4}).*/, "($1) $2 $3-$4");
  } else if (digits.length > 2) {
    out = digits.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
  } else if (digits.length > 0) {
    out = "(" + digits;
  }
  e.target.value = out;
});

document.getElementById("quoteForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name  = document.getElementById("q-name").value.trim();
  const email = document.getElementById("q-email").value.trim();
  const phoneFormatted = document.getElementById("q-whats").value.trim();
  const phoneDigits = phoneFormatted.replace(/\D/g, "");
  const checkboxes = document.querySelectorAll('input[name="needs"]:checked');
  const needs = Array.from(checkboxes).map(cb => cb.value).join(", ");

  if (!name || !email || !phoneFormatted || !needs) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }
  if (phoneDigits.length !== 11) {
    alert("Informe um WhatsApp válido no formato (71) 9 8888-8888.");
    return;
  }

  const dataCadastro = new Date().toLocaleString("pt-BR", { hour12: false });

  // 🔗 sua URL do Web App do Apps Script
  const urlScript = "https://script.google.com/macros/s/AKfycbw3VZJhrkBE8-u1CWC8Xj2FYKij17KNiZ0nFNGa-Q1NWah4XQtur6MWR6cMI9zg7GU/exec";

  // ⬅️ envia exatamente como está nas colunas da planilha
  const payload = new URLSearchParams({
    Sheet: 'teste2',           // opcional; usa a aba 'teste2'
    Nome: name,
    Telefone: phoneFormatted,  // pode trocar para phoneDigits se preferir só números
    Email: email,
    Servico: needs,            // sem acento no parâmetro
    Data: dataCadastro
  });

  // envia para o Sheets (no-cors para evitar CORS; não espera resposta)
  fetch(urlScript, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload
  });

  // WhatsApp
  const msg =
    `*Novo Pedido de Orçamento*\n\n` +
    ` Nome: ${name}\n` +
    ` E-mail: ${email}\n` +
    ` WhatsApp: ${phoneFormatted}\n` +
    ` Necessidades: ${needs}\n`;

  const url = `https://wa.me/5571982564207?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});



(function () {
  // --- CSS anti-overlay (iOS/Safari) para tablet/celular ---
  (function injectNoControlsCSS(){
    const id = 'no-controls-mobile-css';
    if (document.getElementById(id)) return;
    const css = `
      @media (max-width:1024px){
        video::-webkit-media-controls-start-playback-button{ display:none !important; }
        video::-webkit-media-controls-overlay-play-button{ display:none !important; }
        video::-webkit-media-controls { display:none !important; }
      }
    `;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  })();

  const videos = Array.from(document.querySelectorAll('video'));
  if (!videos.length) return;

  // Ajusta atributos essenciais para mobile autoplay e remove controles
  const prep = v => {
    v.removeAttribute('controls');
    v.muted = true;
    v.setAttribute('muted', '');
    v.autoplay = true;
    v.setAttribute('autoplay', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('preload', v.getAttribute('preload') || 'auto');
  };

  const tryPlay = v => {
    if (!v || (!v.paused && !v.ended)) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { /* alguns navegadores só liberam após gesto do usuário */ });
    }
  };

  videos.forEach(v => {
    prep(v);

    // Tentar tocar no melhor timing possível
    const kick = () => requestAnimationFrame(() => tryPlay(v));

    if (v.readyState >= 2) {
      kick();
    } else {
      v.addEventListener('loadedmetadata', kick, { once: true });
      v.addEventListener('loadeddata',     kick, { once: true });
      v.addEventListener('canplay',        kick, { once: true });
      v.addEventListener('canplaythrough', kick, { once: true });
    }
  });

  // Pausa fora de vista e retoma quando volta (economia de bateria/dados)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) {
          tryPlay(target);
        } else if (!target.paused && !target.ended) {
          target.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach(v => io.observe(v));
  }

  // Fallback: primeiro toque/click tenta liberar autoplay nos que falharam
  const unlock = () => {
    videos.forEach(tryPlay);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('click', unlock);
  };
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('click', unlock);

  // Se voltar para a aba/app, tenta tocar novamente
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) videos.forEach(tryPlay);
  });

  // Micro delay ajuda em alguns iPhones antigos
  setTimeout(() => videos.forEach(tryPlay), 120);
})();
