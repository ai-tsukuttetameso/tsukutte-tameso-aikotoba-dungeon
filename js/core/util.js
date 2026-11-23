// 小さな道具（HTMLのエスケープなど）
'use strict';

// ゲームの 名前（タイトル画面・タブ・シェア文に 出る）。かえるときは ここだけ
const GAME_NAME = 'あいことばダンジョン';
// バージョン：エピソード1は 1.xx、エピソード2（ブルーアースの核）は 2.xx
const GAME_EPISODE = 'エピソード1', GAME_VERSION = '1.64';
document.title = GAME_NAME;

const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
