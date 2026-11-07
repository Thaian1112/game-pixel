// ===== Hình pixel 10x10 cho từng chiêu (hiện trên nút chiêu và màn chọn nhân vật) =====
const PAL = { w: "#fff", a: "#bfe8ff", b: "#5aa9e6", o: "#ff8a2a", y: "#ffe14d", g: "#ffd23a", p: "#a35bff", d: "#4a2a7a", n: "#07030f", k: "#8a5a2b", c: "#6ee7ff", r: "#ff4a2a", e: "#8a1f17" };
const D = {
  NOVA: ["....aa....", "..a.aa.a..", "...wwww...", ".awb..bwa.", "aab....baa", "aab....baa", ".awb..bwa.", "...wwww...", "..a.aa.a..", "....aa...."],
  SLASH: ["........ww", ".......www", "......ww..", ".....ww...", "a...ww....", ".a.ww.....", "..aw......", ".kka......", "kk........", "k........."],
  LANCE: ["..........", "..........", "......w...", ".......ww.", "aabbbbbbww", "aabbbbbbww", ".......w..", "......w...", "..........", ".........."],
  BLINK: ["....ww....", "....ww....", "....aa....", "....aa....", "wwaaaaaaww", "wwaaaaaaww", "....aa....", "....aa....", "....ww....", "....ww...."],
  BLIZZ: ["w...aa...w", ".w..aa..w.", "..w.aa.w..", "...waaw...", "aaaaaaaaaa", "aaaaaaaaaa", "...waaw...", "..w.aa.w..", ".w..aa..w.", "w...aa...w"],
  FIRE: [".....o....", "....oo....", "...ooo.o..", "..oooooo..", "..ooyyoo..", ".oooyyooo.", ".ooyyyyoo.", ".ooyywyoo.", "..ooyyoo..", "...oooo..."],
  BOLT: ["....yyyy..", "...yyyy...", "..yyyy....", ".yyyyyyy..", "...yyyy...", "..yyy.....", "..yy......", ".yy.......", ".y........", "y........."],
  VOID: ["...pppp...", "..pddddp..", ".pddnnddp.", "pddnnnnddp", "pdnnnnnndp", "pdnnnnnndp", "pddnnnnddp", ".pddnnddp.", "..pddddp..", "...pppp..."],
  HEAL: ["...gggg...", "...gwwg...", "...gwwg...", "ggggwwgggg", "gwwwwwwwwg", "gwwwwwwwwg", "ggggwwgggg", "...gwwg...", "...gwwg...", "...gggg..."],
  SHIELD: ["gggggggggg", "gwwwwwwwwg", "gwaaaaaawg", "gwaaaaaawg", "gwaaaaaawg", ".gwaaaawg.", ".gwaaaawg.", "..gwaawg..", "...gwwg...", "....gg...."],
  TIME: ["cccccccccc", ".cwwwwwwc.", "..cwwwwc..", "...cwwc...", "....cc....", "....cc....", "...cbbc...", "..cbbbbc..", ".cbbbbbbc.", "cccccccccc"],
  ICICLE: ["........aw", ".......aaw", "......aab.", ".....aab..", "....aab...", "...aab....", "..aab.....", ".aab......", "abb.......", "b........."],
  RING: ["..o.oo.o..", ".o......o.", "o..oooo..o", "o.o....o.o", "o..yyyy..o", "o..yyyy..o", "o.o....o.o", "o..oooo..o", ".o......o.", "..o.oo.o.."],
  METEOR: ["o.........", ".oo.......", "..oo......", "...oo.kkk.", "....okkkkk", "...yykkkkk", "..yywkkkk.", "...yykkk..", "....kk....", ".........."],
  FLAME: ["....oo....", "...oyyo...", "...oyyo...", "..ooyyoo..", "..ooyyoo..", "..ooyyoo..", ".oooyyooo.", ".oooyyooo.", "oooooooooo", "kkkkkkkkkk"],
  STRIKE: ["aaaaaaaa..", "aaaaaaaaaa", ".aaaaaaaa.", "....yy....", "...yy.....", "..yyyy....", "....yy....", "...yy.....", "..y.......", "..y......."],
  CLAP: ["..y....y..", "...y..y...", "yy.y..y.yy", "..yyyyyy..", "yyyywwyyyy", "yyyywwyyyy", "..yyyyyy..", "yy.y..y.yy", "...y..y...", "..y....y.."],
  BALL: ["...cccc...", "..cwwwwc..", ".cwyyyywc.", "cwyywwyywc", "cwywwwwywc", "cwywwwwywc", "cwyywwyywc", ".cwyyyywc.", "..cwwwwc..", "...cccc..."],
  BLAST: ["p...pp...p", ".p..dd..p.", "..pddddp..", "p.dnnnnd.p", "pddnnnnddp", "pddnnnnddp", "p.dnnnnd.p", "..pddddp..", ".p..dd..p.", "p...pp...p"],
  TENDRIL: [".p...p...p", "p.p.p.p.p.", "dp..dp..dp", ".dp.dp.dp.", ".dp.dp.dp.", "..dpdpdp..", "..dddddd..", "nnnnnnnnnn", "nnnnnnnnnn", ".nnnnnnnn."],
  DRAIN: [".rr....rr.", "rrrr..rrrr", "rwrrrrrrrr", "rrrrrrrrrr", "rrrrrrrrrr", ".rrrrrrrr.", "..rrrrrr..", "...rrrr...", "....rr....", ".........."],
  SMITE: ["....gg....", "...gwwg...", "...gwwg...", "...gwwg...", "...gwwg...", "..gwwwwg..", ".gwwwwwwg.", "gg.gwwg.gg", "....gg....", "gggggggggg"],
  LIGHT: ["g...gg...g", ".g..gg..g.", "..g.gg.g..", "...gwwg...", "...gwwg...", "..gwwwwg..", "..gwwwwg..", ".gwwwwwwg.", "gwwwwwwwwg", "gggggggggg"],
  SUN: ["g...yy...g", ".g..yy..g.", "..g.yy.g..", "...gwwg...", "yyyywwwyyy", "yyyywwwyyy", "...gwwg...", "..g.yy.g..", ".g..yy..g.", "g...yy...g"],
  FEATHER: ["......ww..", ".....wwwa.", "....wwwaa.", "...wwwaa..", "..wwwaa...", ".wwwaa....", "wwaa......", "waa.......", "k.........", "k........."],
  MISSILE: ["......ccw.", "....ccp...", "..ccp.....", "cc........", "..........", ".......ccw", "....ccp...", "..ccp.....", "cc........", ".........."],
  BEAM: ["..........", "..........", "pppppppppp", "cccccccccc", "wwwwwwwwww", "wwwwwwwwww", "cccccccccc", "pppppppppp", "..........", ".........."],
  ORB: ["...pppp...", "..pccccp..", ".pcwwcccp.", "pcwwcccccp", "pcwcccccbp", "pcccccccbp", "pcccccccbp", ".pccccccp.", "..pbbbbp..", "...pppp..."],
  STARS: ["w...w.....", ".w.w......", "..w...w...", ".c.w.w....", "c....c.w..", "..w.......", "...c..w...", ".w...c....", "..c.....w.", "....c....."],
};
export const ICON = {};
for (const k in D) {
  const c = document.createElement("canvas");
  c.width = c.height = 10;
  const x = c.getContext("2d");
  D[k].forEach((r, j) => [...r].forEach((ch, i) => { if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i, j, 1, 1); } }));
  ICON[k] = c.toDataURL();
}
