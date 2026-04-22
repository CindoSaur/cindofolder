/* ============================================================
   Y2K PIXEL WINDOW MANAGER — script.js  (fixed)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

/* ── SOUND ─────────────────────────────────────────────── */
const openSound  = new Audio("sound/iceberguser.mp3");
const closeSound = new Audio("sound/iceberguser.mp3");
openSound.volume  = 0.2;
closeSound.volume = 0.1;
function playOpen()  { try { openSound.currentTime  = 0; openSound.play();  } catch(e){} }
function playClose() { try { closeSound.currentTime = 0; closeSound.play(); } catch(e){} }

/* ── STAR CANVAS ───────────────────────────────────────── */
(function initStars() {
  const canvas = document.getElementById("starCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const COLORS = ["#ff00ff","#00ffff","#ffff00","#ffffff","#ff88ff"];
  let stars = [], W, H, frame = 0;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function createStar() {
    return { x: Math.random()*W, y: Math.random()*H, size: Math.random()<0.6?2:4,
             color: COLORS[Math.floor(Math.random()*COLORS.length)],
             alpha: Math.random(), speed: 0.005+Math.random()*0.01, phase: Math.random()*Math.PI*2 };
  }
  function draw() {
    ctx.clearRect(0,0,W,H); frame++;
    stars.forEach(s => {
      s.alpha = 0.2+0.8*Math.abs(Math.sin(s.phase+frame*s.speed));
      ctx.globalAlpha = s.alpha; ctx.fillStyle = s.color;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  resize();
  for (let i=0;i<80;i++) stars.push(createStar());
  draw();
  window.addEventListener("resize", () => { resize(); stars = []; for(let i=0;i<80;i++) stars.push(createStar()); });
})();

/* ── PIXEL CLICK BURST ─────────────────────────────────── */
(function initBurst() {
  const COLORS = ["#ff00ff","#00ffff","#ffff00","#ff4488","#00ff88"];
  document.addEventListener("click", (e) => {
    for (let i=0; i<8; i++) {
      const px = document.createElement("div");
      const angle = (i/8)*360;
      const dist  = 28 + Math.random()*18;
      const size  = Math.random()<0.5 ? 4 : 6;
      Object.assign(px.style, {
        position:"fixed", left:e.clientX+"px", top:e.clientY+"px",
        width:size+"px", height:size+"px",
        background: COLORS[Math.floor(Math.random()*COLORS.length)],
        pointerEvents:"none", zIndex:"9997", transition:"all 0.45s ease-out",
        transform:"translate(-50%,-50%)",
      });
      document.body.appendChild(px);
      requestAnimationFrame(() => {
        const rad = (angle*Math.PI)/180;
        px.style.transform = `translate(calc(-50% + ${Math.cos(rad)*dist}px), calc(-50% + ${Math.sin(rad)*dist}px))`;
        px.style.opacity = "0";
      });
      setTimeout(() => px.remove(), 480);
    }
  });
})();

/* ── GLITCH HEADER ─────────────────────────────────────── */


/* ============================================================
   WINDOW MANAGER
   ============================================================ */

let zCounter = 200;
const windowRegistry = {};

/* --- TASKBAR CLOCK --- */
function updateClock() {
  const now = new Date();
  const h  = String(now.getHours()).padStart(2,"0");
  const m  = String(now.getMinutes()).padStart(2,"0");
  const d  = String(now.getDate()).padStart(2,"0");
  const mo = String(now.getMonth()+1).padStart(2,"0");
  const el_t = document.getElementById("taskbar-time");
  const el_d = document.getElementById("taskbar-date");
  if (el_t) el_t.textContent = `${h}:${m}`;
  if (el_d) el_d.textContent = `${d}/${mo}`;
}
setInterval(updateClock, 1000);
updateClock();

/* --- REGISTER ALL WINDOWS --- */
function registerAllWindows() {
  document.querySelectorAll(".win").forEach(win => {
    const id = win.id;
    if (!id) return;

    const titleEl = win.querySelector(".win-title");
    const iconEl  = win.querySelector(".win-icon");
    const label = titleEl ? titleEl.textContent.split("—")[0].trim() : id;
    const iconHTML = iconEl ? iconEl.innerHTML : '<span class="material-symbols-rounded" style="font-size:14px">window</span>';

    const btn = document.createElement("button");
    btn.className = "taskbar-btn";
    btn.innerHTML = `<span class="tb-icon">${iconHTML}</span>${label.replace(".EXE","").trim()}`;
    btn.dataset.win = id;
    btn.style.display = "none";
    btn.addEventListener("click", () => taskbarBtnClick(id));
    document.getElementById("taskbar-btns").appendChild(btn);

    windowRegistry[id] = { el: win, taskbarBtn: btn, minimized: false, maximized: false, prevRect: null };

    win.querySelectorAll(".win-btn").forEach(b => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = b.dataset.action;
        const winId  = b.dataset.win;
        if (action === "close")    closeWindow(winId);
        if (action === "minimize") minimizeWindow(winId);
        if (action === "maximize") maximizeWindow(winId);
      });
    });

    win.addEventListener("mousedown", () => bringToFront(id), true);

    const titlebar = win.querySelector(".win-titlebar");
    if (titlebar) makeDraggable(win, titlebar);

    const resizeHandle = win.querySelector(".win-resize");
    if (resizeHandle) makeResizable(win, resizeHandle);
  });
}

/* --- OPEN WINDOW --- */
function openWindow(id) {
  const reg = windowRegistry[id];
  if (!reg) return;
  const win = reg.el;

  playOpen();

  if (reg.minimized) {
    win.classList.remove("minimized");
    reg.minimized = false;
    reg.taskbarBtn.classList.add("tb-active");
    bringToFront(id);
    return;
  }

  if (win.classList.contains("open")) {
    bringToFront(id);
    return;
  }

  const isMobile = window.innerWidth <= 768;
  if (!isMobile) {
    const offsets = {
      winWork:    {t:80,  l:120}, winWeb:     {t:100, l:200},
      winFollow:  {t:120, l:220}, winProject: {t:110, l:210},
      winContact: {t:130, l:240}, winPreview: {t:60,  l:180}
    };
    const off = offsets[id] || {t:100, l:160};
    const winW = parseInt(win.style.width) || 500;
    const maxL = Math.max(0, window.innerWidth  - winW - 20);
    const maxT = Math.max(0, window.innerHeight - 300  - 44);
    win.style.top  = Math.min(off.t, maxT) + "px";
    win.style.left = Math.min(off.l, maxL) + "px";
  }

  win.classList.add("open");
  reg.taskbarBtn.style.display = "flex";
  reg.taskbarBtn.classList.add("tb-active");

  bringToFront(id);
  updateAllTitlebars();
}

/* --- CLOSE WINDOW --- */
function closeWindow(id) {
  const reg = windowRegistry[id];
  if (!reg) return;
  const win = reg.el;

  playClose();
  win.classList.add("closing");
  setTimeout(() => {
    win.classList.remove("open","closing","maximized","minimized");
    win.style.width  = "";
    win.style.height = "";
    reg.minimized  = false;
    reg.maximized  = false;
    reg.taskbarBtn.style.display = "none";
    reg.taskbarBtn.classList.remove("tb-active");
    updateAllTitlebars();
  }, 160);
}

/* --- MINIMIZE WINDOW --- */
function minimizeWindow(id) {
  const reg = windowRegistry[id];
  if (!reg) return;
  playClose();
  reg.el.classList.add("minimized");
  reg.minimized = true;
  reg.taskbarBtn.classList.remove("tb-active");
  updateAllTitlebars();
}

/* --- MAXIMIZE / RESTORE --- */
function maximizeWindow(id) {
  const reg = windowRegistry[id];
  if (!reg) return;
  const win = reg.el;

  if (reg.maximized) {
    win.classList.remove("maximized");
    if (reg.prevRect) {
      win.style.top    = reg.prevRect.top;
      win.style.left   = reg.prevRect.left;
      win.style.width  = reg.prevRect.width;
      win.style.height = reg.prevRect.height;
    }
    reg.maximized = false;
    const btn = win.querySelector(".win-maximize");
    if (btn) btn.textContent = "□";
  } else {
    reg.prevRect = {
      top:    win.style.top    || "100px",
      left:   win.style.left   || "100px",
      width:  win.style.width  || "",
      height: win.style.height || "",
    };
    win.classList.add("maximized");
    reg.maximized = true;
    const btn = win.querySelector(".win-maximize");
    if (btn) btn.textContent = "❐";
  }

  bringToFront(id);
  playOpen();
}

/* --- BRING TO FRONT --- */
function bringToFront(id) {
  zCounter++;
  const reg = windowRegistry[id];
  if (!reg) return;
  reg.el.style.zIndex = zCounter;
  updateAllTitlebars();
}

/* --- UPDATE TITLEBARS --- */
function updateAllTitlebars() {
  let topZ = 0, topId = null;
  Object.entries(windowRegistry).forEach(([id, reg]) => {
    const z = parseInt(reg.el.style.zIndex || 0);
    if (reg.el.classList.contains("open") && !reg.minimized && z > topZ) {
      topZ = z; topId = id;
    }
  });
  Object.entries(windowRegistry).forEach(([id, reg]) => {
    if (!reg.el.classList.contains("open") || reg.minimized) return;
    if (id === topId) {
      reg.el.classList.add("active-window");
      reg.el.classList.remove("inactive-window");
      reg.taskbarBtn.classList.add("tb-active");
    } else {
      reg.el.classList.remove("active-window");
      reg.el.classList.add("inactive-window");
      reg.taskbarBtn.classList.remove("tb-active");
    }
  });
}

/* --- TASKBAR BUTTON CLICK --- */
function taskbarBtnClick(id) {
  const reg = windowRegistry[id];
  if (!reg) return;
  if (reg.minimized) {
    openWindow(id);
  } else if (reg.el.classList.contains("open")) {
    const topZ = Math.max(...Object.values(windowRegistry).map(r => parseInt(r.el.style.zIndex||0)));
    if (parseInt(reg.el.style.zIndex||0) === topZ) {
      minimizeWindow(id);
    } else {
      bringToFront(id);
    }
  }
}

/* --- DRAG --- */
function makeDraggable(win, handle) {
  let dragging = false, ox = 0, oy = 0;
  handle.addEventListener("mousedown", (e) => {
    if (window.innerWidth <= 768) return;
    if (e.target.classList.contains("win-btn")) return;
    dragging = true;
    const rect = win.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    win.style.transition = "none";
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const maxL = window.innerWidth  - win.offsetWidth;
    const maxT = window.innerHeight - win.offsetHeight - 44;
    win.style.left = Math.max(0, Math.min(e.clientX - ox, maxL)) + "px";
    win.style.top  = Math.max(0, Math.min(e.clientY - oy, maxT)) + "px";
  });
  document.addEventListener("mouseup", () => { dragging = false; });
}

/* --- RESIZE --- */
function makeResizable(win, handle) {
  let resizing = false, startX, startY, startW, startH;
  handle.addEventListener("mousedown", (e) => {
    if (window.innerWidth <= 768) return;
    resizing = true;
    startX = e.clientX; startY = e.clientY;
    startW = win.offsetWidth; startH = win.offsetHeight;
    e.preventDefault(); e.stopPropagation();
  });
  document.addEventListener("mousemove", (e) => {
    if (!resizing) return;
    const newW = Math.max(300, Math.min(startW + (e.clientX - startX), window.innerWidth  - win.offsetLeft - 10));
    const newH = Math.max(200, Math.min(startH + (e.clientY - startY), window.innerHeight - win.offsetTop  - 54));
    win.style.width  = newW + "px";
    win.style.height = newH + "px";
  });
  document.addEventListener("mouseup", () => { resizing = false; });
}

/* ── WIRE UP OPENERS ───────────────────────────────────── */
// Action cards — FIX: use event delegation so it always works
document.addEventListener("click", (e) => {
  const card = e.target.closest(".action-card");
  if (!card) return;
  e.preventDefault();
  const winId = card.dataset.win;
  if (winId) openWindow(winId);
});

// About More → Work window
const aboutMoreBtn = document.getElementById("aboutMoreBtn");
if (aboutMoreBtn) {
  aboutMoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openWindow("winWork");
  });
}

