// なかまキャラ（うーたん・タメゾウ）。ときどき 階に いて、話しかけると たすけてくれる
'use strict';

const FRIENDS = {
  uutan: { name: 'うーたん', spr: 'uutan',
    lines: ['ここまで よく来たね！ ちょっと 休んでいこう。', 'おなか すいてない？ おにぎり あるよ。', 'あわてない あわてない。いったん 回復しよ！'],
    help() { P.hp = Math.min(P.mhp, P.hp + Math.ceil(P.mhp / 2)); P.food = Math.max(P.food, 100); return 'HPが 回復して、おなかも いっぱいに なった！'; } },
  tamezou: { name: 'タメゾウ', spr: 'tamezou',
    lines: ['ピピッ。もちものを AIで しらべてみるね！', 'これ、ためしてみて！ きっと 役に立つよ。', 'データに よると、この先は あぶないみたい。'],
    help() { const unk = [...new Set(P.inv.filter(o => !isKnown(o.k)).map(o => o.k))];
      if (unk.length) { for (const k of unk) P.known.add(k); return `もちものの 正体が わかった！（${unk.map(k => ITEMS[k].name).join('・')}）`; }
      const k = pick(['herb', 'g_life', 's_ident', 'bread', 's_up']), o = newItem(k, 'shop'); P.known.add(k);
      if (!invFull()) { P.inv.push(o); return `${ITEMS[k].name}を もらった！`; }
      const b = bagWithRoom(); if (b) { b.items.push(o); return `${ITEMS[k].name}を もらって、袋に しまった！`; }
      return 'でも もちものが いっぱいで、もらえなかった……'; } },
};
const npcAt = (x, y) => G.npc && G.npc.x === x && G.npc.y === y;
// 床・敵が 入れない マス（お店の 店主と なかま）
const blockedAt = (x, y) => shopAt(x, y) || npcAt(x, y);
// 話しかける：1回 たすけてくれて、手を ふって 帰っていく
function talkFriend() { const n = G.npc, f = FRIENDS[n.who];
  say(`${f.name}「${pick(f.lines)}」`); say(f.help()); sfx('lvup'); showBanner(`${f.name}が たすけてくれた！`, '');
  say(`${f.name}は 手を ふって 帰っていった。`); G.npc = null; endTurn(); }
