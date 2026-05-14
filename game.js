// =============================================
//  GAZAN 67 КЛІКЕР — game.js  v4.0
// =============================================

// ── 10 РІВНІВ: тема + баф ────────────────────
const LEVELS = [
  { lvl:1,  xp:0,    theme:'theme-street', title:'ВУЛИЦЯ', icon:'🏙️', desc:'Газан починає з нуля на вулиці',     buff:null },
  { lvl:2,  xp:80,   theme:'theme-studio', title:'СТУДІЯ', icon:'🎙️', desc:'Перший запис у студії!',             buff:{type:'clickPower',value:2,  label:'+2 до кожного кліку'} },
  { lvl:3,  xp:200,  theme:'theme-tiktok', title:'TIKTOK', icon:'📱', desc:'Газан завірусився в TikTok!',        buff:{type:'perSecond', value:5,  label:'+5 67/сек назавжди'} },
  { lvl:4,  xp:420,  theme:'theme-club',   title:'КЛУБ',   icon:'🎉', desc:'Перший виступ у клубі!',             buff:{type:'clickMult', value:1.5,label:'x1.5 до всіх кліків'} },
  { lvl:5,  xp:750,  theme:'theme-gold',   title:'ЗОЛОТО', icon:'🥇', desc:'Six Seven стає золотим!',            buff:{type:'perSecond', value:20, label:'+20 67/сек назавжди'} },
  { lvl:6,  xp:1200, theme:'theme-neon',   title:'НЕОН',   icon:'🌆', desc:'Газан — зірка нічного міста',        buff:{type:'clickPower',value:10, label:'+10 до кожного кліку'} },
  { lvl:7,  xp:1900, theme:'theme-fire',   title:'ВОГОНЬ', icon:'🔥', desc:'Бархатні тяги горять!',              buff:{type:'allMult',   value:2,  label:'x2 ВСЕ (клік + /сек)'} },
  { lvl:8,  xp:2900, theme:'theme-space',  title:'КОСМОС', icon:'🚀', desc:'Газан підкорює всесвіт!',            buff:{type:'perSecond', value:100,label:'+100 67/сек назавжди'} },
  { lvl:9,  xp:4200, theme:'theme-legend', title:'ЛЕГЕНДА',icon:'👑', desc:'АБУ БАНДИТ — вічний хіт!',           buff:{type:'clickMult', value:3,  label:'x3 до всіх кліків'} },
  { lvl:10, xp:6000, theme:'theme-god',    title:'БОГ 67', icon:'⚡', desc:'Газан — бог 67-музики!',             buff:{type:'allMult',   value:5,  label:'x5 ВСЕ — МАКС ПОТУГА'} },
];

// ── ТИМЧАСОВІ БАФИ ────────────────────────────
const TEMP_BUFFS = [
  { id:'frenzy', icon:'⚡', name:'FRENZY MODE',  desc:'x3 кліків на 10 сек!',  duration:10, eff:{clickMult:3} },
  { id:'rain',   icon:'💰', name:'MONEY RAIN',   desc:'+500 67/сек на 8 сек!', duration:8,  eff:{psecBonus:500} },
  { id:'combo',  icon:'🎵', name:'COMBO x5',     desc:'x5 кліків на 6 сек!',   duration:6,  eff:{clickMult:5} },
  { id:'mega',   icon:'📣', name:'MEGA HONK',    desc:'x3 все на 12 сек!',      duration:12, eff:{allMult:3} },
];

// ── STATE ─────────────────────────────────────
const state = {
  currency:0, totalEarned:0, totalClicks:0,
  baseClick:1, clickMult:1,
  basePSec:0,  psecMult:1,
  xp:0, level:1,
  activeBuff:null, buffEnd:0, totalBuffs:0,
};
let tempClickMult=1, tempPsecBonus=0, tempAllMult=1, buffTimeout=null;

function getClickPower(){ return Math.floor(state.baseClick * state.clickMult); }
function getPerSecond() { return Math.floor(state.basePSec  * state.psecMult);  }
function getTotalClick(){ return Math.floor(getClickPower() * tempClickMult * tempAllMult); }
function getTotalPSec() { return Math.floor((getPerSecond() + tempPsecBonus) * tempAllMult); }

