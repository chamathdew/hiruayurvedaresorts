import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Check, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import API_BASE_URL from '../config';
import LoadingSpinner from '../components/LoadingSpinner';

const Notifications = () => {
    const { token, user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark notification as read', err);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const deleteNotification = async (id) => {
        if(!window.confirm("Delete this notification?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => (n._id !== id && n.id !== id)));
        } catch (err) {
            console.error('Failed to delete notification', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const bgCard = isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200';
    const textMain = isDark ? 'text-white' : 'text-slate-900';
    const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-glass p-8 rounded-3xl gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-gradient">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-500/20">
                                {unreadCount} New
                            </span>
                        )}
                    </div>
                    <p className={`text-sm ${textSub}`}>Stay updated with guest arrivals and system activities</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    {notifications.some(n => !n.isRead) && (
                        <button 
                            onClick={markAllRead}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#E89102]/10 text-[#E89102] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E89102]/20 transition-all border border-[#E89102]/20"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Mark All Read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className={`luxury-card overflow-hidden`}>
                {isLoading ? (
                    <div className="p-20 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-slate-500/10">
                        {notifications.map((n) => (
                            <div 
                                key={n._id || n.id} 
                                className={`p-6 transition-all duration-300 group flex gap-6 ${!n.isRead ? (isDark ? 'bg-[#E89102]/5' : 'bg-orange-50/40') : 'hover:bg-slate-500/5'}`}
                            >
                                <div className="mt-1">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${!n.isRead ? 'bg-[#E89102] text-white shadow-lg shadow-orange-500/30 rotate-3' : (isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                                        <Bell className={!n.isRead ? 'animate-bounce' : ''} size={20} />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-base leading-relaxed ${!n.isRead ? 'font-bold ' + textMain : 'font-medium ' + textSub}`}>
                                            {n.message}
                                        </p>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            {!n.isRead && (
                                                <button 
                                                    onClick={() => markAsRead(n._id || n.id)}
                                                    className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteNotification(n._id || n.id)}
                                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-widest ${textSub}`}>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-[#E89102]" />
                                            {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
                                        </span>
                                        {!n.isRead && (
                                            <span className="flex h-2 w-2 rounded-full bg-[#E89102] animate-pulse"></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center px-6">
                        <div className="w-24 h-24 bg-slate-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-slate-500/20" />
                        </div>
                        <h3 className={`text-xl font-black mb-2 ${textMain}`}>All caught up!</h3>
                        <p className={textSub}>You have no new notifications at the moment.</p>
                    </div>
                )}
            </div>
            
            <div className="text-center p-8 opacity-40">
                <p className={`text-[10px] uppercase tracking-[0.2em] font-black ${textSub}`}>Hiru Ayurveda Resorts — Management System</p>
            </div>
        </div>
    );
};

export default Notifications;
