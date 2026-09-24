const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const app = express();
const HTTP_PORT = 8080;
const WS_PORT = 8082;

// 1. HIER FÜGST DU DEINEN GENERIERTEN KEY EIN:
const API_KEY = 'UIy07JOxeMT1DofCk4D8FMuBGfXrKhDLHJpswwp2NM9NyWSHUmBVZhRL1s_EjwZu';

app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ port: WS_PORT });
let activeTvConnections = [];

wss.on('connection', (ws) => {
  activeTvConnections.push(ws);
  ws.on('close', () => {
    activeTvConnections = activeTvConnections.filter((conn) => conn !== ws);
  });
});

app.post('/api/language', (req, res) => {
  // 2. HIER WIRD DER KEY AUS DES CONFINGURATORS PRÜFT:
  const clientKey = req.headers['x-api-key'];

  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ error: 'Nicht autorisiert: Ungültiger API-Key' });
  }

  const { language } = req.body;
  if (!language) {
    return res.status(400).json({ error: 'Keine Sprache übergeben' });
  }

  activeTvConnections.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ language }));
    }
  });

  console.log(`[SERVER] Sprachänderung empfangen: ${language}`);

  return res.json({ status: 'success', language });
});

app.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`Server läuft mit API-Key-Schutz auf Port ${HTTP_PORT}`);
});