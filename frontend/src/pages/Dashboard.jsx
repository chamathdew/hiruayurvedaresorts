import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Users, UserPlus, UserMinus, DollarSign, CalendarHeart, Calendar as CalendarIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { format, parseISO, isSameMonth } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import API_BASE_URL from '../config';

const DashboardCard = ({ title, value, icon: Icon, colorClass, isLoading }) => (
    <div className="luxury-card p-6 flex items-center justify-between min-h-[120px]">
        {isLoading ? (
            <div className="w-full flex justify-center">
                <LoadingSpinner size="sm" message="" />
            </div>
        ) : (
            <>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-extrabold text-inherit">{value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-110 duration-300 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </>
        )}
    </div>
);

DashboardCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType.isRequired,
    colorClass: PropTypes.string.isRequired,
    isLoading: PropTypes.bool
};

const Dashboard = () => {
    const { token, user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [isLoading, setIsLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [ccPayments, setCcPayments] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [stats, setStats] = useState({
        totalGuests: 0,
        todayArrivals: 0,
        todayDepartures: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [statsRes, activityRes, ccRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/guests/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/notifications/recent`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/cc-payments`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setStats(statsRes.data);
                setActivities(activityRes.data);
                setCcPayments(ccRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [token]);

    const getActivityIcon = (type) => {
        switch(type) {
            case 'BIRTHDAY': return { icon: CalendarHeart, color: 'bg-[#E89102]/20 text-[#E89102]' };
            case 'CC_PAYMENT_ADDED': return { icon: DollarSign, color: 'bg-green-100 text-green-600' };
            case 'BOOKING_ADDED': return { icon: UserPlus, color: 'bg-blue-100 text-blue-600' };
            default: return { icon: Users, color: 'bg-slate-100 text-slate-600' };
        }
    };

    // Calculate Dynamic Revenue based on selectedMonth
    const currentMonthRevenue = useMemo(() => {
        if (!ccPayments.length) return 0;
        const [year, month] = selectedMonth.split('-');
        const targetDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        
        return ccPayments
            .filter(p => p.date && isSameMonth(new Date(p.date), targetDate))
            .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    }, [ccPayments, selectedMonth]);

    return (
        <div className="space-y-4 lg:space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
                <div>
                    <h2 className={`text-2xl lg:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Dashboard Overview</h2>
                    <p className={`text-sm mt-1 font-medium italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Welcome back, {user?.username}! Have a Great Day!</p>
                </div>
                
                <div className="flex items-center gap-3 bg-glass p-2 rounded-xl">
                    <CalendarIcon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className={`bg-transparent outline-none font-bold text-sm cursor-pointer ${isDark ? 'text-white style-color-scheme-dark' : 'text-slate-800'}`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                <DashboardCard
                    title="Total Active Guests"
                    value={stats.totalGuests}
                    icon={Users}
                    colorClass="bg-[#E89102]/10 text-[#E89102]"
                    isLoading={isLoading}
                />
                <DashboardCard
                    title="Today's Arrivals"
                    value={stats.todayArrivals}
                    icon={UserPlus}
                    colorClass="bg-green-100/10 text-green-500"
                    isLoading={isLoading}
                />
                <DashboardCard
                    title="Today's Departures"
                    value={stats.todayDepartures}
                    icon={UserMinus}
                    colorClass="bg-red-100/10 text-red-500"
                    isLoading={isLoading}
                />
                <DashboardCard
                    title={`Revenue (${format(parseISO(`${selectedMonth}-01`), 'MMM')})`}
                    value={`Rs. ${currentMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    colorClass="bg-[#E89102] text-white"
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 luxury-card p-6">
                    <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Activity</h3>
                    {isLoading ? (
                        <div className="py-10">
                            <LoadingSpinner size="md" message="Loading activity..." />
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-4">
                            {activities.length > 0 ? activities.map((act, i) => {
                                const meta = getActivityIcon(act.type);
                                return (
                                    <div key={i} className={`bg-glass p-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-right duration-300`} style={{ animationDelay: `${i * 50}ms` }}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.color}`}>
                                                <meta.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{act.message}</p>
                                                <p className="text-xs text-slate-500 uppercase tracking-tighter">
                                                    {act.hotelBranch} • {new Date(act.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        {act.type === 'BIRTHDAY' && (
                                            <span className="text-xs px-3 py-1 bg-[#E89102]/20 text-[#E89102] rounded-full font-bold uppercase tracking-widest border border-[#E89102]/30">Special</span>
                                        )}
                                    </div>
                                );
                            }) : (
                                <p className="text-center py-10 text-slate-400">No recent activities found.</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="luxury-card p-6">
                    <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Occupancy Status</h3>
                    {isLoading ? (
                        <div className="py-10">
                            <LoadingSpinner size="md" message="Calculating occupancy..." />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-400">Hiru Villa</span>
                                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>85%</span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                                    <div className="bg-[#E89102] h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(232,145,2,0.3)]" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-400">Hiru Om</span>
                                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>60%</span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                                    <div className="bg-[#E89102] h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(232,145,2,0.3)]" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-400">Hiru Mudhra</span>
                                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>40%</span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                                    <div className="bg-[#E89102] h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(232,145,2,0.3)]" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-400">Hiru Aadya</span>
                                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>95%</span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                                    <div className="bg-[#E89102] h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(232,145,2,0.3)]" style={{ width: '95%' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
