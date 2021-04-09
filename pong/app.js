const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const url = require('url');

const app = express();
const server = http.createServer(app);

server.listen(process.env.PORT || 3008);

wss = new WebSocket.Server({ server });

const connections = new WeakMap;
const games = {};

wss.on('connection', async (ws, req) => {
  const { gameId } = url.parse(req.url, true).query;

  console.log("Game id connected", gameId);
  const connectionId = Math.random().toString(16).substring(2);

  if (!games[gameId]) {
    games[gameId] = { connections: [], signals: {} };
  }
  games[gameId].connections.push(connectionId);

  connections.set(ws, { connectionId } );

  ws.broadcast = message => {
    for (const client of wss.clients) {
      if (client === ws) continue;
      if (client.readyState !== WebSocket.OPEN) continue;
      if (connections.get(ws).connectionId == connectionId) {
        client.send(message);
      }
    }
  };

  let gameConnections = games[gameId].connections;

  const otherConnection = games[gameId].connections.find(id => id!== connectionId);
  let signalData = otherConnection && games[gameId].signals[otherConnection];
  if (signalData) {
    delete games[gameId].signals[otherConnection];
  }


  ws.send(JSON.stringify({
    action: 'initialize',
    data: {
      isInitiator: gameConnections.length === 1,
      signalData,
    }
  }));

  ws.on('message', async message => {
    const { action, data } = JSON.parse(message);
    if (action === 'signal_bounce') {
      games[gameId].signals[connectionId] = data;
      ws.broadcast(JSON.stringify({
        action: 'signal',
        data,
      }));
    }
  });

  ws.on('disconnect', _ => {
    gameConnections = gameConnections.filter(id => id !== connectionId);
  });

});

app.get('/', (req, res) => {
  const gameId = Math.random().toString(16).substring(2);
  return res.redirect(`/${gameId}`);
});

app.get('/js/*', (req, res) => {
  const asset = req.params[0];
  res.sendFile(__dirname + '/js/' + asset);
});

app.get('/:gameId', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
