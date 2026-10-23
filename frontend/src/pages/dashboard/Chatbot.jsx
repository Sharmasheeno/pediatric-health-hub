import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bot, Send, User, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useBranding } from '../../contexts/useBranding';

const renderInlineMessage = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
    part.startsWith('**') && part.endsWith('**')
        ? <strong key={index}>{part.slice(2, -2)}</strong>
        : part
));

const renderMessage = (message) => message.split('\n').map((line, index) => {
    if (!line.trim()) return <div key={index} className="h-2" />;
    if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={index} className="flex gap-2 pl-1"><span aria-hidden="true">•</span><span>{renderInlineMessage(line.slice(2))}</span></div>;
    }
    return <div key={index}>{renderInlineMessage(line)}</div>;
});

export const Chatbot = () => {
    const branding = useBranding();
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
                const id = res.data.data.id;
                setSessionId(id);

                // Fetch historical messages to persist context
                const historyRes = await api.get(`/chatbot/${id}/history`);
                if (historyRes.data.data && historyRes.data.data.length > 0) {
                    setMessages(historyRes.data.data);
                }
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
        } catch {
            const isSomali = /(?:asc|asalaamu calaykum|ilmahayg(?:a|u)|qandho|xummad|qufac|tallaal|nafaqo|matag|shuban|hurdo|koritaan|maxaan sameeyaa)/i.test(userMsg);
            const message = isSomali
                ? 'Cilad ayaa dhacday. Fadlan mar kale isku day.'
                : 'A system error occurred. Please try again.';
            setMessages(prev => [...prev, { id: 'error', sender: 'AI', message }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col space-y-4">
            <div className="bg-warning/10 border border-warning/30 rounded-[var(--radius-md)] p-4 flex gap-4 shadow-[var(--shadow-sm)] items-start">
                <ShieldAlert className="text-warning shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-[var(--text-primary)] font-bold tracking-tight">Clinical Disclaimer / Ogeysiis Caafimaad</h3>
                    <p className="text-[var(--text-secondary)] text-sm mt-1 leading-relaxed">{branding.assistantDisclaimer}</p>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-t-4 border-t-primary-600">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-primary-700 dark:text-primary-400">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary-600 text-[var(--color-primary-foreground)] shadow-sm rounded-[var(--radius-md)]"><Bot size={22} /></div>
                            <div>
                                <span className="font-bold tracking-tight">{branding.assistantName}</span>
                                <div className="text-xs font-semibold uppercase tracking-wider text-success flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div> English & Somali Guidance Ready
                                </div>
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[var(--surface-soft)]">
                    {messages.length === 0 && (
                        <div className="text-center text-[var(--text-muted)] mt-12 text-sm font-medium">
                            👋 Welcome to the {branding.assistantName}. You can ask in English or Somali about your child's health. / Ku soo dhawoow {branding.assistantName}. Waxaad su'aashaada ku qori kartaa Ingiriisi ama Soomaali; marka ay khusayso, sheeg da'da ilmaha iyo calaamadaha.
                        </div>
                    )}

                    {messages.map(m => {
                        const isUser = m.sender === 'USER';
                        const isSomaliEmergency = m.message.includes('DIGNIIN DEGDEG AH');
                        const isEmergency = m.message.includes('EMERGENCY WARNING') || isSomaliEmergency;
                        return (
                            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isUser ? 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]' : 'bg-primary-600 border-transparent text-[var(--color-primary-foreground)]'}`}>
                                        {isUser ? <User size={18} /> : <Bot size={18} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-[15px] shadow-sm ${
                                        isUser ? 'bg-primary-600 text-[var(--color-primary-foreground)] rounded-tr-none' :
                                        isEmergency ? 'bg-danger/10 border-2 border-danger/30 text-[var(--text-primary)] rounded-tl-none font-medium' :
                                        'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-none leading-relaxed'
                                    }`}>
                                        <div>{renderMessage(m.message)}</div>
                                        {isEmergency && (
                                            <div className="mt-5 flex gap-3">
                                                <span className="inline-flex items-center text-sm font-bold text-danger"><AlertTriangle size={16} className="mr-2" />{isSomaliEmergency ? 'La xiriir adeegga gurmadka hadda' : 'Contact local emergency services now'}</span>
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
                                 <div className="w-9 h-9 rounded-full bg-primary-600 border-transparent text-[var(--color-primary-foreground)] flex items-center justify-center shrink-0 shadow-sm"><Bot size={18} /></div>
                                 <div className="p-4 py-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] rounded-tl-none flex gap-2.5 items-center shadow-sm">
                                     <div className="w-2.5 h-2.5 bg-primary-400/50 rounded-full animate-bounce"></div>
                                     <div className="w-2.5 h-2.5 bg-primary-400/80 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                     <div className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                 </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] z-10">
                    <form onSubmit={handleSend} className="flex gap-3 relative max-w-3xl mx-auto">
                        <input
                            type="text"
                            disabled={loading || !sessionId}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask in English or Somali... / Su'aashaada ku qor Ingiriisi ama Soomaali..."
                            className="flex-1 border-2 border-[var(--border)] rounded-[var(--radius-sm)] px-5 py-3.5 bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 disabled:opacity-50 transition-all font-medium"
                        />
                        <Button type="submit" disabled={loading || !input.trim()} className="px-8 rounded-[var(--radius-sm)] h-auto">
                            <Send size={20} className={loading || !input.trim() ? "translate-x-0" : "translate-x-1 transition-transform"} />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};
