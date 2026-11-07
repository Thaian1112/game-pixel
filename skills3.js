// ===== 18 chiêu tấn công mới: mỗi hệ đủ 4 chiêu (dùng hiệu ứng thật của pixelfx) =====
import { X } from "./skills2.js";
import * as ring from "./vendor/pixelfx/src/fx/fire/fire-ring.js";
import * as meteor from "./vendor/pixelfx/src/fx/fire/meteor.js";
import * as fpillar from "./vendor/pixelfx/src/fx/fire/flame-pillar.js";
import * as strike from "./vendor/pixelfx/src/fx/lightning/lightning-strike.js";
import * as clap from "./vendor/pixelfx/src/fx/lightning/thunderclap.js";
import * as ball from "./vendor/pixelfx/src/fx/lightning/ball-lightning.js";
import * as dexp from "./vendor/pixelfx/src/fx/shadow/dark-explosion.js";
import * as tend from "./vendor/pixelfx/src/fx/shadow/shadow-tendrils.js";
import * as steal from "./vendor/pixelfx/src/fx/shadow/life-steal.js";
import * as smite from "./vendor/pixelfx/src/fx/holy/smite.js";
import * as hpillar from "./vendor/pixelfx/src/fx/holy/holy-pillar.js";
import * as sun from "./vendor/pixelfx/src/fx/holy/sunburst.js";
import * as feather from "./vendor/pixelfx/src/fx/holy/feather-burst.js";
import * as missile from "./vendor/pixelfx/src/fx/arcane/arcane-missiles.js";
import * as beam from "./vendor/pixelfx/src/fx/arcane/arcane-beam.js";
import * as orb from "./vendor/pixelfx/src/fx/arcane/arcane-orb.js";
import * as stars from "./vendor/pixelfx/src/fx/arcane/star-fall.js";

let G, Q = [], PR = [], CD = {};
const FC = ["#ff8a2a", "#ffe26b", "#fff"], BC = ["#4c7bff", "#fff", "#ffe14d"], VC = ["#a35bff", "#6a3aa8", "#fff"], HC = ["#ffd23a", "#fff", "#fff7c0"], AC = ["#6ee7ff", "#fff", "#a35bff"], IC4 = ["#fff", "#bfe8ff", "#8fd8ff", "#5aa9e6"];
const alive = () => G.E.filter((e) => !e.die);
const near = (x, y, r = 1e9, n = 1) => alive().map((e) => ({ e, d: Math.hypot(e.x - x, e.y - 4 - y) })).filter((o) => o.d < r).sort((a, b) => a.d - b.d).slice(0, n).map((o) => o.e);
const within = (x, y, r) => near(x, y, r, 99);
const later = (t, f) => Q.push({ t, f });
function hit(list, n, fz = 0.5, col = HC) {
  for (const e of list) {
    if (e.die) continue;
    e.hp -= n; e.fz = Math.max(e.fz, fz);
    X.num(e.x, e.y - 10, "-" + n); G.burst(e.x, e.y - 4, 5, col, 50, 0.4);
    if (e.hp <= 0) { e.die = 1; e.fz = 0.2; }
  }
}
const boom = (s = 4, f = 0.2) => { G.shake = Math.max(G.shake, s); G.flash = f; };
const tgt = () => { const P = G.P, b = near(P.x, P.y - 4)[0]; return b ? { x: b.x, y: b.y } : { x: G.cl(P.x + P.face * 50, 20, 300), y: P.y }; };
const aim = (t) => { const P = G.P, a = Math.atan2(t.y - 4 - (P.y - 8), t.x - P.x); P.face = Math.cos(a) >= 0 ? 1 : -1; return a; };
function proj(mod, a, sp, life, r, f, dy = 0, ice = 0) {
  const P = G.P, x = P.x, y = P.y - 8;
  PR.push({ x, y, a, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: life, r, f, ice, dy, h: new Set(), fx: mod ? X.fx(mod, { x, y: y + dy, angle: a }) : null });
}
const mk = (nm, elem, cd, use) => ({
  k: "", ic: "", nm, elem, keys: [], cd: () => cd, rem: () => CD[nm] || 0,
  use() { if ((CD[nm] || 0) > 0 || G.time < 0.1) return; if (use() === false) return; CD[nm] = cd; },
});

