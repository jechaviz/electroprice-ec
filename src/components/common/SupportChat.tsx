import React, { useState, useRef, useEffect } from 'react';
import { services } from '../../services/ServiceContainer';

const SupportChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState<{ role: 'user' | 'model'; text: string }[]>([
        { role: 'model', text: 'Hi! How can I help you with your orders or products today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isTyping) return;

        const userMsg = message;
        setMessage('');
        setChat(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            const reply = await services.support.sendMessage(userMsg);
            setChat(prev => [...prev, { role: 'model', text: reply }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[100] h-14 w-14 rounded-full bg-primary text-primary-content shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
            >
                <i className="fa-solid fa-headset text-xl group-hover:rotate-12 transition-transform"></i>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-accent border-2 border-primary"></span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[110] w-full max-w-[380px] h-[500px] bg-base-200/90 backdrop-blur-2xl rounded-[2rem] border border-base-content/10 shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="bg-primary p-6 text-primary-content flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <i className="fa-solid fa-robot text-lg"></i>
                    </div>
                    <div>
                        <p className="font-black leading-tight">AI Support</p>
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Always Online</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {chat.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-content rounded-tr-none' : 'bg-base-300 text-base-content rounded-tl-none border border-base-content/5'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-base-300 p-4 rounded-2xl rounded-tl-none">
                            <span className="loading loading-dots loading-xs"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-base-300/50 border-t border-base-content/5 flex gap-2">
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about your orders..."
                    className="flex-1 bg-base-100 border border-base-content/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary transition-colors"
                />
                <button type="submit" disabled={isTyping || !message.trim()} className="h-11 w-11 rounded-xl bg-primary text-primary-content flex items-center justify-center disabled:opacity-50 shadow-lg shadow-primary/20">
                    <i className="fa-solid fa-paper-plane text-sm"></i>
                </button>
            </form>
        </div>
    );
};

export default SupportChat;