// ── UPGRADES ──────────────────────────────────
const UPGRADES = [
  {id:'mic',      icon:'🎤', name:'КРУТИЙ МІК',     desc:'+1 67/клік. Газан кричить голосніше.',  baseCost:10,     costMult:1.5,  maxLevel:20, effect:'baseClick', value:1,   level:0},
  {id:'chain',    icon:'📿', name:'ЗОЛОТИЙ ЛАНЦ',   desc:'+3 67/клік. Bling bling!',              baseCost:75,     costMult:1.6,  maxLevel:15, effect:'baseClick', value:3,   level:0},
  {id:'fans',     icon:'📱', name:'ТІКТОКЕРИ',      desc:'+1 67/сек. Мільйони переглядів.',       baseCost:50,     costMult:1.55, maxLevel:30, effect:'basePSec',  value:1,   level:0},
  {id:'bark',     icon:'🎵', name:'БАРХАТНІ ТЯГИ',  desc:'+5 67/сек. Хіт у всіх плейлістах.',    baseCost:300,    costMult:1.7,  maxLevel:20, effect:'basePSec',  value:5,   level:0},
  {id:'67',       icon:'6️⃣', name:'SIX SEVEN',     desc:'+20 67/сек. Вірусний хіт 2026!',       baseCost:1500,   costMult:1.8,  maxLevel:15, effect:'basePSec',  value:20,  level:0},
  {id:'concert',  icon:'💥', name:'МЕГА КОНЦЕРТ',   desc:'+10 67/клік. Зал на 50к людей.',       baseCost:2000,   costMult:2.0,  maxLevel:10, effect:'baseClick', value:10,  level:0},
  {id:'abu',      icon:'🏴', name:'АБУ БАНДИТ',     desc:'+100 67/сек. Легендарний трек.',        baseCost:10000,  costMult:2.0,  maxLevel:10, effect:'basePSec',  value:100, level:0},
  {id:'empire',   icon:'👑', name:'ГАЗАН EMPIRE',   desc:'+500 67/сек. Газан захопив чарти.',    baseCost:100000, costMult:2.2,  maxLevel:5,  effect:'basePSec',  value:500, level:0},
  // BUFF upgrades
  {id:'b_frenzy', icon:'⚡', name:'БАФ: FRENZY',    desc:'Активує x3/клік на 10 сек!',           baseCost:500,    costMult:2.5,  maxLevel:99, effect:'buff', buffId:'frenzy', level:0},
  {id:'b_rain',   icon:'💰', name:'БАФ: MONEY RAIN',desc:'Активує +500/сек на 8 сек!',           baseCost:800,    costMult:2.5,  maxLevel:99, effect:'buff', buffId:'rain',   level:0},
  {id:'b_combo',  icon:'🎵', name:'БАФ: COMBO x5',  desc:'Активує x5/клік на 6 сек!',            baseCost:1200,   costMult:2.8,  maxLevel:99, effect:'buff', buffId:'combo',  level:0},
  {id:'b_mega',   icon:'📣', name:'БАФ: MEGA HONK', desc:'Активує x3 ВСЕ на 12 сек!',            baseCost:2500,   costMult:3.0,  maxLevel:99, effect:'buff', buffId:'mega',   level:0},
];

