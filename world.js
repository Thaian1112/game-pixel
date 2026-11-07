// ===== Thế giới: 5 màn chơi, 4 nhân vật đổi phiên, 3 loại quái + trùm, 3 chiêu hỗ trợ (hồi máu, khiên, ngừng thời gian) =====
import { X } from "./skills2.js";
import { ICON } from "./icons.js";
import * as heal from "./vendor/pixelfx/src/fx/holy/heal.js";
import * as shield from "./vendor/pixelfx/src/fx/holy/divine-shield.js";
import * as tstop from "./vendor/pixelfx/src/fx/arcane/time-stop.js";
import * as arrive from "./vendor/pixelfx/src/fx/arcane/blink-in.js";

const $ = (id) => document.getElementById(id);
function spr(rows, pal) {
  const c = document.createElement("canvas");
  c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext("2d");
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); } }));
  return c;
}
// ----- 4 nhân vật -----
const MG = ["....bb....", "...bBBb...", "..bBBBBb..", ".bbbbbbbb.", "..sSSSSs..", "..sEsEss..", "...sSSs...", "..BBBBBB..", ".BBcBBcBB.", ".BBBBBBBB.", "..BBBBBB..", "..bb..bb.."];
const sk = { s: "#ffd9b0", S: "#f3c28e", E: "#1b1b3a" };
const CH = [
  { n: "FROST", el: "ice", hp: 5, spd: 1, pal: { ...sk, b: "#3b4fd8", B: "#5d7bff", c: "#bfe8ff" } },
  { n: "EMBER", el: "fire", hp: 4, spd: 1.05, pal: { ...sk, b: "#8a1f17", B: "#e0482a", c: "#ffd23a" } },
  { n: "STORM", el: "bolt", hp: 5, spd: 0.92, pal: { ...sk, b: "#6a5a2a", B: "#d8b34a", c: "#fff7c0" } },
  { n: "SHADE", el: "void", hp: 3, spd: 1.2, pal: { b: "#2a1f3d", B: "#5a3d8a", s: "#c9a58a", S: "#a98468", E: "#c08bff", c: "#c08bff" } },
  { n: "LUMEN", el: "holy", hp: 5, spd: 0.95, pal: { ...sk, b: "#b89a3a", B: "#ffe9a8", c: "#fff" } },
  { n: "ARCANA", el: "arcane", hp: 4, spd: 1.1, pal: { ...sk, b: "#1f6a7a", B: "#3fd0e0", c: "#fff" } },
];
const EL = { ice: ["ICE", "#5aa9e6", ["NOVA", "LANCE", "BLIZZ", "ICICLE"]], fire: ["FIRE", "#ff8a2a", ["FIRE", "RING", "METEOR", "FLAME"]], bolt: ["BOLT", "#ffe14d", ["BOLT", "STRIKE", "CLAP", "BALL"]], void: ["VOID", "#a35bff", ["VOID", "BLAST", "TENDRIL", "DRAIN"]], holy: ["HOLY", "#ffd994", ["SMITE", "LIGHT", "SUN", "FEATHER", "HEAL", "SHIELD"]], arcane: ["ARCANE", "#6ee7ff", ["MISSILE", "BEAM", "ORB", "STARS", "BLINK", "TIME"]] };
CH.forEach((c) => { c.cv = spr(MG, c.pal); c.url = c.cv.toDataURL(); });
// ----- 4 loại quái: [bình thường, đóng băng] -----
const mk = (rows, p, q) => [spr(rows, p), spr(rows, q)];
const K = {
  slime: mk(["...gggg...", "..gGGGGg..", ".gGGGGGGg.", ".gGwGGwGg.", ".gGeGGeGg.", "gGGGGGGGGg", "gGGGGGGGGg", ".gggggggg."], { g: "#2f8f4e", G: "#57d37a", w: "#fff", e: "#1b1b3a" }, { g: "#4f9fd8", G: "#bfe8ff", w: "#fff", e: "#2a4a7a" }),
  bat: mk(["b..bbb..b", "bb.bBb.bb", "bbbBeBbbb", ".bbbbbbb.", "..b...b.."], { b: "#6b3fa0", B: "#9a6ad8", e: "#fff" }, { b: "#4f9fd8", B: "#bfe8ff", e: "#2a4a7a" }),
  golem: mk(["..gggggggg..", ".gGGGGGGGGg.", ".gGeGGGGeGg.", ".gGGGGGGGGg.", "gggGGGGGGggg", "gGGgGGGGgGGg", "gGGgGGGGgGGg", ".gggGGGGggg.", "..ggg..ggg..", "..ggg..ggg.."], { g: "#5a5f70", G: "#8b92a8", e: "#ff6b4a" }, { g: "#4f9fd8", G: "#bfe8ff", e: "#2a4a7a" }),
  boss: mk(["..h..........h..", "..hh........hh..", ".rrrrrrrrrrrrrr.", "rRRRRRRRRRRRRRRr", "rRwwRRRRRRRRwwRr", "rRweRRRRRRRRewRr", "rRRRRRRRRRRRRRRr", "rRRrrrrrrrrrrRRr", "rRRrwrwrwrwrwRRr", "rRRRrrrrrrrrRRRr", ".rRRRRRRRRRRRRr.", "..rrRRRRRRRRrr..", "..rrr......rrr..", "..rrr......rrr.."], { r: "#7a1f3a", R: "#c2395f", w: "#fff", e: "#ffd23a", h: "#e8d8b0" }, { r: "#4f9fd8", R: "#bfe8ff", w: "#fff", e: "#2a4a7a", h: "#dff4ff" }),
};
// ----- 5 màn chơi -----
const ST = [
  { n: "FROZEN MEADOW", c: 15, g: ["#16213d", "#1b2a4d", "#121b34", "#24365f"], bat: 0, golem: 0 },
  { n: "EMBER CAVES", c: 20, g: ["#2a1410", "#3a1c14", "#1c0d0a", "#5a2a1c"], bat: 0.3, golem: 0 },
  { n: "STORM PLAINS", c: 25, g: ["#1d2a2a", "#27403a", "#141f1f", "#3a5a50"], bat: 0.3, golem: 0.15 },
  { n: "VOID RUINS", c: 30, g: ["#1f1530", "#2b1d42", "#140d22", "#463066"], bat: 0.3, golem: 0.25 },
  { n: "HOLY SANCTUM", c: 35, g: ["#2a2618", "#3a3422", "#1c1810", "#6a5c34"], bat: 0.3, golem: 0.3 },
  { n: "ARCANE SPIRE", c: 40, g: ["#102a30", "#183c44", "#0a1c20", "#2e6a78"], bat: 0.4, golem: 0.3 },
  { n: "THRONE OF RUIN", c: 1, g: ["#2a0f16", "#3a1620", "#1a080c", "#7a2a3a"], boss: 1 },
];
let G, stage = 0, T = 0, boss = null, cur = 0, party = [], SH = 0, SHFX = null, TS = 0, pk = "";
const C = { h: 0, s: 0, t: 0, w: 0 }, grounds = [], btns = [];
const BH = 150; // máu trùm cuối
let pr, pf, spawned = 0, prog = 0, BL = [], bt = 2; // prog = số màn đã qua (lưu lại)
try { prog = Math.min(ST.length, +localStorage.getItem("fm_prog") || 0); } catch (e) {}
const pct = () => { const s = ST[stage]; return Math.round(100 * Math.max(0, Math.min(1, s.boss ? (boss ? 1 - boss.hp / BH : 0) : G.kills / s.c))); };
let pt, TEAM = [0], START = 0;
function rebuild() {
  if (!pt) return;
  pt.innerHTML = "";
  btns.length = 0;
  party.forEach((p, k) => {
    const b = document.createElement("button");
    b.innerHTML = '<img src="' + CH[p.i].url + '" alt="' + CH[p.i].n + '"><small></small>';
    b.addEventListener("pointerdown", (e) => { e.stopPropagation(); e.preventDefault(); swap(k); });
    ["pointerup", "pointercancel"].forEach((t) => b.addEventListener(t, (e) => e.stopPropagation()));
    pt.appendChild(b); btns.push(b);
  });
}

