// test_ws.js
const SERVER_URL = 'ws://192.168.178.119:8082'; // Deine ermittelte IP + Port

console.log(`Versuche Verbindung aufzubauen zu: ${SERVER_URL}...`);

const ws = new WebSocket(SERVER_URL);

ws.onopen = () => {
  console.log('✅ WebSocket erfolgreich verbunden!');
  ws.send(JSON.stringify({ type: 'ping', message: 'Hallo Server!' }));
};

ws.onmessage = (event) => {
  console.log('📩 Nachricht vom Server empfangen:', event.data);
};

ws.onerror = (error) => {
  console.log('❌ WebSocket Fehler:', error.message || 'Keine genaue Beschreibung verfügbar');
};

ws.onclose = (event) => {
  console.log(`🔌 Verbindung getrennt. Code: ${event.code}, Grund: ${event.reason || 'Kein Grund angegeben'}`);
};