// Gallery preview
document.querySelectorAll(".draw-gallery img[data-preview]").forEach(img => {
  img.addEventListener("click", () => {
    document.getElementById("previewImg").src = img.src;
    const fname = img.src.split("/").pop();
    const fEl = document.getElementById("previewFilename");
    if (fEl) fEl.textContent = fname;
    openWindow("winPreview");
  });
});

// icon-item links
document.addEventListener("click", (e) => {
  const item = e.target.closest(".icon-item");
  if (!item) return;
  const link = item.dataset.link;
  if (link && link !== "#") window.open(link, "_blank");
});

/* ── ESC → close top window ───────────────────────────── */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  let topZ = 0, topId = null;
  Object.entries(windowRegistry).forEach(([id, reg]) => {
    const z = parseInt(reg.el.style.zIndex||0);
    if (reg.el.classList.contains("open") && !reg.minimized && z > topZ) {
      topZ = z; topId = id;
    }
  });
  if (topId) closeWindow(topId);
});

/* ── STAGGER CARDS ─────────────────────────────────────── */
document.querySelectorAll(".action-card").forEach((card, i) => {
  setTimeout(() => card.classList.add("visible"), 300 + i*80);
});

/* ── SIDEBAR SECTION HOVER ─────────────────────────────── */
document.querySelectorAll(".cv-section-title").forEach(el => {
  el.addEventListener("mouseenter", () => { el.style.color="#ff00ff"; el.style.borderColor="#ff00ff"; });
  el.addEventListener("mouseleave", () => { el.style.color=""; el.style.borderColor=""; });
});

