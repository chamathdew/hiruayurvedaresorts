import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, UserMinus, DollarSign, CalendarHeart } from 'lucide-react';
import PropTypes from 'prop-types';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="luxury-card p-6 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colorClass}`}>
            <Icon className="w-7 h-7" />
        </div>
    </div>
);

DashboardCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType.isRequired,
    colorClass: PropTypes.string.isRequired
};

const Dashboard = () => {
    const { token, user } = useAuth();
    const [stats, setStats] = useState({
        totalGuests: 0,
        todayArrivals: 0,
        todayDepartures: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/guests/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, [token]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-500 mt-1">Welcome back, here is what&apos;s happening today at {user?.hotelBranch === 'All' ? 'Hiru Resorts' : user?.hotelBranch}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <DashboardCard
                    title="Total Active Guests"
                    value={stats.totalGuests}
                    icon={Users}
                    colorClass="bg-blue-100 text-blue-600"
                />
                <DashboardCard
                    title="Today's Arrivals"
                    value={stats.todayArrivals}
                    icon={UserPlus}
                    colorClass="bg-green-100 text-green-600"
                />
                <DashboardCard
                    title="Today's Departures"
                    value={stats.todayDepartures}
                    icon={UserMinus}
                    colorClass="bg-red-100 text-red-600"
                />
                <DashboardCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    colorClass="bg-[#f28c00]/10 text-[#f28c00]"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 luxury-card p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h3>
                    <div className="flex flex-col space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">John Doe checked in</p>
                                    <p className="text-xs text-slate-500">Hiru Villa • Room 102</p>
                                </div>
                            </div>
                            <span className="text-sm text-slate-400">2 hours ago</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-[#f28c00]/10 text-[#f28c00] rounded-full flex items-center justify-center">
                                    <CalendarHeart className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">Sarah Smith&apos;s Birthday</p>
                                    <p className="text-xs text-slate-500">Hiru Om • Room 205</p>
                                </div>
                            </div>
                            <span className="text-sm px-3 py-1 bg-[#f28c00]/20 text-[#f28c00] rounded-full font-medium">Highlight</span>
                        </div>
                    </div>
                </div>

                <div className="luxury-card p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Occupancy Status</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Hiru Villa</span>
                                <span className="text-sm font-bold text-slate-800">85%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-[#f28c00] h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Hiru Om</span>
                                <span className="text-sm font-bold text-slate-800">60%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-[#f28c00] h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Hiru Mudhra</span>
                                <span className="text-sm font-bold text-slate-800">40%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-[#f28c00] h-2 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Hiru Aadya</span>
                                <span className="text-sm font-bold text-slate-800">95%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-[#f28c00] h-2 rounded-full" style={{ width: '95%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