// ── ACHIEVEMENTS ──────────────────────────────
const ACHIEVEMENTS = [
  {id:'c1',    icon:'🎤', name:'ПЕРШИЙ ВИСТУП',  desc:'1 клік',             check:()=>state.totalClicks>=1},
  {id:'c100',  icon:'🎵', name:'100 КЛІКІВ',     desc:'100 кліків',         check:()=>state.totalClicks>=100},
  {id:'c1k',   icon:'🔥', name:'1К КЛІКІВ',      desc:'1000 кліків',        check:()=>state.totalClicks>=1000},
  {id:'e1k',   icon:'💰', name:'1К МОНЕТ',       desc:'Зароби 1 000',       check:()=>state.totalEarned>=1000},
  {id:'e10k',  icon:'🤑', name:'АБУ БАНДИТ',    desc:'Зароби 10 000',      check:()=>state.totalEarned>=10000},
  {id:'e100k', icon:'👑', name:'GAZAN LEGEND',  desc:'Зароби 100 000',     check:()=>state.totalEarned>=100000},
  {id:'l3',    icon:'📱', name:'ТІКТОКЕР',       desc:'Досягни рівня 3',    check:()=>state.level>=3},
  {id:'l5',    icon:'🥇', name:'ЗОЛОТО',         desc:'Досягни рівня 5',    check:()=>state.level>=5},
  {id:'l7',    icon:'🔥', name:'ВОГОНЬ',         desc:'Досягни рівня 7',    check:()=>state.level>=7},
  {id:'l10',   icon:'⚡', name:'ГАЗАН БОГ',      desc:'MAX рівень 10!',     check:()=>state.level>=10},
  {id:'buff1', icon:'💥', name:'БАФ АКТИВОВАНО', desc:'Активуй баф',        check:()=>state.totalBuffs>=1},
  {id:'buff10',icon:'🌪️', name:'БАФ x10',       desc:'Активуй 10 бафів',   check:()=>state.totalBuffs>=10},
];
const unlocked = new Set();

// ── DOM ───────────────────────────────────────
const $ = id => document.getElementById(id);
const gazanBtn    = $('gazanBtn');
const feedbackEl  = $('clickFeedback');
const feedbackAmt = $('feedbackAmount');
const floatCont   = $('floatingNumbers');
const buffBarEl   = $('buffBar');
const buffNameEl  = $('buffName');
const buffTimerEl = $('buffTimer');
const buffFillEl  = $('buffBarFill');

// ── HELPERS ───────────────────────────────────
function fmt(n){ if(n>=1e9)return(n/1e9).toFixed(2)+'B'; if(n>=1e6)return(n/1e6).toFixed(2)+'M'; if(n>=1e3)return(n/1e3).toFixed(1)+'K'; return Math.floor(n)+''; }
function calcCost(u){ return Math.floor(u.baseCost * Math.pow(u.costMult, u.level)); }
function getLvl(n){ return LEVELS.find(l=>l.lvl===n)||LEVELS[LEVELS.length-1]; }
function getNextXP(n){ const nx=LEVELS.find(l=>l.lvl===n+1); return nx?nx.xp:Infinity; }

// ── TEMP BUFF ─────────────────────────────────
function activateBuff(buff){
  clearBuff();
  tempClickMult = buff.eff.clickMult||1;
  tempPsecBonus = buff.eff.psecBonus||0;
  tempAllMult   = buff.eff.allMult||1;
  state.activeBuff=buff; state.buffEnd=Date.now()+buff.duration*1000;
  state.totalBuffs++;
  buffTimeout=setTimeout(clearBuff, buff.duration*1000);
  renderBuffBar(); showBuffToast(buff);
}
function clearBuff(){
  tempClickMult=1; tempPsecBonus=0; tempAllMult=1;
  state.activeBuff=null; if(buffTimeout)clearTimeout(buffTimeout);
  renderBuffBar();
}
function renderBuffBar(){
  if(!state.activeBuff){ buffBarEl.style.display='none'; return; }
  buffBarEl.style.display='flex';
  const rem=Math.max(0,(state.buffEnd-Date.now())/1000);
  buffNameEl.textContent = state.activeBuff.icon+' '+state.activeBuff.name;
  buffTimerEl.textContent= Math.ceil(rem)+'СЕК';
  buffFillEl.style.width = Math.min(100,(rem/state.activeBuff.duration)*100)+'%';
  if(rem<=0) clearBuff();
}

// ── CLICK ─────────────────────────────────────
gazanBtn.addEventListener('click', e=>{
  const earned = getTotalClick();
  state.currency+=earned; state.totalEarned+=earned; state.totalClicks++;
  state.xp += Math.max(1, Math.floor(earned/3));
  checkLevelUp();
  gazanBtn.classList.remove('clicked');
  void gazanBtn.offsetWidth;
  gazanBtn.classList.add('clicked');
  setTimeout(()=>gazanBtn.classList.remove('clicked'),150);
  feedbackAmt.textContent=fmt(earned);
  feedbackEl.classList.remove('show');
  void feedbackEl.offsetWidth;
  feedbackEl.classList.add('show');
  spawnFloat(e.clientX,e.clientY,'+'+fmt(earned));
  updateUI(); checkAchievements();
});