export const Y = {
  skills: [
    // ----- BĂNG -----
    mk("ICICLE", "ice", 3, () => { const a = aim(tgt()); for (let i = -2; i <= 2; i++) { const b = a + i * 0.22, P = G.P; PR.push({ x: P.x, y: P.y - 8, a: b, vx: Math.cos(b) * 190, vy: Math.sin(b) * 190, l: 0.9, r: 7, ice: 1, dy: 0, h: new Set(), f: (e) => hit([e], 2, 1.8, IC4) }); } G.snd(900, 0.15, "sawtooth", 0.04, -500); }),
    // ----- LỬA -----
    mk("RING", "fire", 6, () => { const x = G.P.x, y = G.P.y; X.fx(ring, { x, y: y + 4, reach: 46 }); for (const t of [0.45, 0.9, 1.4]) later(t, () => hit(within(x, y, 48), 1, 0.6, FC)); boom(3, 0.2); G.snd(120, 0.5, "sawtooth", 0.07, 200); }),
    mk("METEOR", "fire", 9, () => { const t = tgt(); X.fx(meteor, { x: t.x, y: t.y + 6 }); later(0.62, () => { hit(within(t.x, t.y, 30), 4, 1, FC); boom(6, 0.3); G.snd(60, 0.6, "sawtooth", 0.09, -30); }); }),
    mk("FLAME", "fire", 7, () => { const t = tgt(); X.fx(fpillar, { x: t.x, y: t.y + 4, height: 80 }); later(0.55, () => { hit(within(t.x, t.y, 22), 2, 1, FC); boom(4); }); later(1.2, () => hit(within(t.x, t.y, 22), 1, 0.6, FC)); later(1.9, () => hit(within(t.x, t.y, 22), 1, 0.6, FC)); G.snd(100, 0.6, "sawtooth", 0.07, 300); }),
    // ----- SÉT -----
    mk("STRIKE", "bolt", 5, () => { const l = near(G.P.x, G.P.y, 1e9, 3); if (!l.length) return false; for (const e of l) { const x = e.x, y = e.y; X.fx(strike, { x, y: y + 2 }); later(0.85, () => { hit(within(x, y, 16), 3, 1, BC); boom(4, 0.25); G.snd(70, 0.3, "sawtooth", 0.08, 600); }); } }),
    mk("CLAP", "bolt", 4, () => { const x = G.P.x, y = G.P.y; X.fx(clap, { x, y: y + 4, reach: 50 }); later(0.15, () => { hit(within(x, y, 52), 2, 1.2, BC); boom(5, 0.3); }); G.snd(60, 0.4, "square", 0.08, 400); }),
    mk("BALL", "bolt", 5, () => { proj(ball, aim(tgt()), 95, 2.2, 10, (e) => hit([e], 2, 1, BC)); G.snd(400, 0.3, "square", 0.05, 600); }),
    // ----- HƯ KHÔNG -----
    mk("BLAST", "void", 10, () => { const t = tgt(); X.fx(dexp, { x: t.x, y: t.y + 4 }); later(1.8, () => { hit(within(t.x, t.y, 36), 5, 1, VC); boom(6, 0.3); G.snd(60, 0.6, "sine", 0.09, -30); }); G.snd(70, 1, "sine", 0.06, -20); }),
    mk("TENDRIL", "void", 9, () => { const t = tgt(); X.fx(tend, { x: t.x, y: t.y + 2 }); for (let k = 1; k <= 4; k++) later(0.4 + k * 0.5, () => { const l = within(t.x, t.y, 32); for (const e of l) e.fz = Math.max(e.fz, 0.7); hit(l, 1, 0.7, VC); }); G.snd(90, 0.5, "sine", 0.06, 100); }),
    mk("DRAIN", "void", 8, () => { const l = near(G.P.x, G.P.y - 4, 110, 3); if (!l.length) return false; const a = aim({ x: l[0].x, y: l[0].y }); X.fx(steal, { x: G.P.x, y: G.P.y + 8, angle: a }); later(1, () => { hit(l, 2, 0.6, VC); const P = G.P; if (P.hp < 5) { P.hp++; X.num(P.x, P.y - 14, "+1"); } }); G.snd(200, 0.5, "triangle", 0.06, -100); }),
    // ----- THÁNH -----
    mk("SMITE", "holy", 3, () => { const t = near(G.P.x, G.P.y)[0]; if (!t) return false; const x = t.x, y = t.y; X.fx(smite, { x, y: y + 2 }); later(0.54, () => { hit(within(x, y, 14), 4, 1, HC); boom(4, 0.25); G.snd(150, 0.3, "square", 0.07, -80); }); }),
    mk("LIGHT", "holy", 8, () => { const t = tgt(); X.fx(hpillar, { x: t.x, y: t.y + 2 }); for (let k = 0; k < 4; k++) later(0.66 + k * 0.6, () => hit(within(t.x, t.y, 28), 1, 0.6, HC)); G.snd(500, 0.6, "sine", 0.06, 400); }),
    mk("SUN", "holy", 6, () => { const x = G.P.x, y = G.P.y, f = X.fx(sun, { x, y: y - 10 }); later(1.3, () => f.stop()); later(0.2, () => hit(within(x, y, 52), 2, 1, HC)); later(0.8, () => hit(within(x, y, 52), 2, 1, HC)); boom(2, 0.3); G.snd(600, 0.5, "sine", 0.06, 500); }),
    mk("FEATHER", "holy", 4, () => { const x = G.P.x, y = G.P.y; X.fx(feather, { x, y: y - 6 }); later(0.25, () => hit(within(x, y, 38), 2, 1.2, HC)); G.snd(800, 0.2, "triangle", 0.05, 400); }),
    // ----- HUYỀN BÍ -----
    mk("MISSILE", "arcane", 3, () => { const l = near(G.P.x, G.P.y, 170, 5); if (!l.length) return false; const a = aim({ x: l[0].x, y: l[0].y }); X.fx(missile, { x: G.P.x, y: G.P.y + 8, angle: a }); later(0.9, () => { const m = l.filter((e) => !e.die); if (m.length) for (let i = 0; i < 5; i++) hit([m[i % m.length]], 1, 0.5, AC); }); G.snd(700, 0.3, "triangle", 0.05, 500); }),
    mk("BEAM", "arcane", 6, () => {
      const P = G.P, x = P.x, y = P.y, a = aim(tgt()), f = X.fx(beam, { x, y: y + 8, angle: a });
      later(1.3, () => f.stop());
      for (let k = 1; k <= 6; k++) later(0.15 + k * 0.2, () => hit(alive().filter((e) => { const dx = e.x - x, dy = e.y - 4 - (y - 8); return dx * Math.cos(a) + dy * Math.sin(a) > 0 && Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)) < 9; }), 1, 0.4, AC));
      G.snd(300, 1, "sawtooth", 0.05, 300);
    }),
    mk("ORB", "arcane", 5, () => { proj(orb, aim(tgt()), 60, 3.2, 13, (e) => hit([e], 3, 1, AC), 28); G.snd(350, 0.4, "sine", 0.05, 300); }),
    mk("STARS", "arcane", 8, () => { const t = tgt(); X.fx(stars, { x: t.x, y: t.y + 4 }); for (const d of [0.5, 1, 1.5]) later(d, () => hit(within(t.x, t.y, 40), 2, 0.7, AC)); G.snd(900, 0.6, "triangle", 0.05, -400); }),
  ],
  init(g) { G = g; },
  reset() { Q = []; PR = []; CD = {}; },
  tick(dt) { for (const k in CD) CD[k] = Math.max(0, CD[k] - dt); },
  logic(dt) {
    for (const q of Q) q.t -= dt;
    const due = Q.filter((q) => q.t <= 0);
    Q = Q.filter((q) => q.t > 0);
    for (const q of due) q.f();
    for (const q of PR) {
      q.x += q.vx * dt; q.y += q.vy * dt; q.l -= dt;
      if (q.fx) { q.fx.options.x = q.x; q.fx.options.y = q.y + q.dy; }
      for (const e of alive()) if (!q.h.has(e) && Math.hypot(e.x - q.x, e.y - 4 - q.y) < q.r) { q.h.add(e); q.f(e); }
      if (q.ice) G.burst(q.x, q.y, 1, IC4, 10, 0.25);
    }
    const out = (q) => q.l <= 0 || q.x < -10 || q.x > 330 || q.y < -10 || q.y > 190;
    for (const q of PR) if (out(q) && q.fx) q.fx.stop();
    PR = PR.filter((q) => !out(q));
  },
  front(g) {
    for (const q of PR) if (q.ice) for (let i = 0; i < 7; i++) { g.fillStyle = i < 2 ? "#fff" : i < 4 ? "#bfe8ff" : "#5aa9e6"; g.fillRect(Math.round(q.x - Math.cos(q.a) * i * 1.5), Math.round(q.y - Math.sin(q.a) * i * 1.5), i < 3 ? 2 : 1, i < 3 ? 2 : 1); }
  },
};
