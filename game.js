import { X } from "./skills2.js";
import { ICON } from "./icons.js";
import { Y } from "./skills3.js";
import { Wd } from "./world.js";
// ===== Frost Mage: khởi tạo canvas và hàm tiện ích =====
const W = 320,
  H = 180,
  cv = document.getElementById("c"),
  g = cv.getContext("2d");
g.imageSmoothingEnabled = false;
const $ = (id) => document.getElementById(id),
  R = (a, b) => a + Math.random() * (b - a),
  cl = (v, a, b) => Math.max(a, Math.min(b, v));
function spr(rows, pal) {
  const c = document.createElement("canvas");
  c.width = rows[0].length;
  c.height = rows.length;
  const x = c.getContext("2d");
  rows.forEach((r, j) =>
    [...r].forEach((ch, i) => {
      if (pal[ch]) {
        x.fillStyle = pal[ch];
        x.fillRect(i, j, 1, 1);
      }
    }),
  );
  return c;
}

// ===== Sprite pixel (pháp sư, slime) và nền =====
const MAGE = spr(
  [
    "....bb....",
    "...bBBb...",
    "..bBBBBb..",
    ".bbbbbbbb.",
    "..sSSSSs..",
    "..sEsEss..",
    "...sSSs...",
    "..BBBBBB..",
    ".BBcBBcBB.",
    ".BBBBBBBB.",
    "..BBBBBB..",
    "..bb..bb..",
  ],
  { b: "#3b4fd8", B: "#5d7bff", s: "#ffd9b0", S: "#f3c28e", E: "#1b1b3a", c: "#bfe8ff" },
);
const SL = [
  "...gggg...",
  "..gGGGGg..",
  ".gGGGGGGg.",
  ".gGwGGwGg.",
  ".gGeGGeGg.",
  "gGGGGGGGGg",
  "gGGGGGGGGg",
  ".gggggggg.",
];
const SLIME = spr(SL, { g: "#2f8f4e", G: "#57d37a", w: "#fff", e: "#1b1b3a" }),
  ICE = spr(SL, { g: "#4f9fd8", G: "#bfe8ff", w: "#fff", e: "#2a4a7a" });
const ground = document.createElement("canvas");
ground.width = W;
ground.height = H;
{
  const x = ground.getContext("2d");
  x.fillStyle = "#16213d";
  x.fillRect(0, 0, W, H);
  for (let i = 0; i < 1400; i++) {
    x.fillStyle = Math.random() < 0.5 ? "#1b2a4d" : "#121b34";
    x.fillRect(R(0, W) | 0, R(0, H) | 0, 1 + ((Math.random() * 2) | 0), 1);
  }
  for (let i = 0; i < 26; i++) {
    const a = R(0, W) | 0,
      b = R(0, H) | 0;
    x.fillStyle = "#24365f";
    x.fillRect(a, b, 3, 2);
    x.fillStyle = "#2d4375";
    x.fillRect(a, b, 3, 1);
  }
}

// ===== Âm thanh 8-bit =====
let AC;
function snd(f, d, t = "square", v = 0.05, s = 0) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const n = AC.currentTime,
      o = AC.createOscillator(),
      a = AC.createGain();
    o.type = t;
    o.frequency.setValueAtTime(f, n);
    if (s) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + s), n + d);
    a.gain.setValueAtTime(v, n);
    a.gain.exponentialRampToValueAtTime(0.001, n + d);
    o.connect(a);
    a.connect(AC.destination);
    o.start();
    o.stop(n + d);
  } catch (e) {}
}

// ===== Trạng thái game =====
let st = "menu",
  P,
  E = [],
  N = [],
  PT = [],
  score = 0,
  kills = 0,
  best = 0,
  shake = 0,
  flash = 0,
  spawnT = 0,
  time = 0,
  overAt = 0,
  stop = 0,
  SW = [],
  LN = [],
  BS = [],
  BZ = null;