/* ── INIT ──────────────────────────────────────────────── */
registerAllWindows();

/* ============================================================
   TRANSLATION SYSTEM
   ============================================================ */

let currentLang = "en";
let translations = null;

// Load vi.json once
async function loadTranslations() {
  if (translations) return translations;
  try {
    const res = await fetch("vi.json");
    translations = await res.json();
  } catch(e) {
    console.warn("Could not load vi.json:", e);
    translations = {};
  }
  return translations;
}

// Store original English strings on first run
function cacheEnglish() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    if (!el.dataset.i18nEn) el.dataset.i18nEn = el.innerHTML;
  });
  document.querySelectorAll("[data-i18n-list]").forEach(el => {
    if (!el.dataset.i18nEn) el.dataset.i18nEn = el.textContent.trim();
  });
}

function applyTranslations(lang, t) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (lang === "vi" && t[key] !== undefined) {
      el.innerHTML = t[key];
    } else if (lang === "en" && el.dataset.i18nEn) {
      el.innerHTML = el.dataset.i18nEn;
    }
  });

  document.querySelectorAll("[data-i18n-list]").forEach(el => {
    const raw = el.dataset.i18nList; // e.g. "cvList:0"
    const [key, idx] = raw.split(":");
    if (lang === "vi" && t[key] && t[key][parseInt(idx)] !== undefined) {
      el.textContent = t[key][parseInt(idx)];
    } else if (lang === "en" && el.dataset.i18nEn) {
      el.textContent = el.dataset.i18nEn;
    }
  });

  // Update translate button label
  const btn = document.getElementById("translateBtn");
  if (btn) {
    btn.textContent = lang === "vi"
      ? (t.translateBtnEn || "🌐 English")
      : (t.translateBtn   || "🌐 Tiếng Việt");
  }
}

// Translate button click
const translateBtn = document.getElementById("translateBtn");
if (translateBtn) {
  translateBtn.addEventListener("click", async () => {
    cacheEnglish();
    const t = await loadTranslations();
    currentLang = currentLang === "en" ? "vi" : "en";
    applyTranslations(currentLang, t);
    // Toggle Vietnamese font class on body
    if (currentLang === "vi") {
      document.body.classList.add("vi-active");
    } else {
      document.body.classList.remove("vi-active");
    }
  });
}

}); // end DOMContentLoaded
