import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import { Send, MessageSquare, User, Inbox, Clock } from 'lucide-react';

export const DoctorInbox = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);

    const [activeContact, setActiveContact] = useState(null);
    const [messageInput, setMessageInput] = useState('');

    const { data: contacts, isLoading: loadingContacts } = useQuery({
        queryKey: ['chatContacts'],
        queryFn: async () => {
            const res = await api.get('/chat/contacts');
            return res.data.data;
        }
    });

    const { data: messages } = useQuery({
        queryKey: ['chatMessages', activeContact?.id],
        queryFn: async () => {
            if (!activeContact) return [];
            const res = await api.get(`/chat/${activeContact.id}`);
            return res.data.data;
        },
        enabled: !!activeContact?.id,
        refetchInterval: 3000
    });

    const sendMessage = useMutation({
        mutationFn: async (content) => {
            await api.post('/chat', { receiverId: activeContact.id, content });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['chatMessages', activeContact?.id]);
            setMessageInput('');
        }
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (messageInput.trim() && activeContact) {
            sendMessage.mutate(messageInput.trim());
        }
    };

    return (
        <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fade-in font-sans">
            {/* Header */}
            <div className="bg-[--surface] rounded-xl shadow-sm border border-[--border] p-6 sm:p-8 flex items-center gap-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary-50 dark:bg-primary-9500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm z-10">
                    <Inbox size={28} strokeWidth={2.5} />
                </div>
                <div className="z-10">
                    <h1 className="text-2xl font-black text-[--text-primary] tracking-tight">
                        {user?.role === 'DOCTOR' ? 'Parent Messages' : 'Doctor Messages'}
                    </h1>
                    <p className="text-[--text-secondary] font-medium text-sm mt-1">
                        {user?.role === 'DOCTOR'
                            ? 'View and respond to messages from parents of your patients.'
                            : 'Send messages to your pediatrician and receive responses.'}
                    </p>
                </div>
            </div>

            {/* Messaging Panel */}
            <div className="bg-[--surface] rounded-xl border border-[--border] shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row h-[520px]">
                    {/* Contacts Sidebar */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[--border] bg-[--surface-soft] flex flex-col">
                        <div className="p-4 border-b border-[--border] bg-[--surface-soft]/80">
                            <h3 className="font-black text-[--text-primary] text-sm flex items-center gap-2">
                                <MessageSquare size={15} />
                                {user?.role === 'DOCTOR' ? 'My Patients\' Parents' : 'Available Doctors'}
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loadingContacts ? (
                                <div className="p-6 text-center text-[--text-muted] text-xs font-bold uppercase tracking-widest animate-pulse">Loading contacts...</div>
                            ) : contacts?.length > 0 ? (
                                contacts.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setActiveContact(c)}
                                        className={`w-full text-left px-5 py-4 border-b border-[--border] transition-all ${activeContact?.id === c.id ? 'bg-primary-50 dark:bg-primary-950 border-l-4 border-l-blue-600' : 'hover:bg-[--surface] border-l-4 border-l-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-[--text-primary] tracking-tight">{c.name}</div>
                                                <div className="text-[10px] text-[--text-muted] font-semibold uppercase tracking-wider mt-0.5">{c.role}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-[--surface-soft] text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <MessageSquare size={20} />
                                    </div>
                                    <p className="text-sm font-bold text-[--text-muted]">No contacts yet</p>
                                    <p className="text-xs text-[--text-muted] mt-1">
                                        {user?.role === 'DOCTOR' ? 'Parents will appear here once they have appointments with you.' : 'Book an appointment to start messaging a doctor.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="w-full md:w-2/3 flex flex-col">
                        {activeContact ? (
                            <>
                                {/* Chat Header */}
                                <div className="px-5 py-3 border-b border-[--border] bg-[--surface] flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black">
                                        {activeContact.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-[--text-primary]">{activeContact.name}</div>
                                        <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Online
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-5 bg-[--surface-soft]/50">
                                    {(messages || []).length === 0 ? (
                                        <div className="m-auto flex flex-col items-center text-[--text-muted]">
                                            <Clock size={28} className="mb-2 text-slate-300" />
                                            <span className="text-sm font-bold">No messages yet</span>
                                            <span className="text-xs mt-1">Send the first message to start the conversation.</span>
                                        </div>
                                    ) : (
                                        messages.map(m => {
                                            const isMe = m.senderId === user.id;
                                            return (
                                                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`p-3 px-4 max-w-[75%] rounded-2xl text-sm font-medium shadow-sm ${isMe
                                                        ? 'bg-blue-600 text-white rounded-br-none'
                                                        : 'bg-[--surface] border border-[--border] text-[--text-primary] rounded-bl-none'
                                                    }`}>
                                                        {m.content}
                                                        <div className={`text-[10px] mt-1.5 ${isMe ? 'text-blue-200' : 'text-[--text-muted]'}`}>
                                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-[--border] bg-[--surface]">
                                    <form onSubmit={handleSend} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder={`Type a message to ${activeContact.name.split(' ')[0]}...`}
                                            className="flex-1 px-4 py-3 border-2 border-[--border] rounded-xl text-sm font-medium bg-[--surface] text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                                            disabled={sendMessage.isLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!messageInput.trim() || sendMessage.isLoading}
                                            className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm disabled:opacity-40 flex items-center justify-center"
                                        >
                                            <Send size={17} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-[--text-muted] bg-[--surface-soft]/30">
                                <div className="w-20 h-20 bg-[--surface-soft] rounded-full flex items-center justify-center mb-4">
                                    <Inbox size={32} className="text-slate-300" />
                                </div>
                                <span className="font-bold text-lg text-[--text-secondary] tracking-tight">Select a conversation</span>
                                <span className="text-sm mt-1">Choose a contact from the left to view messages.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