try {
  best = +localStorage.getItem("fm_best") || 0;
} catch (e) {}
const FL = Array.from({ length: 50 }, () => ({
  x: R(0, W),
  y: R(0, H),
  v: R(6, 20),
  s: Math.random() < 0.2 ? 2 : 1,
}));
function reset() {
  X.reset();
  Y.reset();
  Wd.reset();
  P = {
    x: 160,
    y: 96,
    hp: 5,
    inv: 0,
    cd: 0.7,
    face: 1,
    R: 44,
    cdMax: 1.5,
    t: 0,
    act: null,
    sl: null,
    slcd: 0,
    lcd: 0,
    bcd: 0,
    zcd: 0,
  };
  stop = 0;
  SW = [];
  LN = [];
  BS = [];
  BZ = null;
  E = [];
  N = [];
  PT = [];
  score = 0;
  kills = 0;
  time = 0;
  spawnT = 1;
}
reset();

// ===== Điều khiển: bàn phím, chạm, chuột =====
const keys = {};
let tv = { x: 0, y: 0 },
  tp = null;
addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = 1;
  if ((e.key === " " || e.key === "Enter") && (st === "menu" || st === "over")) start();
  if (st === "play" && !e.repeat && e.key >= "1" && e.key <= "9") { const v = SK.filter((s) => Wd.can(s)); if (v[+e.key - 1]) v[+e.key - 1].use(); }
  if (st === "play" && !e.repeat && KM[e.key.toLowerCase()] !== undefined)
    useSk(KM[e.key.toLowerCase()]);
  if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
});
addEventListener("keyup", (e) => (keys[e.key.toLowerCase()] = 0));
const stg = $("stage");
stg.addEventListener("pointerdown", (e) => {
  tp = { x: e.clientX, y: e.clientY, t: performance.now() };
});
stg.addEventListener("pointermove", (e) => {
  if (!tp) return;
  const dx = e.clientX - tp.x,
    dy = e.clientY - tp.y;
  tv = { x: cl(dx / 36, -1, 1), y: cl(dy / 36, -1, 1) };
});
const up = (e) => {
  if (
    tp &&
    e &&
    e.type === "pointerup" &&
    st === "play" &&
    performance.now() - tp.t < 220 &&
    Math.hypot(e.clientX - tp.x, e.clientY - tp.y) < 12
  )
    slash();
  tp = null;
  tv = { x: 0, y: 0 };
};
stg.addEventListener("pointerup", up);
stg.addEventListener("pointercancel", up);
$("go").addEventListener("click", start);

// ===== Bắt đầu, hiệu ứng hạt, các chiêu thức =====
function start() {
  if (st === "over" && performance.now() < overAt) return;
  st = "pick";
  Wd.select(begin);
}
function begin() {
  reset();
  st = "play";
  $("screen").classList.add("hide");
  snd(440, 0.15, "square", 0.05, 300);
}
function toast(t) {
  const e = $("toast");
  e.textContent = t;
  e.style.opacity = 1;
  setTimeout(() => (e.style.opacity = 0), 1100);
}
function burst(x, y, n, cols, sp, l = 0.6) {
  for (let i = 0; i < n; i++) {
    const a = R(0, 6.283),
      s = R(0.3, 1) * sp;
    PT.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      l,
      m: l * R(0.6, 1),
      c: cols[(Math.random() * cols.length) | 0],
    });
  }
}
const IC = ["#ffffff", "#bfe8ff", "#8fd8ff", "#5aa9e6"];
const ringR = (n) => n.R * (1 - Math.pow(1 - Math.min(1, n.t / 0.5), 3));
function cast() {
  P.cd = P.cdMax;
  N.push({ x: P.x, y: P.y - 2, t: 0, R: P.R, h: new Set() });
  shake = 2.5;
  flash = 0.4;
  snd(200, 0.5, "sawtooth", 0.06, -120);
  snd(900, 0.35, "triangle", 0.04, 500);
}
function hit(n, e) {
  n.h.add(e);
  if (!n.stopped) {
    n.stopped = 1;
    stop = 0.14;
    shake = Math.max(shake, 3.5);
  }
  e.hp--;
  e.fz = 2.2;
  e.kx = Math.cos(Math.atan2(e.y - n.y, e.x - n.x)) * 80;
  e.ky = Math.sin(Math.atan2(e.y - n.y, e.x - n.x)) * 80;
  burst(e.x, e.y - 3, 6, IC, 40, 0.4);
  snd(1200, 0.08, "square", 0.03, -600);
  if (e.hp <= 0) {
    e.die = 1;
    e.fz = 0.25;
  }
}
function slash() {
  if (P.slcd > 0 || time < 0.1) return;
  let b = null,
    bd = 48;
  for (const e of E) {
    const d = Math.hypot(e.x - P.x, e.y - P.y);
    if (d < bd) {
      bd = d;
      b = e;
    }
  }
  const a = b ? Math.atan2(b.y - (P.y - 5), b.x - P.x) : P.face > 0 ? 0 : Math.PI;
  P.face = Math.cos(a) >= 0 ? 1 : -1;
  P.sl = { t: -0.12, f: 0, a };
  P.slcd = 0.4;
  snd(700, 0.08, "triangle", 0.03, -300);
}
function spawn() {
  Wd.spawn();
}