function spawnFloat(x,y,txt){
  const el=document.createElement('div');
  el.className='float-num'; el.textContent=txt+' 67';
  el.style.left=(x-20+Math.random()*30)+'px';
  el.style.top=(y-10)+'px';
  floatCont.appendChild(el);
  el.addEventListener('animationend',()=>el.remove());
}

// ── PER-SECOND ────────────────────────────────
setInterval(()=>{
  const ps=getTotalPSec();
  if(ps>0){ state.currency+=ps; state.totalEarned+=ps; state.xp+=Math.max(1,Math.floor(ps/20)); checkLevelUp(); updateUI(); }
  if(state.activeBuff) renderBuffBar();
},1000);

// ── LEVEL UP ──────────────────────────────────
function checkLevelUp(){
  const max=LEVELS[LEVELS.length-1].lvl;
  if(state.level>=max) return;
  const nextXP=getNextXP(state.level);
  if(state.xp>=nextXP){
    state.level++;
    applyLvlBuff(state.level);
    applyTheme(state.level);
    showLvlUpScreen(state.level);
    checkAchievements();
  }
}

function applyLvlBuff(lvl){
  const ld=getLvl(lvl); if(!ld.buff) return;
  const b=ld.buff;
  if(b.type==='clickPower') state.baseClick+=b.value;
  if(b.type==='perSecond')  state.basePSec+=b.value;
  if(b.type==='clickMult')  state.clickMult*=b.value;
  if(b.type==='allMult'){   state.clickMult*=b.value; state.psecMult*=b.value; }
}

function applyTheme(lvl){
  const ld=getLvl(lvl);
  document.body.className=ld.theme;
  $('lvlTitle').textContent=ld.title;
  $('lvlIcon').textContent=ld.icon;
  renderRoadmap();
}

function showLvlUpScreen(lvl){
  const ld=getLvl(lvl);
  const ov=document.createElement('div');
  ov.className='levelup-overlay';
  ov.innerHTML=`<div class="levelup-box">
    <div class="lu-icon">${ld.icon}</div>
    <div class="lu-title">LEVEL ${lvl}</div>
    <div class="lu-theme">${ld.title}</div>
    <div class="lu-desc">${ld.desc}</div>
    <div class="lu-buff">${ld.buff?'🎁 БАФ: '+ld.buff.label:'— без бафу —'}</div>
    <button class="lu-btn" onclick="this.closest('.levelup-overlay').remove()">► ПРОДОВЖИТИ</button>
  </div>`;
  document.body.appendChild(ov);
}

// ── UPGRADE BUY ───────────────────────────────
function buyUpgrade(upg,card){
  const cost=calcCost(upg);
  if(state.currency<cost||upg.level>=upg.maxLevel) return;
  state.currency-=cost; upg.level++;
  if(upg.effect==='baseClick') state.baseClick+=upg.value;
  if(upg.effect==='basePSec')  state.basePSec+=upg.value;
  if(upg.effect==='buff'){ const b=TEMP_BUFFS.find(x=>x.id===upg.buffId); if(b) activateBuff(b); }
  card.classList.add('buy-flash');
  setTimeout(()=>card.classList.remove('buy-flash'),300);
  updateUI(); checkAchievements();
}

// ── RENDER ROADMAP ────────────────────────────
function renderRoadmap(){
  const el=$('levelRoadmap'); el.innerHTML='';
  LEVELS.forEach(ld=>{
    const done=state.level>ld.lvl, active=state.level===ld.lvl, locked=state.level<ld.lvl;
    const div=document.createElement('div');
    div.className='roadmap-item'+(active?' active':done?' done':' locked');
    div.innerHTML=`
      <span class="rm-icon">${ld.icon}</span>
      <div class="rm-info">
        <div class="rm-title">LV${ld.lvl} ${ld.title}</div>
        <div class="rm-xp">${ld.buff?ld.buff.label:'Стартовий'}</div>
      </div>
      ${done?'<span class="rm-check">✓</span>':active?'<span class="rm-badge">NOW</span>':''}
    `;
    el.appendChild(div);
  });
}

