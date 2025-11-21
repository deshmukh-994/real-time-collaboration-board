const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4002;

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const boards = {};

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/boards', (req, res) => {
  res.json(Object.values(boards));
});

app.post('/api/boards', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Board name is required' });
  }
  const id = 'board-' + Date.now();
  boards[id] = { id, name, items: [] };
  io.emit('board_created', boards[id]);
  res.status(201).json(boards[id]);
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('join_board', (boardId) => {
    socket.join(boardId);
  });

  socket.on('add_item', ({ boardId, content }) => {
    if (!boards[boardId]) return;
    const item = {
      id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      content,
      createdAt: new Date().toISOString()
    };
    boards[boardId].items.push(item);
    io.to(boardId).emit('item_added', { boardId, item });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Real-Time Collaboration Board server listening on ${PORT}`);
});