// ===== Chiêu mới: Lance, Blink, Blizzard và thanh nút chiêu =====
function lance() {
  if (P.lcd > 0 || time < 0.1) return;
  let b = null,
    bd = 1e9;
  for (const e of E) {
    const d = Math.hypot(e.x - P.x, e.y - P.y);
    if (d < bd) {
      bd = d;
      b = e;
    }
  }
  const a = b ? Math.atan2(b.y - 4 - (P.y - 6), b.x - P.x) : P.face > 0 ? 0 : Math.PI;
  P.face = Math.cos(a) >= 0 ? 1 : -1;
  P.lcd = 1;
  LN.push({
    x: P.x,
    y: P.y - 6,
    vx: Math.cos(a) * 210,
    vy: Math.sin(a) * 210,
    a,
    l: 1,
    h: new Set(),
  });
  snd(1000, 0.15, "sawtooth", 0.04, -600);
  shake = Math.max(shake, 1);
}
function blink() {
  if (P.bcd > 0 || time < 0.1) return;
  let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + tv.x,
    dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0) + tv.y,
    m = Math.hypot(dx, dy);
  if (m < 0.1) {
    dx = P.face;
    dy = 0;
    m = 1;
  }
  dx /= m;
  dy /= m;
  const ox = P.x,
    oy = P.y;
  burst(ox, oy - 5, 18, IC, 70, 0.5);
  N.push({ x: ox, y: oy - 2, t: 0.25, R: 22, h: new Set() });
  P.x = cl(P.x + dx * 44, 8, W - 8);
  P.y = cl(P.y + dy * 44, 14, H - 6);
  P.inv = Math.max(P.inv, 0.4);
  P.bcd = 3;
  burst(P.x, P.y - 5, 14, IC, 50, 0.4);
  flash = 0.2;
  snd(500, 0.2, "sine", 0.05, 900);
}
function bliz() {
  if (P.zcd > 0 || time < 0.1) return;
  P.zcd = 14;
  BZ = { t: 4, n: 0 };
  toast("BLIZZARD!");
  flash = 0.5;
  shake = 4;
  snd(150, 1, "sawtooth", 0.06, -60);
}
const SK = [
  {
    k: "1",
    ic: "❄",
    nm: "NOVA", elem: "ice",
    cd: () => P.cdMax,
    rem: () => P.cd,
    use: () => {
      if (!P.act && P.cd <= 0) {
        P.act = { t: -0.3, f: 0 };
        snd(300, 0.3, "triangle", 0.03, 400);
      }
    },
  },
  { k: "2", ic: "⚔", nm: "SLASH", cd: () => 0.4, rem: () => P.slcd, use: slash },
  { k: "3", ic: "➤", nm: "LANCE", elem: "ice", cd: () => 1, rem: () => P.lcd, use: lance },
  { k: "4", ic: "✦", nm: "BLINK", elem: "arcane", cd: () => 3, rem: () => P.bcd, use: blink },
  { k: "5", ic: "☄", nm: "BLIZZ", elem: "ice", cd: () => 14, rem: () => P.zcd, use: bliz },
];
const KM = { q: 0, " ": 1, j: 1, k: 1, e: 2, r: 3, f: 4 };
function useSk(i) {
  const s = SK[i];
  if (s && Wd.can(s)) s.use();
}
function mkBtn(s) {
  const b = document.createElement("button");
  b.className = "sk";
  if (s.elem) b.dataset.el = s.elem;
  b.innerHTML = "<b>" + s.k + '</b><img src="' + ICON[s.nm] + '" alt=""><small>' + s.nm + "</small><i></i>";
  b.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (st === "play") useSk(SK.indexOf(s));
  });
  ["pointerup", "pointercancel"].forEach((t) => b.addEventListener(t, (e) => e.stopPropagation()));
  s.el = b;
  s.ov = b.querySelector("i");
  $("skills").appendChild(b);
}
SK.forEach(mkBtn);
document.querySelectorAll(".pd").forEach((b) => {
  const k = b.dataset.k,
    on = (e) => {
      e.stopPropagation();
      e.preventDefault();
      keys[k] = 1;
      b.classList.add("on");
      try {
        b.setPointerCapture(e.pointerId);
      } catch (x) {}
    },
    off = (e) => {
      e.stopPropagation();
      keys[k] = 0;
      b.classList.remove("on");
    };
  b.addEventListener("pointerdown", on);
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => b.addEventListener(t, off));
});

