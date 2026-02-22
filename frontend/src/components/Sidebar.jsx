import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FileText, Settings, LogOut, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import logo from '../assets/logo.png';

const Sidebar = () => {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center">
                <img src={logo} alt="Hiru Ayurveda Resorts Logo" className="w-[85%] h-auto mb-3 drop-shadow-lg rounded-lg" />
                <h2 className="text-sm font-semibold text-slate-300 tracking-wide mt-2">
                    Hiru Ayurveda Resorts
                </h2>
                <p className="text-xs text-slate-400 mt-1">Guest Management System</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/" end className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#f28c00]/10 text-[#f28c00]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium">Dashboard</span>
                </NavLink>

                <NavLink to="/guests" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#f28c00]/10 text-[#f28c00]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Guests</span>
                </NavLink>

                <NavLink to="/arrivals" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#f28c00]/10 text-[#f28c00]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <PlaneLanding className="w-5 h-5" />
                    <span className="font-medium">Arrival List</span>
                </NavLink>

                <NavLink to="/departures" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#f28c00]/10 text-[#f28c00]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <PlaneTakeoff className="w-5 h-5" />
                    <span className="font-medium">Departure List</span>
                </NavLink>

                <NavLink to="/reports" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#f28c00]/10 text-[#f28c00]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Reports</span>
                </NavLink>

                {(user?.role === 'Admin') && (
                    <NavLink to="/settings" className={({ isActive }) => `flex items-center space-x-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-[#f28c00]/10 text-[#f28c00]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Settings</span>
                    </NavLink>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button onClick={handleLogout} className="flex items-center space-x-3 text-slate-400 hover:text-white w-full px-4 py-2 transition">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
