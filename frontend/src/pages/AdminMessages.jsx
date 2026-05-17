import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { HiChatAlt2, HiClock, HiPaperAirplane, HiSearch, HiInbox, HiUser, HiPaperClip, HiDocumentDownload, HiX, HiCheck } from 'react-icons/hi';

const AdminMessages = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const [contacts, setContacts] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [attachment, setAttachment] = useState(null); // { url, name }
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const hasInitialSelectedRef = useRef(false);

  const fetchAll = async () => {
    try {
      const [contactsRes, inboxRes] = await Promise.all([
        axios.get('/api/messages/contacts', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/messages', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      const loadedContacts = contactsRes.data.data;
      const loadedInbox = inboxRes.data.data;
      
      setContacts(loadedContacts);
      setInbox(loadedInbox);

      // Auto-select contact with unread message or first contact on mount
      if (!hasInitialSelectedRef.current) {
        if (loadedInbox.length > 0) {
          const unreadMsg = loadedInbox.find(msg => !msg.is_read && msg.sender_id !== user.id);
          if (unreadMsg) {
            let targetContact = null;
            if (user.role === 'student') {
              targetContact = loadedContacts.find(c => c.role === unreadMsg.sender_role);
            } else {
              targetContact = loadedContacts.find(c => c.id === unreadMsg.sender_id);
            }
            if (targetContact) {
              setSelectedContact(targetContact);
            }
          } else if (loadedContacts.length > 0) {
            setSelectedContact(loadedContacts[0]);
          }
        } else if (loadedContacts.length > 0) {
          setSelectedContact(loadedContacts[0]);
        }
        hasInitialSelectedRef.current = true;
      }

      // Mark as read
      await axios.put('/api/messages/mark-read', {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContact, inbox]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post('/api/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setAttachment({
        url: res.data.fileUrl,
        name: res.data.fileName
      });
    } catch (err) {
      console.error(err);
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachment) return;

    setSending(true);
    try {
      const isRoleTarget = typeof selectedContact.id === 'string' && selectedContact.id.startsWith('role:');
      const payload = {
        content: messageText,
        attachment_url: attachment ? attachment.url : null,
        file_name: attachment ? attachment.name : null
      };

      if (isRoleTarget) {
        payload.recipient_role = selectedContact.role;
      } else {
        payload.recipient_id = selectedContact.id;
      }

      await axios.post('/api/messages', payload, { headers: { Authorization: `Bearer ${token}` } });
      setMessageText('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchAll();
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const hasUnreadFromContact = (contact) => {
    const isRoleTarget = typeof contact.id === 'string' && contact.id.startsWith('role:');
    
    return inbox.some(msg => {
      if (msg.is_read || msg.sender_id === user.id) return false;
      
      if (isRoleTarget) {
        return msg.sender_role === contact.role && msg.recipient_id === user.id;
      } else {
        return msg.sender_id === contact.id && (msg.recipient_id === user.id || msg.recipient_role === user.role);
      }
    });
  };

  // Get conversation messages for selected contact
  const getConversation = () => {
    if (!selectedContact) return [];
    const isRoleTarget = typeof selectedContact.id === 'string' && selectedContact.id.startsWith('role:');

    return inbox.filter(msg => {
      if (isRoleTarget) {
        return (msg.sender_role === selectedContact.role && msg.recipient_id === user.id) ||
               (msg.sender_id === user.id && msg.recipient_role === selectedContact.role);
      } else {
        return (msg.sender_id === selectedContact.id && (msg.recipient_id === user.id || msg.recipient_role === user.role)) ||
               (msg.sender_id === user.id && msg.recipient_id === selectedContact.id);
      }
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  };

  const filteredContacts = contacts
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const rolePriority = { admin: 1, warden: 2, student: 3 };
      const pA = rolePriority[a.role] || 99;
      const pB = rolePriority[b.role] || 99;
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'bg-rose-500/20 text-rose-400 border-rose-500/20';
    if (role === 'warden') return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
  };

  const renderAttachment = (msg) => {
    if (!msg.attachment_url) return null;
    const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(msg.attachment_url);

    if (isImage) {
      return (
        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
          <img
            src={msg.attachment_url}
            alt="Attachment"
            className="max-w-xs rounded-xl border border-white/10 shadow-lg mt-2 mb-2 hover:opacity-90 transition-opacity cursor-zoom-in"
          />
        </a>
      );
    }

    return (
      <a
        href={msg.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl mt-2 mb-2 transition-all max-w-xs"
      >
        <HiDocumentDownload className="text-2xl text-indigo-400 flex-shrink-0" />
        <div className="text-left min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{msg.file_name || 'Download File'}</p>
          <p className="text-[10px] text-slate-400">Click to view/download</p>
        </div>
      </a>
    );
  };

  const conversation = getConversation();

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      Loading messages...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100" style={{ height: '100vh' }}>
      
      {/* Left Panel: Contacts */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-slate-900/50">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-black text-white mb-1">Messages</h1>
          <p className="text-xs text-slate-500">
            {user.role === 'admin' && 'Message wardens and students'}
            {user.role === 'warden' && 'Message admin and students'}
            {user.role === 'student' && 'Message hostel administration'}
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <HiSearch className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white text-sm outline-none flex-1 placeholder-slate-600"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredContacts.length === 0 ? (
            <div className="text-center text-slate-600 text-sm italic p-8">No contacts found</div>
          ) : filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 text-left ${
                selectedContact?.id === contact.id
                  ? 'bg-indigo-600/20 border border-indigo-500/30'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                {contact.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{contact.name}</p>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getRoleBadgeColor(contact.role)}`}>
                    {contact.role}
                  </span>
                </div>
                {hasUnreadFromContact(contact) && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50 flex-shrink-0"></span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Conversation */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-white/5 bg-slate-900/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg font-bold text-indigo-400">
                {selectedContact.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-black text-white">{selectedContact.name}</h2>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getRoleBadgeColor(selectedContact.role)}`}>
                  {selectedContact.role}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600">
                  <HiChatAlt2 className="text-6xl mb-4 opacity-20" />
                  <p className="text-sm italic">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                conversation.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        {!isMe && (
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">{msg.sender_name}</p>
                        )}
                        <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/10'
                            : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-sm'
                        }`}>
                          {/* Render text if present */}
                          {msg.content && <p>{msg.content}</p>}
                          {/* Render attachment if present */}
                          {renderAttachment(msg)}
                        </div>
                        <p className="text-[10px] text-slate-600 px-1 flex items-center gap-1">
                          <HiClock className="text-[10px]" />
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Compose Box */}
            <div className="border-t border-white/5 bg-slate-900/30 p-4">
              {/* Attachment Preview Card */}
              {attachment && (
                <div className="mb-3 flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl max-w-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <HiDocumentDownload className="text-xl text-indigo-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{attachment.name}</p>
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <HiCheck /> File uploaded successfully
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAttachment(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <HiX className="text-lg" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex gap-3 items-center">
                {/* File Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading || sending}
                  onClick={() => fileInputRef.current?.click()}
                  className={`bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-400 hover:text-white p-3 rounded-xl border border-white/10 transition-all flex items-center justify-center flex-shrink-0 ${
                    uploading ? 'animate-pulse text-indigo-400' : ''
                  }`}
                  title="Upload Image/PDF/etc."
                >
                  <HiPaperClip className="text-xl" />
                </button>

                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={uploading ? "Uploading attachment..." : `Message ${selectedContact.name}...`}
                  disabled={uploading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-all text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || uploading || (!messageText.trim() && !attachment)}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl transition-all flex items-center gap-2 font-bold text-sm h-[46px]"
                >
                  <HiPaperAirplane className="rotate-90" />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <HiInbox className="text-8xl mb-6 opacity-10" />
            <h2 className="text-xl font-bold text-slate-500 mb-2">Select a contact</h2>
            <p className="text-sm">Choose someone from the left panel to start a conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
