import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

export default function Chat() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [activeContact, setActiveContact] = useState(null);
  const [activeUserId, setActiveUserId] = useState(userId || null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
    socketRef.current = io(socketUrl);
    socketRef.current.emit('user_connected', user.id);
    socketRef.current.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socketRef.current.disconnect();
  }, [user.id]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeUserId) {
      fetchMessages(activeUserId);
      fetchUserInfo(activeUserId);
    }
  }, [activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const { data } = await axios.get('/api/messages/contacts/list');
      setContacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (uid) => {
    try {
      const { data } = await axios.get(`/api/messages/${uid}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserInfo = async (uid) => {
    try {
      const { data } = await axios.get(`/api/users/${uid}`);
      setActiveContact(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUserId) return;

    const msgData = {
      senderId: user.id,
      receiverId: activeUserId,
      text,
      createdAt: new Date().toISOString()
    };

    try {
      await axios.post('/api/messages', { receiverId: activeUserId, text });
      socketRef.current.emit('send_message', msgData);
      setMessages(prev => [...prev, { ...msgData, sender: user.id }]);
      setText('');
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const selectContact = (contactId) => {
    setActiveUserId(contactId);
    navigate(`/chat/${contactId}`);
  };

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Messages</h3>
        </div>
        {contacts.length === 0 ? (
          <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            No conversations yet. Start by contacting a provider or customer.
          </div>
        ) : (
          contacts.map(contact => (
            <div
              key={contact._id}
              className={`contact-item ${activeUserId === contact._id ? 'active' : ''}`}
              onClick={() => selectContact(contact._id)}
            >
              <div className="contact-avatar">{contact.name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{contact.name}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {!activeUserId ? (
          <div className="chat-empty">
            <p>💬 Select a conversation or start a new one</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="contact-avatar">{activeContact?.name?.[0]?.toUpperCase() || '?'}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{activeContact?.name || 'Loading...'}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{activeContact?.city}</div>
              </div>
            </div>

            <div className="messages-area">
              {messages.map((msg, i) => {
                const isMine = (msg.sender === user.id || msg.sender?._id === user.id || msg.senderId === user.id);
                return (
                  <div key={i} className={`message ${isMine ? 'mine' : 'theirs'}`}>
                    <div className="message-bubble">{msg.text}</div>
                    <div className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message..."
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
