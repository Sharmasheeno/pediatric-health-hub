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
    const [language, setLanguage] = useState('en');
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
            const res = await api.post(`/chatbot/${sessionId}/chat`, { message: userMsg, language });
            setMessages(prev => [...prev, res.data.data]);
        } catch {
            const isSomali = language === 'so' || /(?:asc|asalaamu calaykum|ilmahayg(?:a|u)|qandho|xummad|qufac|tallaal|nafaqo|matag|shuban|hurdo|koritaan|maxaan sameeyaa)/i.test(userMsg);
            const message = isSomali
                ? 'Cilad ayaa dhacday. Fadlan mar kale isku day.'
                : 'A system error occurred. Please try again.';
            setMessages(prev => [...prev, { id: 'error', sender: 'AI', message }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto flex h-[calc(100dvh-15rem)] min-h-[400px] w-full min-w-0 max-w-4xl flex-col gap-2 sm:h-[calc(100dvh-12rem)] sm:min-h-[320px] sm:gap-4">
            <details className="shrink-0 rounded-[var(--radius-md)] border border-warning/30 bg-warning/10 px-3 py-2 shadow-[var(--shadow-sm)] sm:hidden">
                <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                    <ShieldAlert size={18} className="shrink-0 text-warning" />
                    <span className="truncate">Clinical disclaimer / Ogeysiis Caafimaad</span>
                    <span aria-hidden="true" className="ml-auto text-xs text-[var(--text-muted)]">Read</span>
                </summary>
                <p className="mt-2 border-t border-warning/20 pt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{branding.assistantDisclaimer}</p>
            </details>
            <div className="hidden shrink-0 items-start gap-3 rounded-[var(--radius-md)] border border-warning/30 bg-warning/10 p-3 shadow-[var(--shadow-sm)] sm:flex sm:gap-4 sm:p-4">
                <ShieldAlert className="text-warning shrink-0 mt-0.5" />
                <div className="min-w-0">
                    <h3 className="text-[var(--text-primary)] font-bold tracking-tight">Clinical Disclaimer / Ogeysiis Caafimaad</h3>
                    <p className="text-[var(--text-secondary)] text-xs mt-1 leading-relaxed sm:text-sm">{branding.assistantDisclaimer}</p>
                </div>
            </div>

            <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t-4 border-t-primary-600">
                <CardHeader className="shrink-0 flex-nowrap gap-2 px-3 py-2.5 sm:flex-wrap sm:gap-3 sm:px-6 sm:py-4">
                    <CardTitle className="min-w-0 flex-1 text-primary-700 dark:text-primary-400">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <div className="shrink-0 rounded-[var(--radius-md)] bg-primary-600 p-2 text-[var(--color-primary-foreground)] shadow-sm sm:p-2.5"><Bot size={20} /></div>
                            <div className="min-w-0">
                                <span className="block truncate font-bold tracking-tight">{branding.assistantName}</span>
                                <div className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-[9px] font-semibold uppercase tracking-wide text-success sm:text-xs sm:tracking-wider">
                                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div> English & Somali Guidance Ready
                                </div>
                            </div>
                        </div>
                    </CardTitle>
                    <div role="group" aria-label="Choose assistant language" className="flex w-[148px] shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 sm:w-auto">
                        <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')} className={`min-h-9 flex-1 rounded-md px-2 text-xs font-semibold transition-colors sm:px-3 sm:text-sm sm:flex-none ${language === 'en' ? 'bg-primary-600 text-[var(--color-primary-foreground)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]'}`}>English</button>
                        <button type="button" aria-pressed={language === 'so'} onClick={() => setLanguage('so')} className={`min-h-9 flex-1 rounded-md px-2 text-xs font-semibold transition-colors sm:px-3 sm:text-sm sm:flex-none ${language === 'so' ? 'bg-primary-600 text-[var(--color-primary-foreground)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]'}`}>Soomaali</button>
                    </div>
                </CardHeader>

                <CardContent className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[var(--surface-soft)] p-3 text-[15px] sm:space-y-6 sm:p-6 sm:text-base">
                    {messages.length === 0 && (
                        <div className="mx-auto mt-3 max-w-xl text-center text-xs font-medium leading-relaxed text-[var(--text-muted)] sm:mt-8 sm:text-sm">
                            {language === 'so'
                                ? `Ku soo dhawoow ${branding.assistantName}. Su'aashaada ku qor Af-Soomaali; sheeg da'da ilmaha iyo calaamadaha haddii ay khusayso.`
                                : `Welcome to the ${branding.assistantName}. Ask in English about your child's health, and include their age and symptoms when relevant.`}
                        </div>
                    )}

                    {messages.map(m => {
                        const isUser = m.sender === 'USER';
                        const isSomaliEmergency = m.message.includes('DIGNIIN DEGDEG AH');
                        const isEmergency = m.message.includes('EMERGENCY WARNING') || isSomaliEmergency;
                        return (
                            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex min-w-0 gap-2 sm:gap-3 max-w-[92%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isUser ? 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]' : 'bg-primary-600 border-transparent text-[var(--color-primary-foreground)]'}`}>
                                        {isUser ? <User size={18} /> : <Bot size={18} />}
                                    </div>
                                    <div className={`min-w-0 break-words p-3 rounded-2xl text-sm shadow-sm sm:p-4 sm:text-[15px] ${
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

                <div className="z-10 shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-2.5 sm:p-4">
                    <form onSubmit={handleSend} className="relative mx-auto flex w-full max-w-3xl min-w-0 gap-2 sm:gap-3">
                        <input
                            type="text"
                            disabled={loading || !sessionId}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            aria-label={language === 'so' ? 'Su’aashaada caafimaad' : 'Your health question'}
                            placeholder={language === 'so' ? 'Ku qor su’aashaada caafimaad…' : 'Type your health question…'}
                            className="min-w-0 flex-1 border-2 border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-3 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/10 disabled:opacity-50 transition-all sm:px-5 sm:py-3.5 sm:text-base"
                        />
                        <Button type="submit" aria-label={language === 'so' ? 'Dir su’aasha' : 'Send question'} disabled={loading || !input.trim() || !sessionId} className="h-auto shrink-0 rounded-[var(--radius-sm)] px-4 sm:px-8">
                            <Send size={18} className={loading || !input.trim() ? "translate-x-0" : "translate-x-1 transition-transform"} />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};
