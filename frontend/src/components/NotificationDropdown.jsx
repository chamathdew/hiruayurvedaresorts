import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import API_BASE_URL from '../config';

const NotificationDropdown = () => {
    const { token, user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    
    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    }, [token]);

    useEffect(() => {
        if (user?.role === 'Admin' || user?.role === 'Accounts') {
            fetchNotifications();
            // Poll for new notifications every 60 seconds
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
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

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (user?.role !== 'Admin' && user?.role !== 'Accounts') return null;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-[#E89102] text-white shadow-lg shadow-orange-500/20' : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden border animate-in slide-in-from-top-2 duration-200 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className={`p-4 flex justify-between items-center border-b ${isDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'}`}>
                            <h4 className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Notifications</h4>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllRead}
                                    className="text-[10px] font-black text-[#E89102] hover:text-[#d18102] flex items-center gap-1 uppercase tracking-widest bg-[#E89102]/10 px-2 py-1 rounded-lg transition-all"
                                >
                                    <Check className="w-3 h-3" /> Mark all read
                                </button>
                            )}
                        </div>
                        
                        <div className="max-h-[70vh] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-100/10">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n._id} 
                                            onClick={() => !n.isRead && markAsRead(n._id)}
                                            className={`p-4 transition-all duration-300 cursor-pointer border-b ${isDark ? 'border-slate-800/50' : 'border-slate-50'} ${!n.isRead ? (isDark ? 'bg-[#E89102]/5 hover:bg-[#E89102]/10' : 'bg-orange-50/30 hover:bg-orange-50/50') : (isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50')}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 shadow-sm ${!n.isRead ? 'bg-[#E89102] animate-pulse shadow-orange-500/50' : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`}></div>
                                                <div className="flex-1">
                                                    <p className={`text-sm leading-relaxed ${!n.isRead ? (isDark ? 'text-white font-bold' : 'text-slate-900 font-bold') : (isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium')}`}>
                                                        {n.message}
                                                    </p>
                                                    <div className={`mt-2 flex items-center text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm italic">No notifications yet</p>
                                </div>
                            )}
                        </div>
                        
                        <div className={`p-3 text-center border-t ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-100 bg-slate-50'}`}>
                            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Hiru Ayurveda Resorts</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