// ===== Cập nhật logic mỗi khung hình =====
function upd(dt) {
  time += dt;
  X.logic(dt);
  Y.logic(dt);
  Wd.logic(dt);
  const wave = 1 + ((time / 20) | 0);
  let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + tv.x,
    dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0) + tv.y;
  const m = Math.hypot(dx, dy);
  if (m > 1) {
    dx /= m;
    dy /= m;
  }
  const sp = P.act ? 0.45 : 1;
  P.x = cl(P.x + dx * (P.spd || 62) * sp * dt, 8, W - 8);
  P.y = cl(P.y + dy * (P.spd || 62) * sp * dt, 14, H - 6);
  if (Math.abs(dx) > 0.1) P.face = dx > 0 ? 1 : -1;
  P.t += dt * (m > 0.1 ? 10 : 2.5);
  P.inv -= dt;
  P.cd -= dt;
  P.slcd -= dt;
  P.lcd -= dt;
  P.bcd -= dt;
  P.zcd -= dt;

  if (P.act) {
    P.act.t += dt;
    if (P.act.t < 0 && Math.random() < 0.7) {
      const a = R(0, 6.283);
      PT.push({
        x: P.x + P.face * 3 + Math.cos(a) * 9,
        y: P.y - 15 + Math.sin(a) * 9,
        vx: -Math.cos(a) * 30,
        vy: -Math.sin(a) * 30,
        l: 0.25,
        m: 0.25,
        c: IC[(Math.random() * 3) | 0],
      });
    }
    if (P.act.t >= 0 && !P.act.f) {
      P.act.f = 1;
      cast();
    }
    if (P.act.t > 0.86) P.act = null;
  }
  for (const w of SW) w.t += dt;
  SW = SW.filter((w) => w.t < 0.25);
  for (const q of LN) {
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.l -= dt;
    PT.push({
      x: q.x,
      y: q.y,
      vx: R(-12, 12),
      vy: R(-12, 12),
      l: 0.3,
      m: 0.3,
      c: IC[(Math.random() * 4) | 0],
    });
    for (const e of E)
      if (!q.h.has(e) && Math.hypot(e.x - q.x, e.y - 4 - q.y) < 8) {
        q.h.add(e);
        e.hp--;
        e.fz = Math.max(e.fz, 1.4);
        e.kx = q.vx * 0.3;
        e.ky = q.vy * 0.3;
        burst(e.x, e.y - 4, 8, IC, 50, 0.4);
        shake = Math.max(shake, 1.8);
        stop = Math.max(stop, 0.04);
        snd(1500, 0.06, "square", 0.03, -700);
        if (e.hp <= 0 && !e.die) {
          e.die = 1;
          e.fz = 0.2;
        }
      }
  }
  LN = LN.filter((q) => q.l > 0 && q.x > -20 && q.x < W + 20 && q.y > -20 && q.y < H + 20);
  if (BZ) {
    BZ.t -= dt;
    BZ.n -= dt;
    if (BZ.n <= 0) {
      BZ.n = 0.09;
      BS.push({ x: R(6, W - 6), y: R(12, H - 4), t: 0, d: 0 });
    }
    if (BZ.t <= 0) BZ = null;
  }
  for (const q of BS) {
    q.t += dt;
    if (!q.d && q.t >= 0.25) {
      q.d = 1;
      burst(q.x, q.y - 2, 6, IC, 45, 0.35);
      for (const e of E)
        if (Math.hypot(e.x - q.x, e.y - 4 - q.y) < 17) {
          e.hp--;
          e.fz = Math.max(e.fz, 1.8);
          if (e.hp <= 0 && !e.die) {
            e.die = 1;
            e.fz = 0.2;
          }
        }
    }
  }
  BS = BS.filter((q) => q.t < 0.45);
  if (P.sl) {
    const s = P.sl;
    s.t += dt;
    if (s.t >= 0 && !s.f) {
      s.f = 1;
      SW.push({ x: P.x, y: P.y - 5, a: s.a, t: 0 });
      let h = 0;
      for (const e of E) {
        const d = Math.hypot(e.x - P.x, e.y - (P.y - 5));
        if (d > 30) continue;
        let da = Math.atan2(e.y - (P.y - 5), e.x - P.x) - s.a;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) > 1.2) continue;
        h++;
        const fr = e.fz > 0;
        e.hp = fr ? e.hp - (e.kind === "boss" ? 4 : 99) : e.hp - 1;
        const k = Math.atan2(e.y - P.y, e.x - P.x);
        e.kx = Math.cos(k) * 130;
        e.ky = Math.sin(k) * 130;
        e.fz = Math.max(e.fz, 0.3);
        burst(e.x, e.y - 3, fr ? 10 : 6, fr ? IC : ["#fff", "#ffe08a"], 60, 0.35);
        if (e.hp <= 0 && !e.die) {
          e.die = 1;
          e.fz = 0.2;
        }
      }
      if (h) {
        stop = 0.1;
        shake = Math.max(shake, 3);
        snd(260, 0.1, "sawtooth", 0.05, -120);
      }
    }
    if (s.t > 0.4) P.sl = null;
  }
  spawnT -= dt;
  if (spawnT <= 0) {
    spawn();
    spawnT = Math.max(0.3, 1.1 - wave * 0.07);
  }
  for (const n of N) {
    n.t += dt;
    const rr = ringR(n);
    for (const e of E) if (!n.h.has(e) && Math.hypot(e.x - n.x, e.y - n.y) <= rr + 3) hit(n, e);
    if (n.t < 0.5)
      for (let i = 0; i < 4; i++) {
        const a = R(0, 6.283);
        PT.push({
          x: n.x + Math.cos(a) * rr,
          y: n.y + Math.sin(a) * rr,
          vx: R(-8, 8),
          vy: R(-30, -6),
          l: 0.5,
          m: 0.5,
          c: IC[(Math.random() * 3) | 0],
        });
      }
  }
  N = N.filter((n) => n.t < 0.8);
  for (const e of E) {
    if (e.fz > 0) {
      e.fz -= dt;
      e.x += e.kx * dt;
      e.y += e.ky * dt;
      e.kx *= 0.9;
      e.ky *= 0.9;
      if (e.fz <= 0 && e.die) {
        e.gone = 1;
        kills++;
        score += 10 * wave;
        burst(e.x, e.y - 3, 22, IC, 70, 0.7);
        burst(e.x, e.y - 3, 6, ["#57d37a", "#2f8f4e"], 50, 0.5);
        shake = Math.max(shake, 1.5);
        snd(R(500, 700), 0.12, "square", 0.04, -300);
        if (kills % 8 == 0) {
          P.R = Math.min(92, P.R + 6);
          P.cdMax = Math.max(0.7, P.cdMax - 0.07);
          toast("NOVA POWER UP!");
          snd(520, 0.4, "triangle", 0.06, 500);
        }
      }
    } else {
      const a = Math.atan2(P.y - e.y, P.x - e.x);
      e.x += Math.cos(a) * e.sp * dt;
      e.y += Math.sin(a) * e.sp * dt;
      e.ph += dt * 8;
      if (P.inv <= 0 && Math.hypot(P.x - e.x, P.y - e.y) < 7) {
        P.hp--;
        P.inv = 1.2;
        shake = 5;
        flash = 0.25;
        snd(120, 0.3, "sawtooth", 0.08, -60);
        burst(P.x, P.y - 5, 10, ["#ff6b8a", "#fff"], 50, 0.4);
        if (P.hp <= 0 && !Wd.down()) {
          over();
        }
      }
    }
  }
  E = E.filter((e) => !e.gone);
  for (const p of PT) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.l -= dt;
  }
  PT = PT.filter((p) => p.l > 0);
}

