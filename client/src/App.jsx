import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4002');

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    fetch('http://localhost:4002/api/boards')
      .then((r) => r.json())
      .then(setBoards);

    socket.on('board_created', (board) => {
      setBoards((prev) => [...prev, board]);
    });

    socket.on('item_added', ({ boardId, item }) => {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === boardId ? { ...b, items: [...b.items, item] } : b
        )
      );
    });

    return () => {
      socket.off('board_created');
      socket.off('item_added');
    };
  }, []);

  const createBoard = async () => {
    if (!newBoardName.trim()) return;
    const res = await fetch('http://localhost:4002/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBoardName })
    });
    if (res.ok) {
      const board = await res.json();
      setBoards((prev) => [...prev, board]);
      setNewBoardName('');
    }
  };

  const joinBoard = (board) => {
    setSelectedBoard(board);
    socket.emit('join_board', board.id);
  };

  const addItem = () => {
    if (!selectedBoard || !newItem.trim()) return;
    socket.emit('add_item', { boardId: selectedBoard.id, content: newItem });
    setNewItem('');
  };

  const activeBoard = boards.find((b) => b.id === selectedBoard?.id) || selectedBoard;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ width: 260, borderRight: '1px solid #ccc', padding: 16 }}>
        <h2>Boards</h2>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <input
            style={{ flex: 1 }}
            placeholder="New board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
          />
          <button onClick={createBoard}>+</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {boards.map((b) => (
            <li key={b.id}>
              <button style={{ width: '100%', textAlign: 'left' }} onClick={() => joinBoard(b)}>
                {b.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, padding: 16 }}>
        {activeBoard ? (
          <>
            <h2>{activeBoard.name}</h2>
            <div style={{ marginBottom: 8 }}>
              <input
                style={{ width: '70%' }}
                placeholder="New item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <button style={{ marginLeft: 8 }} onClick={addItem}>
                Add
              </button>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 8
              }}
            >
              {(activeBoard.items || []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    padding: 8,
                    background: '#fffbe6'
                  }}
                >
                  <div>{item.content}</div>
                  <small>{new Date(item.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Select or create a board to begin.</p>
        )}
      </div>
    </div>
  );
}

export default App;
