import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Send, User, AlertTriangle, ShieldAlert } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';

export const Chatbot = () => {
    const { user } = useAuthStore();
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const initChat = async () => {
            try {
                const res = await api.post('/chatbot/session');
                setSessionId(res.data.data.id);
            } catch(e) { console.error('Chat context initialization failed', e); }
        };
        initChat();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if(!input.trim() || !sessionId) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'USER', message: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post(`/chatbot/${sessionId}/chat`, { message: userMsg });
            setMessages(prev => [...prev, res.data.data]);
        } catch(err) {
            setMessages(prev => [...prev, { id: 'error', sender: 'AI', message: "System error: Unable to reach secure moderation proxies." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-4 shadow-sm items-start">
                <ShieldAlert className="text-orange-600 shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-orange-900 font-bold tracking-tight">Clinical Disclaimer</h3>
                    <p className="text-orange-800 text-sm mt-1 leading-relaxed">I am the Health Assistant AI, not a licensed medical professional. I cannot diagnose conditions or prescribe medications. If this is a medical emergency, please call 911 or visit an emergency room immediately.</p>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border-t-[6px] border-t-blue-600">
                <CardHeader className="bg-white border-b border-slate-100 pb-4 shadow-sm z-10">
                    <CardTitle className="flex items-center justify-between text-blue-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 text-white shadow-sm rounded-lg"><Bot size={22} /></div>
                            <div>
                                <span className="font-extrabold tracking-tight">Health Assistant</span>
                                <div className="text-xs font-semibold uppercase tracking-wider text-green-500 flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Secure RAG Link Active
                                </div>
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 mt-12 text-sm font-medium">
                            Semantic session secured. How can I assist with general guidance today?
                        </div>
                    )}
                    
                    {messages.map(m => {
                        const isUser = m.sender === 'USER';
                        const isEmergency = m.message.includes('EMERGENCY WARNING');
                        return (
                            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isUser ? 'bg-white border-slate-200 text-slate-500' : 'bg-blue-600 border-transparent text-white'}`}>
                                        {isUser ? <User size={18} /> : <Bot size={18} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-[15px] shadow-sm ${
                                        isUser ? 'bg-blue-600 text-white rounded-tr-none' : 
                                        isEmergency ? 'bg-red-50 border-2 border-red-200 text-red-900 rounded-tl-none font-medium' : 
                                        'bg-white border border-slate-200 border-b-slate-300 text-slate-700 rounded-tl-none leading-relaxed'
                                    }`}>
                                        <div className="whitespace-pre-wrap">{m.message}</div>
                                        {isEmergency && (
                                            <div className="mt-5 flex gap-3">
                                                <Button variant="destructive" size="default" className="shadow-sm font-bold tracking-wide" onClick={() => window.location.href='tel:911'}><AlertTriangle size={16} className="mr-2" /> Dial 911 Now</Button>
                                                <Link to="/appointments"><Button variant="outline" size="default" className="bg-white text-red-700 border-red-200 hover:bg-red-50 font-bold">Find Doctor</Button></Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="flex gap-3 max-w-[80%] flex-row">
                                 <div className="w-9 h-9 rounded-full bg-blue-600 border-transparent text-white flex items-center justify-center shrink-0 shadow-sm"><Bot size={18} /></div>
                                 <div className="p-4 py-5 rounded-2xl bg-white border border-slate-200 text-slate-400 rounded-tl-none flex gap-2.5 items-center shadow-sm">
                                     <div className="w-2.5 h-2.5 bg-blue-400/50 rounded-full animate-bounce"></div>
                                     <div className="w-2.5 h-2.5 bg-blue-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                     <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                 </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.02)] z-10">
                    <form onSubmit={handleSend} className="flex gap-3 relative max-w-3xl mx-auto">
                        <input 
                            type="text" 
                            disabled={loading || !sessionId}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a general health question here..." 
                            className="flex-1 border-2 border-slate-200 rounded-xl px-5 py-3.5 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 disabled:bg-slate-50 disabled:text-slate-400 transition-all font-medium text-slate-700"
                        />
                        <Button type="submit" disabled={loading || !input.trim()} className="px-8 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm transition-all h-auto disabled:opacity-50">
                            <Send size={20} className={loading || !input.trim() ? "translate-x-0" : "translate-x-1 transition-transform"} />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};
