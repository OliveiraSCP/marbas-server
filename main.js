const socket = io();
const user = localStorage.getItem('marbasUser');

if (!user) window.location.href = '/';
else socket.emit('identify', { username: user });

// Notificações em tempo real
socket.on('pedido:update', (data) => {
  if (!data.status) return;
  if (data.status === 'approved') {
    alert('✅ Você foi aprovado! Entre com seu @ agora.');
  } else if (data.status === 'rejected') {
    alert('❌ Seu pedido foi recusado.');
    localStorage.removeItem('marbasUser');
    window.location.href = '/';
  }
});

// Steal A Brainrot
const stealBtn = document.querySelector('.btn.active');
stealBtn.addEventListener('click', () => {
  window.open('https://www.roblox.com/share?code=6602de92ea0a404f85ba3c9416461a65&type=Server', '_blank');
});

// Blox Fruit
const bloxBtn = document.querySelector('.btn.disabled');
bloxBtn.addEventListener('click', () => {
  alert('🚫 Servidor ainda não disponível.');
});
