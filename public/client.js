const socket = io();
const userInput = document.getElementById('roblox-user');
const getBtn = document.getElementById('get-access');
const loginBtn = document.getElementById('login');
const msg = document.getElementById('login-msg');

// GET ACCESS
getBtn.addEventListener('click', async () => {
  const user = userInput.value.trim();
  if (!user) { shake(); msg.textContent = 'Digite seu @ do Roblox'; return; }

  const res = await fetch('/request-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user })
  });
  const data = await res.json();
  if (!data.ok) { shake(); msg.textContent = data.msg; return; }

  msg.textContent = '✅ Pedido enviado! Aguarde aprovação.';
  userInput.value = '';
});

// LOGIN
loginBtn.addEventListener('click', async () => {
  const user = userInput.value.trim();
  if (!user) { shake(); msg.textContent = 'Digite seu @ do Roblox'; return; }

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user })
  });
  const data = await res.json();
  if (!data.ok) { shake(); msg.textContent = data.msg; return; }

  localStorage.setItem('marbasUser', user);
  window.location.href = '/main.html';
});

// Shake animation
function shake() {
  const container = document.querySelector('.login-container');
  container.style.animation = 'shake 0.5s';
  setTimeout(() => container.style.animation = '', 500);
}
