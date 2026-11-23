// しんか（data/items_evo.js の 表を つかう）
'use strict';

const evoReady = o => ITEMS[o.k].equip && (o.plus || 0) >= EVO_NEED && !o.cursed && evoChoices(o).length > 0;
const evoCost = () => Math.round((jobHas('forge') ? 500 : 1000) * G.shopRate / 10) * 10;
// o を k に しんか させる。＋は 100 へり、特性は そのまま、わくが 1つ ふえ、しんか先の 特性が つく
function evolveItem(o, k) { const was = itemName(o), it = ITEMS[k];
  o.k = k; o.plus = (o.plus || 0) - EVO_NEED; o.tslot = (o.tslot || 0) + 1; o.traits = o.traits || [];
  if (it.evoTrait && !o.traits.includes(it.evoTrait) && o.traits.length < traitCap(o)) o.traits.push(it.evoTrait);
  progAdd('evolved', k); setTimeout(() => checkTitles(), 0); return `${was}が「${it.name}」に しんかした！`; }
