import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Users, FileText, Settings, LogOut, PlaneLanding, PlaneTakeoff, X, CreditCard } from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = ({ onClose }) => {
    const { logout } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const handleLogout = () => {
        logout();
        if (onClose) onClose();
    };

    const NavItem = ({ to, icon: Icon, label, end = false }) => (
        <NavLink
            to={to}
            end={end}
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                        ? 'bg-[#E89102]/15 text-[#E89102] font-semibold'
                        : isDark
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
            }
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{label}</span>
        </NavLink>
    );

    return (
        <div className={`w-64 flex flex-col h-full shadow-2xl overflow-y-auto sidebar-bg`}>
            <div className={`p-6 flex flex-col items-center text-center relative border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 lg:hidden transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                >
                    <X className="w-6 h-6" />
                </button>
                <img src={logo} alt="Hiru Ayurveda Resorts Logo" className="w-[85%] h-auto mb-3 drop-shadow-2xl rounded-xl opacity-90 brightness-110" />
                <h2 className={`text-sm font-bold tracking-wide mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Hiru Ayurveda Resorts
                </h2>
                <p className={`text-[10px] mt-1 uppercase tracking-widest font-bold opacity-60 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Guest Management System</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavItem to="/" icon={LayoutDashboard} label="Dashboard" end />
                <NavItem to="/guests" icon={Users} label="Guests" />
                <NavItem to="/arrivals" icon={PlaneLanding} label="Arrival List" />
                <NavItem to="/departures" icon={PlaneTakeoff} label="Departure List" />
                <NavItem to="/cc-payments" icon={CreditCard} label="CC Payments" />
                <NavItem to="/reports" icon={FileText} label="Reports" />
                <NavItem to="/settings" icon={Settings} label="Settings" />
            </nav>

            <div className={`p-4 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                <button
                    onClick={handleLogout}
                    className={`flex items-center space-x-3 w-full px-4 py-2 transition rounded-xl ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
