"use client";

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function ChatBox({ currentRole, currentId, targetRole, targetId, targetName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(window.location.origin, {
      path: '/socket.io',
    });
    setSocket(newSocket);

    // Join personal room
    newSocket.emit('join_room', { role: currentRole, id: currentId });

    // Listen for incoming messages
    newSocket.on('receive_message', (message) => {
      // Check if message is from the currently opened chat
      if (
        (message.senderGuruId === parseInt(targetId) && targetRole === 'guru') ||
        (message.senderSiswaId === parseInt(targetId) && targetRole === 'siswa')
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for echo of sent messages
    newSocket.on('message_sent', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => newSocket.close();
  }, [currentRole, currentId, targetRole, targetId]);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      senderRole: currentRole,
      senderId: currentId,
      receiverRole: targetRole,
      receiverId: targetId,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg shadow-sm bg-white overflow-hidden">
      <div className="p-4 bg-sky-500 text-white font-semibold">
        Chat dengan {targetName}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isSender = 
            (currentRole === 'guru' && msg.senderGuruId === parseInt(currentId)) ||
            (currentRole === 'siswa' && msg.senderSiswaId === parseInt(currentId));

          return (
            <div key={idx} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${isSender ? 'bg-sky-100 text-sky-900 rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t bg-slate-50 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-sky-500 text-white px-4 py-2 rounded-full hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}