function banner() { if (G) G.toast("STAGE " + (stage + 1) + ": " + ST[stage].n); }
function clear() {
  const last = stage === ST.length - 1;
  prog = Math.max(prog, stage + 1);
  try { localStorage.setItem("fm_prog", prog); } catch (e) {}
  G.over();
  $("ti").textContent = last ? "VICTORY!" : "STAGE CLEAR!";
  $("sub").textContent = last ? "BOSS DEFEATED!" : "TEAM SLOTS " + Math.min(6, 1 + prog) + "/6";
  $("info").textContent = last ? "Bạn đã hạ trùm cuối, chúc mừng! Bấm nút bên dưới để chơi lại hoặc chọn màn khác." : "Đã mở khóa màn tiếp theo và thêm 1 chỗ trong đội. Bấm nút bên dưới để chọn màn và nhân vật.";
  $("go").textContent = "CONTINUE";
}
function hurtP() {
  const P = G.P;
  if (P.inv > 0) return;
  P.hp--; P.inv = 1.2; G.shake = 5; G.flash = 0.25;
  G.snd(120, 0.3, "sawtooth", 0.08, -60); G.burst(P.x, P.y - 5, 10, ["#ff6b8a", "#fff"], 50, 0.4);
  if (P.hp <= 0 && !Wd.down()) G.over();
}
// trùm: bắn vòng đạn, dưới 50% máu thì nổi giận (nhanh hơn, nhiều đạn hơn)
function bossAI(dt) {
  if (boss.fz > 0) return;
  if (!boss.rg && boss.hp < BH / 2) { boss.rg = 1; boss.sp = 32; G.toast("ENRAGED!"); }
  bt -= dt;
  if (bt > 0) return;
  const rg = boss.rg, n = rg ? 18 : 10, o = Math.random() * 6.283;
  bt = rg ? 1.5 : 2.6;
  for (let i = 0; i < n; i++) { const a = o + (i * 6.283) / n; BL.push({ x: boss.x, y: boss.y - 8, vx: Math.cos(a) * 55, vy: Math.sin(a) * 55, l: 6 }); }
  G.snd(110, 0.3, "sawtooth", 0.06, -40); G.shake = Math.max(G.shake, 2);
}
function bullets(dt) {
  if (TS > 0) return;
  const P = G.P;
  for (const q of BL) {
    q.x += q.vx * dt; q.y += q.vy * dt; q.l -= dt;
    if (Math.hypot(q.x - P.x, q.y - (P.y - 5)) < 5) { q.l = 0; hurtP(); }
  }
  BL = BL.filter((q) => q.l > 0 && q.x > -6 && q.x < 326 && q.y > -6 && q.y < 186);
}
function swap(n) {
  const P = G.P;
  if (G.st !== "play" || n === cur || party[n].hp <= 0 || C.w > 0) return;
  party[cur].hp = P.hp; cur = n; P.chr = n; P.hp = party[n].hp; P.spd = 62 * CH[party[n].i].spd; P.inv = 1; C.w = 1;
  X.fx(arrive, { x: P.x, y: P.y + 6 });
  G.snd(500, 0.2, "triangle", 0.05, 500);
}
function panel() {
  const P = G.P, hp = (i) => (i === cur ? P.hp : party[i].hp), k = cur + "|" + party.map((p, i) => hp(i)).join();
  pt.classList.toggle("hide", G.st !== "play");
  if (k === pk) return;
  pk = k;
  btns.forEach((b, i) => { b.className = "pt" + (i === cur ? " cur" : "") + (hp(i) <= 0 ? " dead" : ""); b.lastChild.textContent = "♥".repeat(Math.max(0, hp(i))); });
}

