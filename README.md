# Real-Time Collaboration Board — Backend (Ready to Run)

This is a minimal backend for a **Real-Time Collaboration Board**.

It uses:
- Node.js + Express
- Socket.IO for real-time updates
- In-memory storage for boards and items (no external DB)

## Getting Started

```bash
cd real-time-collaboration-board
npm install
cp .env.example .env
npm start
```

The server will start on `http://localhost:4002`.

## REST Endpoints

- `GET /health` – health check
- `GET /api/boards` – list all boards
- `POST /api/boards` – create a board  
  ```json
  { "name": "Sprint Planning" }
  ```

## Socket.IO Events

- `join_board` – join a specific board room  
  ```js
  socket.emit('join_board', 'board-123');
  ```
- `add_item` – add an item to a board  
  ```js
  socket.emit('add_item', { boardId: 'board-123', content: 'New sticky note' });
  ```

All connected clients on the same board receive `item_added` events in real time.
