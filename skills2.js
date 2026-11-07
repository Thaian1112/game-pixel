// ===== Chiêu thức dùng hiệu ứng THẬT của pixelfx: Cầu lửa, Sét lan, Hố đen + số sát thương + tuyết =====
import { createFrame, clearFrame, createFx, composite } from "./vendor/pixelfx/src/core/index.js";
import * as fireball from "./vendor/pixelfx/src/fx/fire/fireball.js";
import * as boom from "./vendor/pixelfx/src/fx/explosions/small-explosion.js";
import * as zap from "./vendor/pixelfx/src/fx/lightning/zap-hit.js";
import * as hole from "./vendor/pixelfx/src/fx/shadow/black-hole.js";
import * as dmg from "./vendor/pixelfx/src/fx/ui/damage-number.js";
import * as snow from "./vendor/pixelfx/src/fx/weather/snow.js";

const W = 320, H = 180;
const frame = createFrame(W, H), img = new ImageData(W, H);
const off = document.createElement("canvas");
off.width = W; off.height = H;
const oc = off.getContext("2d");
let G, live = [], SNOW = null, BALLS = [], BOLTS = [], HOLE = null;
const CD = { f: 0, c: 0, h: 0 };
const seed = () => (Math.random() * 99) | 0;

const spawn = (m, o) => { const f = createFx(m, { seed: seed(), ...o }); live.push(f); return f; };
const num = (x, y, t) => spawn(dmg, { x, y, text: t });
// vẽ mọi hiệu ứng pixelfx của một lớp ("back" sau nhân vật, "front" trước nhân vật) rồi dán lên canvas game
function pass(g, layer) {
  clearFrame(frame);
  for (const f of live) f.draw(frame, layer);
  composite(frame, img.data, null);
  oc.putImageData(img, 0, 0);
  g.drawImage(off, 0, 0);
}
const near = (x, y, r = 1e9, skip = []) => {
  let b = null, bd = r;
  for (const e of G.E) {
    if (e.die || skip.includes(e)) continue;
    const d = Math.hypot(e.x - x, e.y - 4 - y);
    if (d < bd) { bd = d; b = e; }
  }
  return b;
};
const hurt = (e, n, fz) => {
  e.hp -= n; e.fz = Math.max(e.fz, fz);
  if (e.hp <= 0 && !e.die) { e.die = 1; e.fz = 0.2; }
};

// ----- Cầu lửa (fire/fireball + explosions/small-explosion) -----
function useFire() {
  const P = G.P;
  if (CD.f > 0 || G.time < 0.1) return;
  const b = near(P.x, P.y - 6);
  const a = b ? Math.atan2(b.y - 4 - (P.y - 8), b.x - P.x) : P.face > 0 ? 0 : Math.PI;
  P.face = Math.cos(a) >= 0 ? 1 : -1;
  CD.f = 2.2;
  const x = P.x, y = P.y - 8;
  BALLS.push({ x, y, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, l: 2.2, fx: spawn(fireball, { x, y, angle: a }) });
  G.snd(300, 0.3, "sawtooth", 0.06, 500);
}
// ----- Sét lan (lightning/zap-hit + tia sét vẽ bằng pixel) -----
function useChain() {
  const P = G.P;
  if (CD.c > 0 || G.time < 0.1) return;
  let cur = near(P.x, P.y - 4, 90);
  if (!cur) return;
  CD.c = 2.5;
  P.face = cur.x >= P.x ? 1 : -1;
  const hit = [], pts = [{ x: P.x + P.face * 8, y: P.y - 12 }];
  while (cur && hit.length < 5) { hit.push(cur); pts.push({ x: cur.x, y: cur.y - 4 }); cur = near(cur.x, cur.y, 55, hit); }
  hit.forEach((e, i) => { hurt(e, 1 + (e.fz > 0 ? 1 : 0), 0.7); num(e.x, e.y - 10, "-1"); spawn(zap, { x: e.x, y: e.y }); });
  BOLTS.push({ pts, l: 0.3 });
  G.stop = Math.max(G.stop, 0.08); G.shake = Math.max(G.shake, 3); G.flash = 0.25;
  G.snd(80, 0.25, "sawtooth", 0.08, 800);
}
// ----- Hố đen (shadow/black-hole): hút quái vào tâm và nghiền nát -----
const HOLE_DY = 78; // tâm hố đen nằm cao hơn gốc hiệu ứng 78 pixel
function useHole() {
  const P = G.P;
  if (CD.h > 0 || G.time < 0.1) return;
  const b = near(P.x, P.y), cx = G.cl(b ? b.x : P.x + P.face * 60, 50, W - 50), cy = G.cl(b ? b.y : P.y, 40, H - 70);
  CD.h = 16;
  HOLE = { x: cx, y: cy, t: 3.6, tk: 0, fx: spawn(hole, { x: cx, y: cy + HOLE_DY }) };
  G.flash = 0.3; G.toast("VOID!"); G.snd(70, 1, "sine", 0.08, -30);
}