// ===== Kết thúc game =====
function over() {
  st = "over";
  overAt = performance.now() + 700;
  if (score > best) {
    best = score;
    try {
      localStorage.setItem("fm_best", best);
    } catch (e) {}
  }
  $("ti").textContent = "GAME OVER";
  $("sub").textContent = "SCORE " + score + "  ·  BEST " + best;
  $("info").textContent =
    "Bạn đã tiêu diệt " + kills + " quái. Nhấn Space hoặc nút bên dưới để chơi lại.";
  $("go").textContent = "RETRY";
  $("screen").classList.remove("hide");
}

// ===== Vẽ hiệu ứng chiêu thức =====
function drawNova(n, front) {
  const r = ringR(n),
    k = n.t / 0.8,
    cx = Math.round(n.x),
    cy = Math.round(n.y);
  if (!front) {
    g.globalAlpha = 0.16 * (1 - k);
    g.fillStyle = "#bfe8ff";
    for (let y = -r; y <= r; y += 2) {
      const w = Math.sqrt(Math.max(0, r * r - y * y));
      g.fillRect(Math.round(cx - w), (cy + y) | 0, Math.round(w * 2), 1);
    }
    g.globalAlpha = 1 - k * k;
    const c = Math.ceil(6.283 * r),
      f = (n.t * 30) | 0;
    for (let i = 0; i < c; i++) {
      const a = (i / c) * 6.283,
        col = IC[(i * 7 + f) % 4];
      g.fillStyle = col;
      g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 2, 2);
    }
  } else {
    g.globalAlpha = 1 - k;
    g.fillStyle = "#fff";
    const L = Math.min(1, n.t / 0.5) * 9;
    for (let s = 0; s < 16; s++) {
      const a = (s / 16) * 6.283;
      for (let d = 0; d < L; d++) {
        g.fillStyle = d > L - 3 ? "#fff" : "#8fd8ff";
        g.fillRect(
          Math.round(cx + Math.cos(a) * (r + d - 2)),
          Math.round(cy + Math.sin(a) * (r + d - 2)),
          1,
          1,
        );
      }
    }
  }
  g.globalAlpha = 1;
}
function drawLn(q) {
  for (let i = 0; i < 9; i++) {
    g.fillStyle = i < 2 ? "#fff" : i < 5 ? "#bfe8ff" : "#5aa9e6";
    const s = i < 3 ? 2 : 1;
    g.fillRect(
      Math.round(q.x - Math.cos(q.a) * i * 1.6),
      Math.round(q.y - Math.sin(q.a) * i * 1.6),
      s,
      s,
    );
  }
}
function drawBs(q) {
  const x = Math.round(q.x),
    y = Math.round(q.y);
  if (!q.d) {
    const k = q.t / 0.25;
    g.globalAlpha = 0.3 + 0.4 * k;
    g.fillStyle = "#8fd8ff";
    g.fillRect(x - 3, y, 7, 1);
    g.globalAlpha = 1;
    const hy = Math.round(y - (1 - k) * 90);
    for (let i = 0; i < 10; i++) {
      g.fillStyle = i < 2 ? "#fff" : i < 5 ? "#bfe8ff" : "#5aa9e6";
      g.fillRect(x, hy - i * 2, 2, 2);
    }
  } else {
    const r = ((q.t - 0.25) / 0.2) * 17;
    g.globalAlpha = Math.max(0, 1 - (q.t - 0.25) / 0.2);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * 6.283;
      g.fillStyle = i % 2 ? "#fff" : "#8fd8ff";
      g.fillRect(Math.round(x + Math.cos(a) * r), Math.round(y - 2 + Math.sin(a) * r * 0.7), 2, 2);
    }
    g.globalAlpha = 1;
  }
}
function drawSw(w) {
  const hd = w.a - 1.2 + 2.4 * Math.min(1, w.t / 0.08);
  g.globalAlpha = Math.max(0, 1 - w.t / 0.25);
  for (let q = 0; q < 26; q++) {
    const an = hd - q * 0.07;
    if (an < w.a - 1.2) break;
    for (let r = 15; r <= 25; r += 3) {
      g.fillStyle = q < 4 ? "#fff" : q < 12 ? "#bfe8ff" : "#5aa9e6";
      g.fillRect(Math.round(w.x + Math.cos(an) * r), Math.round(w.y + Math.sin(an) * r), 2, 2);
    }
  }
  g.globalAlpha = 1;
}
function drawWand(ps, a) {
  const w = (x, y, c) => {
    g.fillStyle = c;
    g.fillRect(x, y, 1, 1);
  };
  if (ps == 0) {
    for (let y = -10; y <= -4; y++) w(5, y, "#8a5a2b");
    w(5, -11, "#8fd8ff");
  } else if (ps == 1) {
    const k = Math.min(1, (a.t + 0.3) / 0.3),
      s = 1 + ((k * 2) | 0);
    for (let y = -14; y <= -7; y++) w(4, y, "#8a5a2b");
    g.globalAlpha = 0.4 + k * 0.6;
    g.fillStyle = "#bfe8ff";
    g.fillRect(4 - (s >> 1), -15 - s, s, s);
    g.fillStyle = "#fff";
    g.fillRect(4, -16 - (s >> 1), 1, 1);
    g.globalAlpha = 1;
  } else if (ps == 2) {
    for (let x = 5; x <= 11; x++) w(x, -8, "#8a5a2b");
    g.fillStyle = "#fff";
    g.fillRect(10, -10, 3, 5);
    g.fillRect(8, -8, 7, 1);
    w(12, -11, "#8fd8ff");
    w(12, -4, "#8fd8ff");
  } else {
    w(5, -7, "#8a5a2b");
    w(6, -6, "#8a5a2b");
    w(7, -5, "#8a5a2b");
    w(8, -4, "#8fd8ff");
    w(9, -4, "#bfe8ff");
  }
}

