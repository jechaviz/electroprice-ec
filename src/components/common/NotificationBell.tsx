import React, { useState } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { useNavigate } from 'react-router-dom';
import { notificationsSignal, unreadCountSignal } from '../../services/NotificationService';
import { services } from '../../services/ServiceContainer';
import { useTranslation } from '../../hooks/useTranslation';

const NotificationBell: React.FC = () => {
    useSignals();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleNotificationClick = (id: string, link?: string) => {
        services.notification.markAsRead(id);
        if (link) {
            navigate(link);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost btn-circle relative group"
                aria-label={t('notification.open')}
            >
                <i className="fa-solid fa-bell text-xl text-base-content/70 group-hover:text-primary transition-colors" aria-hidden="true"></i>
                {unreadCountSignal.value > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-primary text-primary-content text-[10px] font-black rounded-full flex items-center justify-center border-2 border-base-100 shadow-lg animate-bounce">
                        {unreadCountSignal.value}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-80 max-h-[500px] bg-base-200/90 backdrop-blur-2xl rounded-3xl border border-base-content/10 shadow-2xl z-[150] overflow-hidden flex flex-col animate-fade-in-up">
                    <div className="p-4 border-b border-base-content/5 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest">{t('notification.title')}</h3>
                        <button 
                            onClick={() => services.notification.markAllAsRead()}
                            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter"
                        >
                            {t('notification.markAllRead')}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {notificationsSignal.value.length > 0 ? (
                            notificationsSignal.value.map(n => (
                                <button
                                    type="button"
                                    key={n.id} 
                                    onClick={() => handleNotificationClick(n.id, n.link)}
                                    className={`block w-full p-4 text-left border-b border-base-content/5 cursor-pointer hover:bg-base-300 transition-colors ${!n.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-black text-base-content">{n.title}</p>
                                        <p className="text-[9px] font-bold text-base-content/30">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <p className="text-[11px] text-base-content/60 font-medium leading-relaxed">{n.body}</p>
                                </button>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <i className="fa-solid fa-bell-slash text-4xl text-base-content/10 mb-4" aria-hidden="true"></i>
                                <p className="text-xs font-bold text-base-content/30 uppercase tracking-widest">{t('notification.empty')}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-base-300/50 text-center">
                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest italic">{t('notification.secure')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
