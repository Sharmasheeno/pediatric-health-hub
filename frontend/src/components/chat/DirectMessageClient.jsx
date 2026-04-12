import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import { Card, CardContent } from '../ui/Card';
import { Send, User, Bot, MessageSquare } from 'lucide-react';

export const DirectMessageClient = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);

    const [activeContact, setActiveContact] = useState(null);
    const [messageInput, setMessageInput] = useState('');

    const { data: contacts } = useQuery({
        queryKey: ['chatContacts'],
        queryFn: async () => {
            const res = await api.get('/chat/contacts');
            return res.data.data;
        }
    });

    const { data: messages } = useQuery({
        queryKey: ['chatMessages', activeContact?.id],
        queryFn: async () => {
            if(!activeContact) return [];
            const res = await api.get(`/chat/${activeContact.id}`);
            return res.data.data;
        },
        enabled: !!activeContact?.id,
        refetchInterval: 3000 // Poll every 3s
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
        if(messageInput.trim() && activeContact) {
            sendMessage.mutate(messageInput.trim());
        }
    };

    if(!contacts || contacts.length === 0) {
        return null; // Don't render chat if no contacts exist
    }

    return (
        <Card className="mb-10 border border-slate-100 shadow-sm bg-white overflow-hidden rounded-xl">
            <div className="flex flex-col md:flex-row h-[450px]">
                
                {/* Contacts Sidebar */}
                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-100">
                        <h3 className="font-black text-slate-700 flex items-center gap-2"><MessageSquare size={16}/> Direct Messages</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {contacts.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveContact(c)}
                                className={`w-full text-left px-5 py-4 border-b border-slate-100 transition-colors ${activeContact?.id === c.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-100 border-l-4 border-l-transparent'}`}
                            >
                                <div className="font-bold text-sm text-slate-800 tracking-tight">{c.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="w-full md:w-2/3 flex flex-col bg-slate-50 border-t sm:border-t-0 p-4">
                    {activeContact ? (
                        <>
                            <div className="font-black text-[#6c7293] uppercase tracking-widest text-[11px] mb-4 pb-2 border-b border-slate-200">
                                Chatting securely with: {activeContact.name}
                            </div>
                            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4 px-2">
                                {(messages || []).length === 0 ? (
                                     <div className="m-auto text-sm font-medium text-slate-400">No previous messages. Start a secure thread!</div>
                                ) : (
                                    messages.map(m => {
                                        const isMe = m.senderId === user.id;
                                        return (
                                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-3 px-4 max-w-[80%] rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                                                    {m.content}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder={`Message ${activeContact.name.split(' ')[0]}...`}
                                    className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500"
                                    disabled={sendMessage.isLoading}
                                />
                                <button type="submit" disabled={!messageInput.trim() || sendMessage.isLoading} className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center">
                                    <Send size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                         <div className="m-auto flex flex-col items-center justify-center text-slate-400">
                             <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-3"><MessageSquare size={24} className="text-slate-400"/></div>
                             <span className="font-bold tracking-tight">Select a contact to connect directly.</span>
                         </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