export const Wd = {
  skills: [
    { k: "9", ic: "✚", nm: "HEAL", elem: "holy", keys: ["v"], cd: () => 20, rem: () => C.h,
      use() { const P = G.P; if (C.h > 0 || G.time < 0.1 || P.hp >= 5) return; C.h = 20; P.hp++; X.fx(heal, { x: P.x, y: P.y }); G.snd(600, 0.4, "sine", 0.06, 600); } },
    { k: "0", ic: "◈", nm: "SHIELD", elem: "holy", keys: ["b"], cd: () => 18, rem: () => C.s,
      use() { const P = G.P; if (C.s > 0 || G.time < 0.1) return; C.s = 18; SH = 4; SHFX = X.fx(shield, { x: P.x, y: P.y + 8 }); G.snd(400, 0.3, "triangle", 0.06, 300); } },
    { k: "T", ic: "⧖", nm: "TIME", elem: "arcane", keys: ["t"], cd: () => 25, rem: () => C.t,
      use() { const P = G.P; if (C.t > 0 || G.time < 0.1) return; C.t = 25; TS = 3; X.fx(tstop, { x: P.x, y: P.y + 6 }); G.flash = 0.5; G.toast("TIME STOP!"); G.snd(200, 1, "sine", 0.08, -100); } },
  ],
  init(g) {
    G = g;
    pt = document.createElement("div"); pt.id = "party"; pt.className = "hide";
    $("stage").appendChild(pt);
    pr = document.createElement("div"); pr.id = "prog"; pr.innerHTML = "<i></i>"; pf = pr.firstChild; $("stage").appendChild(pr);
    rebuild();
    const ro = document.createElement("div");
    ro.id = "roster";
    ro.innerHTML = CH.map((c) => '<div><img src="' + c.url + '" alt=""><small>' + c.n + "</small></div>").join("");
    $("screen").insertBefore(ro, $("go"));
    addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      if (G.st === "play") for (let i = 1; i < party.length; i++) { const n = (cur + i) % party.length; if (party[n].hp > 0) { swap(n); break; } }
    });
    banner();
  },
  reset() { party = TEAM.map((i) => ({ i, hp: CH[i].hp })); cur = 0; stage = START; spawned = 0; BL = []; bt = 2; T = 0; boss = null; SH = 0; TS = 0; SHFX = null; for (const k in C) C[k] = 0; pk = ""; rebuild(); banner(); },
  tick(dt) { if (pf) { pf.style.width = pct() + "%"; pr.classList.toggle("hide", G.st !== "play"); } for (const k in C) C[k] = Math.max(0, C[k] - dt); if (G && G.P && pt) panel(); },
  logic(dt) {
    const P = G.P;
    if (P.chr === undefined) { P.chr = cur; P.hp = party[cur].hp; P.spd = 62 * CH[party[cur].i].spd; }
    T += dt;
    if (SH > 0) {
      SH -= dt; P.inv = Math.max(P.inv, 0.1);
      if (SHFX) { SHFX.options.x = P.x; SHFX.options.y = P.y + 8; }
      if (SH <= 0 && SHFX) { SHFX.stop(); SHFX = null; }
    }
    if (TS > 0) { TS -= dt; for (const e of G.E) if (!e.die) e.fz = Math.max(e.fz, 0.25); }
    const s = ST[stage];
    if (s.boss) {
      if (!boss) { boss = { x: 160, y: -12, hp: BH, fz: 0, kx: 0, ky: 0, sp: 20, ph: 0, kind: "boss" }; G.E.push(boss); G.toast("BOSS!"); }
      else if (!G.E.includes(boss)) clear();
      else bossAI(dt);
    } else if (G.kills >= s.c) clear();
    bullets(dt);
  },
  // quái xuất hiện theo màn
  spawn() {
    const s = ST[stage];
    if (s.boss || spawned >= s.c) return;
    spawned++;
    const z = Math.min(stage, 5), r = Math.random(), k = r < s.bat ? "bat" : r < s.bat + s.golem ? "golem" : "slime", sd = (Math.random() * 4) | 0;
    let x, y;
    if (sd < 2) { x = sd ? 328 : -8; y = 10 + Math.random() * 170; } else { y = sd === 2 ? -8 : 188; x = Math.random() * 320; }
    const hp = { slime: 1 + (z >> 1), bat: 1, golem: 3 + (z >> 1) }[k], sp = { slime: 16 + z * 4, bat: 34 + z * 4, golem: 10 + z * 2 }[k];
    G.E.push({ x, y, hp, fz: 0, kx: 0, ky: 0, sp, ph: Math.random() * 6, kind: k });
  },
  spr: (e) => K[e.kind || "slime"][e.fz > 0 ? 1 : 0],
  sprite: () => CH[party[cur].i].cv,
  shield: () => SH > 0,
  // mỗi nhân vật chỉ dùng chiêu cùng thuộc tính (chiêu không có elem như SLASH thì ai cũng dùng được)
  can: (s) => { const p = party[cur]; return !s.elem || !p || s.elem === CH[p.i].el; },
  // màn chọn nhân vật (1-3) rồi chọn màn chơi, xong gọi cb()
  select(cb) {
    let el = $("sel");
    if (!el) { el = document.createElement("div"); el.id = "sel"; $("stage").appendChild(el); }
    el.classList.remove("hide");
    let pick = new Set(TEAM), cap = 1;
    const maps = () => {
      el.innerHTML = "<h2>SELECT STAGE</h2><div class='grid'>" + ST.map((s, i) => "<button class='card' " + (i > prog ? "disabled " : "") + "data-s='" + i + "' style='--c:" + s.g[3] + ";background:" + s.g[0] + "'><b>" + (i + 1) + "</b><small>" + s.n + "</small><small>" + (i > prog ? "LOCKED" : i < prog ? "CLEARED" : "NEW") + "</small><small>" + (s.boss ? "BOSS" : s.c + " MOBS") + "</small></button>").join("") + "</div><p>Qua mỗi màn được thêm 1 chỗ trong đội (hiện tại " + Math.min(6, 1 + prog) + "/6). Màn cuối được dùng cả 6 nhân vật.</p>";
    };
    const chars = () => {
      el.innerHTML = "<h2>SELECT HERO (" + pick.size + "/" + cap + ")</h2><div class='grid'>" + CH.map((c, i) => { const [n, col, ks] = EL[c.el]; return "<button class='card" + (pick.has(i) ? " on" : "") + "' data-i='" + i + "' style='--c:" + col + "'><img src='" + c.url + "'><b>" + c.n + "</b><small>" + n + "</small><span>" + ks.map((k) => "<img src='" + ICON[k] + "'>").join("") + "</span></button>"; }).join("") + "</div><div class='row'><button class='ok' data-back='1'>◀ BACK</button><button class='ok' data-go='1'>START ▶</button></div>";
    };
    el.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      const d = b.dataset, last = ST.length - 1;
      if (d.s !== undefined) { START = +d.s; cap = START === last ? 6 : Math.min(6, 1 + prog); pick = new Set(START === last ? CH.map((c, i) => i) : [...pick].slice(0, cap)); chars(); }
      else if (d.i !== undefined) { const i = +d.i; if (pick.has(i)) { if (pick.size > 1) pick.delete(i); } else if (pick.size < cap) pick.add(i); chars(); }
      else if (d.back) maps();
      else if (d.go) { TEAM = [...pick]; el.classList.add("hide"); cb(); }
    };
    maps();
  },
  front(g) { for (const q of BL) { g.fillStyle = "#ff4a2a"; g.fillRect(Math.round(q.x) - 1, Math.round(q.y) - 1, 3, 3); g.fillStyle = "#ffe26b"; g.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); } },
  down() {
    party[cur].hp = 0;
    for (let i = 1; i < party.length; i++) { const n = (cur + i) % party.length; if (party[n].hp > 0) { C.w = 0; swap(n); G.toast(CH[party[n].i].n + " STEPS IN!"); return true; } }
    return false;
  },
  label: () => "STAGE " + (stage + 1) + "/" + ST.length + " " + ST[stage].n + (G ? " " + pct() + "%" : ""),
  ground() {
    let c = grounds[stage];
    if (!c) {
      const [a, b, d, k] = ST[stage].g, r = (n) => (Math.random() * n) | 0;
      c = grounds[stage] = document.createElement("canvas"); c.width = 320; c.height = 180;
      const x = c.getContext("2d");
      x.fillStyle = a; x.fillRect(0, 0, 320, 180);
      for (let i = 0; i < 1400; i++) { x.fillStyle = Math.random() < 0.5 ? b : d; x.fillRect(r(320), r(180), 1 + r(2), 1); }
      for (let i = 0; i < 26; i++) { const px = r(320), py = r(180); x.fillStyle = k; x.fillRect(px, py, 3, 2); x.fillStyle = b; x.fillRect(px, py, 3, 1); }
    }
    return c;
  },
};
