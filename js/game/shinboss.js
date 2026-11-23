// ===== 地下100階の でかこわの王：たおすと「真の姿」に 変身して 2回戦 =====
// まもの図鑑の 数は ふやさない（m.t は そのまま。m.shin で 見た目と うごきを かえる）
const SHIN_NAME = 'でかこわの王・真の姿';
const shinFloor = () => LAST === 100 && G.f === LAST;
S.dekakowa_shin = variant(S.dekakowa, { hue: 320, sat: 1.6, light: .7 });

function shinTransform(m) { m.shin = true; m.name = SHIN_NAME; m.mhp = Math.round(m.mhp * 1.5); m.hp = m.mhp; m.atk = Math.round(m.atk * 1.25); m.def += 3;
  m.sleep = 0; m.stuck = 0; m.confuse = 0; m.poison = 0; m.shinT = 0; m.flash = 8;
  sfx('boss'); shake(14); showBanner('でかこわの王が 真の姿を あらわした！', 'ここからが ほんとうの たたかい');
  say('でかこわの王は たおれた……と思ったら、黒い 光に つつまれて 立ちあがった！'); say(`「${SHIN_NAME}」が あらわれた！`); }

// 1回目に たおしたときは クリアに しないで 変身する
const _killMonShin = killMon; killMon = function (m) { if (m && m.boss && !m.shin && shinFloor() && G.mons.includes(m)) { shinTransform(m); return; } return _killMonShin.apply(this, arguments); };

// 真の姿の うごき：4ターンに 1回、はなれていても とどく「やみの いき」。体力が 半分を きると いかって 攻撃が 上がる
const _monTurnShin = monTurn; monTurn = function (m) { if (!m.shin || m.sleep || m.stuck > 0) return _monTurnShin.apply(this, arguments);
  m.shinT = (m.shinT || 0) + 1;
  if (!m.angry && m.hp <= m.mhp / 2) { m.angry = true; m.atk = Math.round(m.atk * 1.2); shake(8); sfx('boss'); say(`${m.name}は いかった！ こうげきが 上がった。`); showBanner('いかりの でかこわの王', 'こうげきが 上がった'); return; }
  const dist = Math.max(Math.abs(m.x - P.x), Math.abs(m.y - P.y));
  if (m.shinT % 4 === 0 && dist >= 2 && dist <= 5 && visible(m.x, m.y)) { monAnim(m);
    let dd = Math.max(1, Math.round(dmg(m.atk, defTotal()) * .7)); if (P.teppeki > 0) dd = Math.max(1, Math.round(dd / 2));
    P.hp -= dd; P.flash = 6; P.cause = m.name; sfx('hurt'); shake(6); say(`${m.name}の やみの いき！ ${dd}の ダメージ。`); return; }
  return _monTurnShin.apply(this, arguments); };