function bolt(g, a, b, al) {
  const n = Math.max(3, (Math.hypot(b.x - a.x, b.y - a.y) / 6) | 0), P = [a];
  for (let i = 1; i < n; i++) { const k = i / n; P.push({ x: a.x + (b.x - a.x) * k + G.R(-4, 4), y: a.y + (b.y - a.y) * k + G.R(-4, 4) }); }
  P.push(b);
  g.globalAlpha = al;
  for (const [col, s, o] of [["#4c7bff", 3, 1], ["#ffffff", 1, 0]])
    for (let i = 1; i < P.length; i++) {
      const m = Math.max(Math.abs(P[i].x - P[i - 1].x), Math.abs(P[i].y - P[i - 1].y)) | 0;
      g.fillStyle = col;
      for (let j = 0; j <= m; j++) { const k = m ? j / m : 0; g.fillRect(Math.round(P[i - 1].x + (P[i].x - P[i - 1].x) * k) - o, Math.round(P[i - 1].y + (P[i].y - P[i - 1].y) * k) - o, s, s); }
    }
  g.globalAlpha = 1;
}

export const X = {
  fx: spawn, num,
  skills: [
    { k: "6", ic: "✺", nm: "FIRE", elem: "fire", keys: ["z"], cd: () => 2.2, rem: () => CD.f, use: useFire },
    { k: "7", ic: "ϟ", nm: "BOLT", elem: "bolt", keys: ["x"], cd: () => 2.5, rem: () => CD.c, use: useChain },
    { k: "8", ic: "◉", nm: "VOID", elem: "void", keys: ["c"], cd: () => 16, rem: () => CD.h, use: useHole },
  ],
  init(g) { G = g; SNOW = spawn(snow, { x: 160, y: 170 }); },
  reset() { BALLS = []; BOLTS = []; HOLE = null; CD.f = CD.c = CD.h = 0; live = live.filter((f) => f === SNOW); },
  // chạy mỗi khung hình, kể cả ở menu: cập nhật hiệu ứng và hồi chiêu
  tick(dt) {
    for (const f of live) f.update(dt);
    live = live.filter((f) => !f.done());
    for (const k in CD) CD[k] = Math.max(0, CD[k] - dt);
    for (const b of BOLTS) b.l -= dt;
    BOLTS = BOLTS.filter((b) => b.l > 0);
  },
  // chạy khi đang chơi (không chạy trong lúc hit-stop)
  logic(dt) {
    for (const q of BALLS) {
      q.x += q.vx * dt; q.y += q.vy * dt; q.l -= dt;
      q.fx.options.x = q.x; q.fx.options.y = q.y;
      const e = G.E.find((e) => !e.die && Math.hypot(e.x - q.x, e.y - 4 - q.y) < 8);
      if (e || q.l <= 0 || q.x < -10 || q.x > W + 10 || q.y < -10 || q.y > H + 10) {
        q.dead = 1; q.fx.stop();
        if (e || q.l > 0) {
          spawn(boom, { x: q.x, y: q.y + 8 });
          G.shake = Math.max(G.shake, 5); G.flash = 0.3; G.stop = Math.max(G.stop, 0.08); G.snd(90, 0.5, "sawtooth", 0.08, -40);
          for (const t of G.E) if (!t.die && Math.hypot(t.x - q.x, t.y - 4 - q.y) < 24) { hurt(t, 2, 0.5); num(t.x, t.y - 8, "-2"); G.burst(t.x, t.y - 4, 6, ["#ff8a2a", "#ffe26b", "#fff"], 60, 0.4); }
        }
      }
    }
    BALLS = BALLS.filter((q) => !q.dead);
    if (HOLE) {
      const h = HOLE, cy = h.y;
      h.t -= dt; h.tk -= dt;
      for (const e of G.E) {
        const d = Math.hypot(e.x - h.x, e.y - cy);
        if (e.die || d > 70) continue;
        const k = Math.min(1, 60 / (d + 10));
        e.x += ((h.x - e.x) / (d || 1)) * 45 * k * dt; e.y += ((cy - e.y) / (d || 1)) * 45 * k * dt;
        if (d < 14 && h.tk <= 0) { hurt(e, 1, 0.3); num(e.x, e.y - 8, "-1"); }
      }
      if (h.tk <= 0) h.tk = 0.5;
      if (h.t <= 0) { h.fx.stop(); HOLE = null; }
    }
  },
  back(g) { pass(g, "back"); },
  front(g) {
    pass(g, "front");
    for (const b of BOLTS) for (let i = 1; i < b.pts.length; i++) bolt(g, b.pts[i - 1], b.pts[i], b.l / 0.3);
  },
};
