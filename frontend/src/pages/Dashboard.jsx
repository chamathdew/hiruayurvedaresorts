import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, UserMinus, DollarSign, CalendarHeart } from 'lucide-react';
import PropTypes from 'prop-types';
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
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalGuests: 0,
        todayArrivals: 0,
        todayDepartures: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/guests/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    return (
        <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Dashboard Overview</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium italic">Welcome back, Sajith! Have a Great Day!</p>
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
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    colorClass="bg-[#E89102] text-white"
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 luxury-card p-6">
                    <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                    {isLoading ? (
                        <div className="py-10">
                            <LoadingSpinner size="md" message="Loading activity..." />
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-4">
                            <div className="bg-white/30 backdrop-blur-md p-4 rounded-xl flex items-center justify-between border border-white/40 shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">John Doe checked in</p>
                                        <p className="text-xs text-slate-500">Hiru Villa • Room 102</p>
                                    </div>
                                </div>
                                <span className="text-sm text-slate-400">2 hours ago</span>
                            </div>
                             <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-[#E89102]/20 text-[#E89102] rounded-lg flex items-center justify-center">
                                        <CalendarHeart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Sarah Smith&apos;s Birthday</p>
                                        <p className="text-xs text-slate-500 font-medium">Hiru Om • Room 205</p>
                                    </div>
                                </div>
                                <span className="text-xs px-3 py-1 bg-[#E89102]/20 text-[#E89102] rounded-full font-bold uppercase tracking-widest">Highlight</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="luxury-card p-6">
                    <h3 className="text-xl font-bold mb-6">Occupancy Status</h3>
                    {isLoading ? (
                        <div className="py-10">
                            <LoadingSpinner size="md" message="Calculating occupancy..." />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-400">Hiru Villa</span>
                                    <span className="text-sm font-bold">85%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2">
                                    <div className="bg-[#E89102] h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(232,145,2,0.3)]" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-400">Hiru Om</span>
                                    <span className="text-sm font-bold">60%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2">
                                    <div className="bg-[#E89102] h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(232,145,2,0.3)]" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-400">Hiru Mudhra</span>
                                    <span className="text-sm font-bold">40%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2">
                                    <div className="bg-[#E89102] h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(232,145,2,0.3)]" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-400">Hiru Aadya</span>
                                    <span className="text-sm font-bold">95%</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2">
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
