// ふやした 敵の 絵（新しい 形 19しゅるい ＋ 色ちがい）。どの 敵が どの 絵かは js/data/monsters_more.js
'use strict';

// ----- 新しい 形 -----
S.purupuru = sprite([
'................','................','................','.......kk.......','......kGGk......','.....kGWGGk.....','....kGWWGGGk....','...kGGGGGGGGk...',
'..kGGeGGGGeGGk..','..kGGGGGGGGGGk..','.kGGGGGmmGGGGGk.','.kGGGGGGGGGGGGk.','kGGGGGGGGGGGGGGk','.kkkkkkkkkkkkkk.'],
{ k: '#1a4a2a', G: '#5ad06a', W: '#d8ffe0', e: '#10241a', m: '#2a7a3a' });
S.kaeru = sprite([
'................','..kkk......kkk..','.kWWek....kWWek.','.kWeek....kWeek.','.kGGGkkkkkkGGGk.','kGGGGGGGGGGGGGGk','kGGGGGGGGGGGGGGk','kGGmmmmmmmmmmGGk',
'.kGGGGGGGGGGGGk.','..kGYYYYYYYYGk..','.kGkYYYYYYYYkGk.','kGGk.kkkkkk.kGGk','kkk..........kkk'],
{ k: '#123a1a', G: '#4cb04c', W: '#ffffff', e: '#101010', m: '#a02a2a', Y: '#d8f0a0' });
S.hebi = sprite([
'................','..........kkk...','.........kGGGk..','........kGeGGGk.','........kGGGmm..','.........kGGk....','....kkk..kGGk...','...kGGGk.kGGk...',
'..kGYYGGkGGk....','..kGYkkGGGk.....','..kGGk.kkk......','...kGGkkkkk.....','....kGGGGGGk....','.....kkkkkk.....'],
{ k: '#1a2a10', G: '#6aa83a', Y: '#e8d870', e: '#ff3030', m: '#ff5a7a' });
S.bug = sprite([
'................','....k......k....','.....k....k.....','......kkkk......','.....kRRRRk.....','....kReRReRk....','...kkRRRRRRkk...','..k.kRRkkRRk.k..',
'....kRRkkRRk....','..k.kRRkkRRk.k..','....kRRkkRRk....','..k..kRkkRk..k..','......kkkk......'],
{ k: '#1a0a0a', R: '#d83a3a', e: '#ffffff' });
S.kumo = sprite([
'.......k........','.......k........','.......k........','......kkk.......','.k...kPPPk...k..','..k.kPePePk.k...','...kkPPPPPkk....','.kk.kPPPPPk.kk..',
'k...kPPRPPk...k.','..kk.kPPPk.kk...','.k....kkk....k..','k.............k.'],
{ k: '#14101e', P: '#5a4a6a', e: '#ff3030', R: '#d83a3a' });
S.hachi = sprite([
'................','....ww....ww....','...wWWw..wWWw...','....wWWwwWWw....','.....kkkkkk.....','....kYYYYYYk....','...kYeYYYYeYk...','...kYYYYYYYYk...',
'...kkkkkkkkkk...','...kYYYYYYYYk...','...kkkkkkkkkk...','....kYYYYYYk....','.....kkkkkk.....','........k.......'],
{ k: '#1a1408', Y: '#f0c030', e: '#101010', w: '#a0c8e0', W: '#e8f8ff' });
S.medama = sprite([
'................','.....kkkkkk.....','...kkWWWWWWkk...','..kWWWWWWWWWWk..','.kWWWWBBBBWWWWk.','.kWWWBBkkBBWWWk.','.kWWWBkkkkBWWWk.','.kWWWBBkkBBWWWk.',
'.kWWWWBBBBWWWWk.','..kWrWWWWWWrWk..','...kkWWrWWWkk...','.....kkkkkk.....','....r...r..r....','...r....r...r...'],
{ k: '#2a1010', W: '#f4f0f0', B: '#3a8ad8', r: '#d83a4a' });
S.obake = sprite([
'................','.....kkkkkk.....','....kWWWWWWk....','...kWWWWWWWWk...','..kWWeWWWWeWWk..','..kWWeWWWWeWWk..','..kWWWWWWWWWWk..','..kWWWWmmWWWWk..',
'..kWWWWWWWWWWk..','..kWWWWWWWWWWk..','..kWWWWWWWWWWk..','..kWkWWkkWWkWk..','..kk.kk..kk.kk..'],
{ k: '#2a2a48', W: '#e8ecff', e: '#1a1030', m: '#8a6aa8' });
S.pengin = sprite([
'................','......kkkk......','.....kBBBBk.....','....kBWBBWBk....','....kBeWWeBk....','....kBWYYWBk....','...kBBWWWWBBk...','..kBBkWWWWkBBk..',
'..kBk.WWWWkkBk..','..kk..WWWW..kk..','.....kWWWWk.....','.....kWWWWk.....','....YYk..kYY....'],
{ k: '#10182a', B: '#2a3a5a', W: '#f0f4ff', e: '#101010', Y: '#f0a030' });
S.usagi = sprite([
'....kk....kk....','...kWWk..kWWk...','...kWPk..kPWk...','...kWPk..kPWk...','...kWWkkkkWWk...','..kWWWWWWWWWWk..','..kWeWWWWWWeWk..','..kWWWWpWWWWWk..',
'...kWWWWWWWWk...','..kWWWWWWWWWWk..','.kWWkWWWWWWkWWk.','..kk.kWWWWk.kk..','.....kk..kk.....'],
{ k: '#3a2a3a', W: '#fff4f4', P: '#ffb0c8', e: '#d83a6a', p: '#ff7aa0' });
S.saboten = sprite([
'.......kk.......','......kGGk......','......kGGk......','..kk..kGGk......','.kGGk.kGGk..kk..','.kGGk.kGGk.kGGk.','.kGGGkkeekkGGGk.','..kGGGGGGGGGGk..',
'...kkkGGmGGkkk..','......kGGk......','......kGGk......','....kkkkkkkk....','....kOOOOOOk....','....kkkkkkkk....'],
{ k: '#14280e', G: '#4ca84c', e: '#101010', m: '#d83a5a', O: '#c8702a' });
S.spam = sprite([
'................','................','..kkkkkkkkkkkk..','..kWkWWWWWWkWk..','..kWWkWWWWkWWk..','..kWWWkWWkWWWk..','..kWWWWkkWWWWk..','..kWeWWWWWWeWk..',
'..kWWWWWWWWWWk..','..kWWWWmmWWWWk..','..kkkkkkkkkkkk..','...k........k...','..k..........k..'],
{ k: '#2a1a10', W: '#f4ecd8', e: '#d83a3a', m: '#a02a2a' });
S.karasu = sprite([
'................','......kkkk......','.....kKKKKk.....','....kKeKKKKk....','....kKKKKKYYY...','.....kKKKKk.....','...kkKKKKKKkk...','..kKKKKKKKKKKk..',
'.kKKkKKKKKKkKKk.','kKk..kKKKKk..kKk','.....kYk.kYk....','....YY....YY....'],
{ k: '#08080e', K: '#2a2a3a', e: '#ffe14d', Y: '#e8a030' });
S.popup = sprite([
'................','.kkkkkkkkkkkkkk.','.kBBBBBBBBBBkRk.','.kBBBBBBBBBBkRk.','.kkkkkkkkkkkkkk.','.kWWWWWWWWWWWWk.','.kWWYYYYYYYYWWk.','.kWWYeYYYYeYWWk.',
'.kWWYYYmmYYYWWk.','.kWWYYYYYYYYWWk.','.kWWWWWWWWWWWWk.','.kWWWkkkkkkWWWk.','.kkkkkkkkkkkkkk.'],
{ k: '#101420', B: '#3a6ad8', R: '#e04040', W: '#f4f4f4', Y: '#ffd23f', e: '#101010', m: '#d83a3a' });
S.sumaho = sprite([
'................','....kkkkkkkk....','...kDDDDDDDDk...','...kDSSSSSSDk...','...kDSeSSeSDk...','...kDSSSSSSDk...','...kDSSmmSSDk...','...kDSSSSSSDk...',
'..rkDSSSSSSDk...','...kDSSSSSSDkr..','...kDDDDDDDDk...','...kDDDooDDDk...','....kkkkkkkk....'],
{ k: '#0a0c14', D: '#3a3f4a', S: '#4fd1ff', e: '#0a1a2a', m: '#ffffff', o: '#8a8a9a', r: '#ff4a4a' });
S.kani = sprite([
'................','.kk..........kk.','kRRk........kRRk','kRkRk......kRkRk','.kRRk......kRRk.','..kRk.k..k.kRk..','...kkeRkkReRk...','..kRRRRRRRRRRk..',
'.kRRRRRRRRRRRRk.','.kRRRWWRRWWRRRk.','..kRRRRRRRRRRk..','.k.kk.k..k.kk.k.','k..k..k..k..k..k'],
{ k: '#2a0a0a', R: '#e05a3a', W: '#ffb090', e: '#101010' });
S.gaikotsu = sprite([
'................','.....kkkkkk.....','....kWWWWWWk....','...kWWWWWWWWk...','...kWkkWWkkWk...','...kWkkWWkkWk...','...kWWWkkWWWk...','....kWWWWWWk....',
'.....kWkWkWk....','...k..kWWk..k...','..kWkkWkkWkkWk..','...k..kWWk..k...','.....kWkkWk.....','....kWk..kWk....','...kkk....kkk...'],
{ k: '#1a1a20', W: '#e8e4d8' });
S.yukidaruma = sprite([
'................','.....kkkkkk.....','....kRRRRRRk....','....kkkkkkkk....','....kWWWWWWk....','...kWeWWWWeWk...','...kWWWooWWWk...','....kWWWWWWk....',
'...kkRRRRRRkk...','..kWWWWWWWWWWk..','.kWWWWWkWWWWWWk.','.kWWWWWWWWWWWWk.','.kWWWWWkWWWWWWk.','..kWWWWWWWWWWk..','...kkkkkkkkkk...'],
{ k: '#203040', W: '#f4f8ff', R: '#d83a3a', e: '#101010', o: '#f0902a' });
S.yoroi = sprite([
'................','......kkkk......','.....kSSSSk.....','....kSSSSSSk....','....kSkkkkSk....','....kSkeekSk....','....kSSSSSSk....','..kkkSSSSSSkkk..',
'.kSSkSSRRSSkSSk.','.kSk.kSRRSk.kSk.','.kk..kSSSSk..kk.','.....kSkkSk.....','.....kSk.kSk....','....kkk..kkk....'],
{ k: '#14161e', S: '#9aa4b8', e: '#ff3030', R: '#d83a3a' });