// ── RENDER UPGRADES ───────────────────────────
function renderUpgrades(){
  const el=$('upgradesList'); el.innerHTML='';
  UPGRADES.forEach(upg=>{
    const isBuff=upg.effect==='buff';
    const cost=calcCost(upg), maxed=upg.level>=upg.maxLevel;
    const canAfford=!maxed&&state.currency>=cost;
    const pct=Math.min(100,(state.currency/cost)*100);
    const card=document.createElement('div');
    card.className='upgrade-card'+(maxed?' purchased':!canAfford?' disabled':'')+(isBuff?' is-buff':'');
    card.innerHTML=`
      <div class="upgrade-header">
        <span class="upgrade-icon">${upg.icon}</span>
        <span class="upgrade-name">${upg.name}${isBuff?'<span class="buff-badge">БАФ</span>':''}</span>
        <span class="upgrade-level">LV${upg.level}</span>
      </div>
      <div class="upgrade-desc">${upg.desc}</div>
      <div class="upgrade-footer">
        ${maxed
          ?'<span class="upgrade-maxed">■ MAX ■</span>'
          :`<div class="upgrade-cost">${fmt(cost)} 67</div>
            <div class="upgrade-effect">${isBuff?'⚡АКТИВ':'+'+upg.value+(upg.effect==='baseClick'?'/CLK':'/SEC')}</div>`}
      </div>
      ${!maxed?`<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>`:''}
    `;
    if(!maxed&&canAfford) card.addEventListener('click',()=>buyUpgrade(upg,card));
    el.appendChild(card);
  });
}

// ── UPDATE UI ─────────────────────────────────
function updateUI(){
  $('currency').textContent    = fmt(state.currency);
  $('perSec').textContent      = '+'+fmt(getTotalPSec())+'/СЕК';
  $('totalClicks').textContent = fmt(state.totalClicks);
  $('perClick').textContent    = fmt(getTotalClick());
  $('perSecStat').textContent  = fmt(getTotalPSec());
  $('totalEarned').textContent = fmt(state.totalEarned);
  $('playerLevel').textContent = state.level;
  const curLD=getLvl(state.level), nextXP=getNextXP(state.level);
  const maxed=state.level>=LEVELS[LEVELS.length-1].lvl;
  const pct=maxed?100:Math.min(100,((state.xp-curLD.xp)/(nextXP-curLD.xp))*100);
  $('xpBar').style.width=pct+'%';
  $('xpCurrent').textContent=maxed?'MAX':fmt(state.xp-curLD.xp);
  $('xpMax').textContent=maxed?'∞':fmt(nextXP-curLD.xp);
  renderUpgrades();
}

// ── ACHIEVEMENTS ──────────────────────────────
function renderAchievements(){
  const el=$('achievements'); el.innerHTML='';
  ACHIEVEMENTS.forEach(a=>{
    const u=unlocked.has(a.id);
    const d=document.createElement('div');
    d.className='achievement'+(u?' unlocked':'');
    d.innerHTML=`<span class="achievement-icon">${u?a.icon:'▓'}</span><div class="achievement-text"><div class="achievement-name">${u?a.name:'??????'}</div><div class="achievement-desc">${u?a.desc:'LOCKED'}</div></div>`;
    el.appendChild(d);
  });
}
function checkAchievements(){
  let ch=false;
  ACHIEVEMENTS.forEach(a=>{ if(!unlocked.has(a.id)&&a.check()){ unlocked.add(a.id); ch=true; showAchToast(a); } });
  if(ch) renderAchievements();
}

function showAchToast(a){
  const t=document.createElement('div');
  t.className='pixel-toast ach-toast';
  t.textContent=a.icon+' АЧІВКА: '+a.name;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}
function showBuffToast(b){
  const t=document.createElement('div');
  t.className='pixel-toast buff-toast';
  t.textContent=b.icon+' '+b.name+' — '+b.desc;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

// ── INIT ──────────────────────────────────────
applyTheme(1);
renderRoadmap();
renderAchievements();
updateUI();