// ===== Vẽ toàn bộ màn hình =====
function draw() {
  g.save();
  const sx = shake > 0.2 ? Math.round(R(-shake, shake)) : 0,
    sy = shake > 0.2 ? Math.round(R(-shake, shake)) : 0;
  g.translate(sx, sy);
  g.drawImage(Wd.ground(), 0, 0);
  X.back(g);
  for (const n of N) drawNova(n, false);
  const items = [...E.map((e) => ({ y: e.y, e })), { y: P.y, p: 1 }].sort((a, b) => a.y - b.y);
  for (const it of items) {
    if (it.e) {
      const e = it.e,
        x = Math.round(e.x),
        y = Math.round(e.y);
      g.fillStyle = "#0004";
      g.fillRect(x - 4, y - 1, 8, 2);
      const sq = e.fz > 0 ? 0 : Math.round(Math.sin(e.ph));
      { const c = Wd.spr(e); g.drawImage(c, x - (c.width >> 1), y - c.height, c.width, c.height + sq); }
      if (e.fz > 0 && ((e.fz * 20) | 0) % 2 == 0) {
        g.fillStyle = "#fff";
        g.fillRect(x - 3, y - 7, 2, 1);
      }
    } else if (!(P.inv > 0 && !Wd.shield() && ((time * 20) | 0) % 2)) {
      const x = Math.round(P.x),
        y = Math.round(P.y),
        b = Math.round(Math.sin(P.t) * 1);
      g.fillStyle = "#0005";
      g.fillRect(x - 4, y - 1, 9, 2);
      const a = P.sl || P.act,
        ps = !a ? 0 : a.t < 0 ? 1 : a.t < 0.06 ? 2 : a.t < (P.sl ? 0.4 : 0.86) ? 3 : 0,
        lx = ps == 1 ? -1 : ps == 2 ? 1 : 0;
      g.save();
      g.translate(x, y);
      g.scale(P.face, 1);
      g.drawImage(Wd.sprite(), -5 + lx, -12 + (b > 0 ? -1 : 0));
      drawWand(ps, a);
      g.restore();
    }
  }
  for (const n of N) drawNova(n, true);
  for (const w of SW) drawSw(w);
  for (const q of LN) drawLn(q);
  for (const q of BS) drawBs(q);
  if (BZ) {
    g.fillStyle = "rgba(170,215,255,.1)";
    g.fillRect(-8, -8, W + 16, H + 16);
  }
  for (const p of PT) {
    g.globalAlpha = cl(p.l / p.m, 0, 1);
    g.fillStyle = p.c;
    g.fillRect(Math.round(p.x), Math.round(p.y), p.l > p.m * 0.5 ? 2 : 1, p.l > p.m * 0.5 ? 2 : 1);
  }
  g.globalAlpha = 1;
  g.fillStyle = "#dff4ff";
  for (const f of FL) g.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s);
  X.front(g);
  Wd.front(g);
  Y.front(g);
  g.restore();
  if (flash > 0) {
    g.fillStyle = "rgba(200,235,255," + flash + ")";
    g.fillRect(0, 0, W, H);
  }
}

