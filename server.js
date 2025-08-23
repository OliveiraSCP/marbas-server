require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const Discord = require('discord.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5500;
server.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

// Banco simples em memória
const db = {};

// Rotas
app.post('/request-access', (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ ok: false, msg: 'Digite seu @ do Roblox' });
  if (db[username.toLowerCase()]) return res.json({ ok: false, msg: 'Usuário já pediu acesso' });

  db[username.toLowerCase()] = { status: 'pending' };
  res.json({ ok: true });
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  const user = db[username.toLowerCase()];
  if (!user) return res.json({ ok: false, msg: 'Usuário não existe' });
  if (user.status !== 'approved') return res.json({ ok: false, msg: 'Acesso não aprovado' });
  res.json({ ok: true });
});

// Socket.IO
io.on('connection', (socket) => {
  socket.on('identify', (data) => {
    if (!data.username) return;
    socket.join(`user_${data.username.toLowerCase()}`);
  });
});

// Discord Bot
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_TOKEN);

client.once('ready', () => console.log(`Bot Discord pronto: ${client.user.tag}`));

// Exemplo: comando de aprovar/reprovar (você implementa o parse real)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName; // 'aprovar' ou 'reprovar'
  const users = interaction.options.getString('users').split(',');

  users.forEach(u => {
    const key = u.toLowerCase();
    if (!db[key]) return;
    db[key].status = cmd === 'aprovar' ? 'approved' : 'rejected';
    io.to(`user_${key}`).emit('pedido:update', db[key]);
  });

  interaction.reply({ content: `✅ ${cmd} executado!`, ephemeral: true });
});
