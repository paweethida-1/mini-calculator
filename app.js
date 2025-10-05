// --- Utility helpers ---
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const resultEl = $('#result');
const historyEl = $('#history');
const keys = $$('.key');
const themeToggle = $('#themeToggle');
const soundToggle = $('#soundToggle');
const clickSound = $('#clickSound');

let expr = '0';
let lastAnswer = null;
let soundOn = false;

const allowed = /^[0-9+\-*/%.()\s]+$/;

function playClick() {
  if (!soundOn) return;
  try { clickSound.currentTime = 0; clickSound.play(); } catch (e) {}
}

function updateDisplay() {
  resultEl.textContent = expr || '0';
  historyEl.textContent = lastAnswer !== null ? `Ans = ${lastAnswer}` : '';
}

function clearAll() {
  expr = '0';
  updateDisplay();
}

function backspace() {
  playClick();
  if (expr.length <= 1) { expr = '0'; }
  else { expr = expr.slice(0, -1); }
  updateDisplay();
}

function insert(value) {
  playClick();
  if (expr === '0' && /[0-9.]/.test(value)) expr = value; else expr += value;
  // กันจุดทศนิยมซ้ำในตัวเลขเดียวกัน
  expr = expr.replace(/(\d*\.\d*)\./g, '$1');
  updateDisplay();
}

function toggleSign() {
  playClick();
  // สลับ +/− ของ "ตัวเลขล่าสุด" ในสตริง
  expr = expr.replace(/([\d.]+)(?!.*[\d.])/,
    (m) => m.startsWith('-') ? m.slice(1) : ('-' + m)
  );
  updateDisplay();
}

function toPercent() {
  playClick();
  // แปลงตัวเลขล่าสุดเป็นเปอร์เซ็นต์ (หาร 100)
  expr = expr.replace(/([\d.]+)(?!.*[\d.])/,
    (m) => String(parseFloat(m) / 100)
  );
  updateDisplay();
}

function sanitize(s) {
  // อนุญาตเฉพาะอักขระที่ใช้คำนวณ
  if (!allowed.test(s)) return '0';
  // ปรับสัญลักษณ์ที่อาจถูกพิมพ์แบบยูนิโค้ด
  s = s.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
  // กัน // หรือ //// ให้เหลือ /
  s = s.replace(/\/{2,}/g, '/');
  return s;
}

function compute() {
  playClick();
  const safe = sanitize(expr);
  try {
    // ใช้ Function แทน eval (จำกัดอินพุตแล้ว)
    // eslint-disable-next-line no-new-func
    const val = Function('return (' + safe + ')')();
    if (!isFinite(val)) throw new Error('Math error');
    lastAnswer = val;
    expr = String(val);
  } catch (e) {
    expr = 'Error';
    setTimeout(() => { expr = '0'; updateDisplay(); }, 900);
  }
  updateDisplay();
}

// --- คลิกปุ่ม ---
keys.forEach(btn => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.value;
    const action = btn.dataset.action;
    if (action === 'clear') return (playClick(), clearAll());
    if (action === 'back') return backspace();
    if (action === 'equal') return compute();
    if (action === 'sign') return toggleSign();
    if (action === 'percent') return toPercent();
    if (v) insert(v);
  });
});

// --- คีย์บอร์ด ---
window.addEventListener('keydown', (e) => {
  const { key } = e;
  if (/^[0-9+\-*/().]$/.test(key)) { insert(key); return; }
  if (key === 'Enter' || key === '=') { e.preventDefault(); compute(); return; }
  if (key === 'Backspace') { backspace(); return; }
  if (key === 'Escape') { clearAll(); return; }
  if (key === '%') { toPercent(); return; }
});

// --- Toggle ธีมและเสียง ---
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
});
soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? '🔊 Sound' : '🔈 Sound';
});

// เริ่มต้น
updateDisplay();
