// しまう袋の出し入れ
'use strict';

// ===== しまう袋 =====
let bagObj = null;
function openBag(o) { bagObj = o; invpop.hidden = false; drawBag(); }
function drawBag(msg) { const o = bagObj; invpop.dataset.mode = 'bag';
  const can = P.inv.map((x, i) => [x, i]).filter(([x]) => x !== o && !ITEMS[x.k].bag && !x.eq && !x.unpaid);
  invpop.innerHTML = (msg ? `<div class="shopmsg">${msg}</div>` : '') + `<div><b style="color:#ffd23f">${itemName(o)}</b>　<button data-close="1">とじる</button></div>`
    + `<div class="help">中に 入っている物（名前で とりだす・「使う」で その場で 使う）${o.items.length ? ' <button data-outall="1">ぜんぶ 出す</button>' : ''}</div>` + (o.items.length ? o.items.map((x, j) => `<span class="it"><button data-out="${j}">${nameHtml(x)}</button>${ITEMS[x.k].equip ? '' : `<button class="s" data-use="${j}">使う</button>`}</span>`).join('') : '<span class="help">からっぽ</span>')
    + `<div class="help" style="margin-top:6px">もちものから しまう（あと ${o.cap - o.items.length}こ）${can.length && o.items.length < o.cap ? ' <button data-inall="1">入るだけ しまう</button>' : ''}</div>` + (can.length ? can.map(([x, i]) => `<button data-in="${i}">${nameHtml(x)}</button>`).join('') : '<span class="help">しまえる物が ない（そうび中の物は しまえない）</span>');
  invpop.scrollTop = 0; }
function bagClick(b) { const o = bagObj;
  if (b.dataset.use !== undefined) { const x = o.items[+b.dataset.use]; if (!x) return drawBag(); invpop.hidden = true; useObj(x, o.items); reopenAfterUse(() => { bagObj = o; drawBag(); }, o); return; }
  if (b.dataset.outall) { let n = 0; while (o.items.length && !invFull()) { P.inv.push(o.items.shift()); n++; } say(`袋から ${n}こ とりだした。`); drawBag(o.items.length ? 'もちものが いっぱいで、ぜんぶは 出せなかった。' : ''); render(); return; }
  if (b.dataset.inall) { let n = 0; for (const x of [...P.inv]) { if (o.items.length >= o.cap) break; if (x === o || ITEMS[x.k].bag || x.eq || x.unpaid) continue; P.inv.splice(P.inv.indexOf(x), 1); o.items.push(x); n++; } say(`袋に ${n}こ しまった。`); drawBag(); render(); return; }
  if (b.dataset.out !== undefined) { if (invFull()) return drawBag('もちものが いっぱいで とりだせない。'); const x = o.items.splice(+b.dataset.out, 1)[0]; P.inv.push(x); say(`${itemName(x)}を 袋から とりだした。`); drawBag(); render(); return; }
  if (b.dataset.in !== undefined) { if (o.items.length >= o.cap) return drawBag('袋が いっぱい。'); const x = P.inv[+b.dataset.in]; if (!x || ITEMS[x.k].bag) return drawBag('しまう袋の 中に、しまう袋は 入れられない。'); P.inv.splice(+b.dataset.in, 1); o.items.push(x); say(`${itemName(x)}を 袋に しまった。`); drawBag(); render(); } }

// ===== 袋の中身 一覧（ぜんぶの袋を まとめて 見る・使う・出す・しまう） =====
const myBags = () => P.inv.filter(o => ITEMS[o.k].bag);
const bagWithRoom = () => myBags().find(b => b.items.length < b.cap);
// 袋に しまえる物（そうび中・袋・まだ払っていない物は のぞく）
const stashable = () => P.inv.filter(x => !ITEMS[x.k].bag && !x.eq && !x.unpaid);
// もちものを、空きのある袋に 入るだけ しまう。しまった数を かえす
function stashAll() { let n = 0;
  for (const x of stashable()) { const b = bagWithRoom(); if (!b) break; P.inv.splice(P.inv.indexOf(x), 1); b.items.push(x); n++; }
  say(n ? `袋に ${n}こ しまった。` : (myBags().length ? '袋に しまえる物が ない（または 袋が いっぱい）。' : 'しまう袋を もっていない。')); return n; }
function openBags() { invpop.hidden = false; drawBags(); }
function drawBags(msg) { invpop.dataset.mode = 'bags'; const bags = myBags();
  const room = bags.reduce((s, b) => s + b.cap - b.items.length, 0);
  invpop.innerHTML = (msg ? `<div class="shopmsg">${msg}</div>` : '') + `<div><b style="color:#ffd23f">袋の中身 一覧</b>（${bags.length}こ・空き ${room}）　<button data-close="1">とじる</button></div>`
    + `<div class="help">もちものの ${stashable().length}こを しまえます。<button data-stash="1"${stashable().length && room ? '' : ' disabled'}>ぜんぶの袋に 入るだけ しまう</button></div>`
    + (bags.length ? bags.map(b => { const bi = P.inv.indexOf(b);
      return `<div class="bagbox"><div class="baghd">${nameHtml(b)}</div>` + (b.items.length ? b.items.map((x, j) => `<div class="row1"><button data-bu="${bi}:${j}" title="${ITEMS[x.k].equip ? '' : '使う'}">${nameHtml(x)}<br><small style="color:#a79fb8">${ITEMS[x.k].equip ? 'そうびは 出してから 付ける・' : 'タップで 使う・'}${itemDesc(x)}</small></button><button class="s" data-bo="${bi}:${j}">出す</button></div>`).join('') : '<span class="help">からっぽ</span>') + '</div>'; }).join('')
      : '<span class="help">しまう袋を もっていない</span>');
}
function bagsClick(b) {
  if (b.dataset.stash) { const n = stashAll(); render(); return drawBags(n ? `${n}こ しまいました。` : ''); }
  const ref = b.dataset.bu || b.dataset.bo; if (!ref) return; const [bi, j] = ref.split(':').map(Number); const bag = P.inv[bi]; const x = bag && bag.items[j]; if (!x) return drawBags();
  if (b.dataset.bo) { if (invFull()) return drawBags('もちものが いっぱいで 出せない。'); bag.items.splice(j, 1); P.inv.push(x); say(`${itemName(x)}を 袋から 出した。`); render(); return drawBags(); }
  if (ITEMS[x.k].equip) return drawBags('そうびは 袋から 出してから 付けよう。');
  invpop.hidden = true; useObj(x, bag.items); reopenAfterUse(drawBags, bag); }
// 袋の 中の 道具を 使ったあとも、袋の 画面を ひらいた ままに する（続けて 使えるように）。
// 道具が べつの 画面を ひらいたとき・冒険が おわったとき・袋が なくなったときは そのまま
function reopenAfterUse(draw, bag) { if (G.over || !over.hidden || !invpop.hidden || !P.inv.includes(bag)) return; invpop.hidden = false; draw(); }
