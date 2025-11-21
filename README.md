# Real-Time Collaboration Board — Backend 

## Run server

```bash
cd server
npm install
cp .env.example .env
npm start
```

## Run client

```bash
cd client
npm install
npm run dev
```

Client expects server on http://localhost:4002
  socket.emit('add_item', { boardId: 'board-123', content: 'New sticky note' });
  ```

All connected clients on the same board receive `item_added` events in real time.