// ===== HUD và vòng lặp chính =====
let lastHud = "";
function hud() {
  const s =
    st === "menu"
      ? ""
      : "♥".repeat(Math.max(0, P.hp)) +
        '<span style="opacity:.3">' +
        "♥".repeat(5 - Math.max(0, P.hp)) +
        "</span>";
  const t = s + "|" + score + "|" + Wd.label();
  if (t !== lastHud) {
    lastHud = t;
    $("hp").innerHTML = s;
    $("sc").textContent = "SCORE " + score;
    $("wv").textContent = Wd.label();
  }
  $("cd").style.width = 100 - cl(P.cd / P.cdMax, 0, 1) * 100 + "%";
  $("skills").classList.toggle("hide", st !== "play");
  $("pad").classList.toggle("hide", st !== "play");
  let slot = 0;
  for (const s of SK) {
    const r = cl(s.rem() / s.cd(), 0, 1);
    s.ov.style.height = r * 100 + "%";
    s.el.classList.toggle("rdy", r <= 0);
    const ok = Wd.can(s);
    s.el.classList.toggle("hide", !ok);
    if (ok) { const b = s.el.firstChild, n = String(++slot); if (b.textContent !== n) b.textContent = n; }
  }
}
let last = performance.now();
function loop(n) {
  const dt = Math.min(0.05, (n - last) / 1000);
  last = n;
  if (st === "play") {
    if (stop > 0) stop -= dt;
    else upd(dt);
  } else {
    for (const p of PT) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.l -= dt;
    }
    PT = PT.filter((p) => p.l > 0);
    for (const nv of N) nv.t += dt;
    N = N.filter((v) => v.t < 0.8);
  }
  for (const f of FL) {
    f.y += f.v * dt;
    f.x += Math.sin(f.y / 14) * 6 * dt;
    if (f.y > H) {
      f.y = -2;
      f.x = R(0, W);
    }
  }
  X.tick(dt);
  Y.tick(dt);
  Wd.tick(dt);
  shake *= 0.88;
  flash = Math.max(0, flash - dt * 1.2);
  draw();
  hud();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ===== Chiêu thức 6-8 dùng hiệu ứng thật của pixelfx (xem skills2.js) =====
const G = {
  get P() { return P; }, get E() { return E; }, get time() { return time; }, get kills() { return kills; },
  get st() { return st; },
  get stop() { return stop; }, set stop(v) { stop = v; },
  get shake() { return shake; }, set shake(v) { shake = v; },
  set flash(v) { flash = v; },
  burst, snd, toast, cl, R, W, H, over,
};
X.init(G);
Y.init(G);
Wd.init(G);
FL.length = 0; // tuyết của pixelfx thay cho tuyết tự vẽ
for (const s of [...X.skills, ...Y.skills, ...Wd.skills]) {
  const i = SK.push(s) - 1;
  for (const key of s.keys) KM[key] = i;
  mkBtn(s);
}
