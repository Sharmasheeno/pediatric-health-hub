import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Send, ShieldAlert, User } from 'lucide-react';

const STARTER_PROMPTS = [
    'General pediatric guidance',
    'Latest child health record',
    'Vaccine guidance',
    'How to book appointment'
];

export const Chatbot = () => {
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const initChat = async () => {
            try {
                setErrorMsg('');
                const sessionRes = await api.post('/chatbot/session');
                const id = sessionRes.data.data.id;
                setSessionId(id);

                const historyRes = await api.get(`/chatbot/${id}/history`);
                const history = historyRes?.data?.data || [];
                setMessages(history);
            } catch (error) {
                setErrorMsg(error.response?.data?.message || 'Unable to initialize chatbot');
            }
        };
        initChat();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || !sessionId || loading) return;

        const localUserMessage = {
            id: `local-user-${Date.now()}`,
            sender: 'USER',
            message: trimmed
        };

        setInput('');
        setMessages((prev) => [...prev, localUserMessage]);
        setLoading(true);
        setErrorMsg('');

        try {
            const res = await api.post(`/chatbot/${sessionId}/chat`, { message: trimmed });
            setMessages((prev) => [...prev, res.data.data]);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to get chatbot response';
            setErrorMsg(msg);
            setMessages((prev) => [
                ...prev,
                {
                    id: `local-ai-error-${Date.now()}`,
                    sender: 'AI',
                    message: 'I hit a temporary issue. Please try again.'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        await sendMessage(input);
    };

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-130px)] flex flex-col space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-4 shadow-sm items-start">
                <ShieldAlert className="text-orange-600 shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-orange-900 font-bold tracking-tight">Clinical Disclaimer</h3>
                    <p className="text-orange-800 text-sm mt-1 leading-relaxed">
                        I am the Health Assistant AI, not a licensed medical professional. I cannot diagnose conditions or prescribe medications.
                        If this is a medical emergency, please call 911 or visit an emergency room immediately.
                    </p>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="flex items-center gap-3 text-slate-800">
                        <div className="p-2 bg-slate-900 text-white rounded-lg"><Bot size={20} /></div>
                        <div>
                            <div className="font-bold">Pediatric Health Assistant</div>
                            <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">ChatGPT-style Workspace</div>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-slate-50/70">
                        {messages.length === 0 && !loading && (
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center text-slate-500 mb-6">Ask anything about pediatric care and this app workflow.</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {STARTER_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            type="button"
                                            onClick={() => sendMessage(prompt)}
                                            className="text-left p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-sm text-slate-700 transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            {messages.map((m) => {
                                const isUser = m.sender === 'USER';
                                return (
                                    <div key={m.id} className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[92%] sm:max-w-[80%] rounded-2xl border px-4 py-3 shadow-sm ${
                                            isUser
                                                ? 'bg-slate-900 text-white border-slate-900 rounded-br-md'
                                                : 'bg-white text-slate-800 border-slate-200 rounded-bl-md'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-2 text-xs font-semibold opacity-75 uppercase tracking-wide">
                                                {isUser ? <User size={14} /> : <Bot size={14} />}
                                                {isUser ? 'You' : 'Assistant'}
                                            </div>
                                            <div className="whitespace-pre-wrap leading-relaxed">{m.message}</div>
                                        </div>
                                    </div>
                                );
                            })}

                            {loading && (
                                <div className="w-full flex justify-start">
                                    <div className="max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-3 rounded-bl-md shadow-sm">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                            <Bot size={14} />
                                            Assistant
                                        </div>
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.12s' }}></div>
                                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.24s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
                        {errorMsg && <div className="text-sm text-red-600 mb-2">{errorMsg}</div>}
                        <form onSubmit={onSubmit} className="flex gap-2 sm:gap-3">
                            <input
                                type="text"
                                value={input}
                                disabled={!sessionId || loading}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={sessionId ? 'Message Pediatric Health Assistant...' : 'Initializing chat...'}
                                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                            <Button
                                type="submit"
                                disabled={!sessionId || loading || !input.trim()}
                                className="rounded-xl px-4 sm:px-5 bg-slate-900 hover:bg-black"
                            >
                                <Send size={16} />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
