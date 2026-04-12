import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserCircle, Menu, X, LogOut } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={`flex h-screen overflow-hidden ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            <div className={`flex-1 flex flex-col min-w-0 overflow-hidden ${isDark ? '' : 'backdrop-blur-sm bg-white/20'}`}>
                <header className={`flex justify-between items-center p-4 lg:p-6 border-b z-[40] sticky top-0 header-bg ${isDark ? '' : 'backdrop-blur-md'}`}>

                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className={`p-2 mr-2 sm:mr-4 rounded-lg lg:hidden transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <h1 className={`text-lg font-bold lg:hidden drop-shadow-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Hiru Resorts</h1>
                    </div>

                    {/* Portal Target for Page-Specific Headers */}
                    <div id="page-header-portal" className="flex-1 w-full flex items-center px-4 md:px-8"></div>

                    <div className="flex items-center space-x-3 lg:space-x-8">
                        <div className="hidden sm:block">
                            <NotificationDropdown />
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className={`text-sm font-black tracking-tight drop-shadow-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.username}</p>
                                <p className={`text-[10px] uppercase tracking-widest font-black text-[#E89102]`}>
                                    {user?.role} - {user?.hotelBranch}
                                </p>
                            </div>
                            <div className="relative group p-0.5 rounded-full bg-gradient-to-tr from-[#E89102] to-yellow-400">
                                <UserCircle className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white/20 ${isDark ? 'text-slate-100 bg-slate-900' : 'text-slate-800 bg-white'}`} />
                            </div>
                            
                            {/* Logout Button */}
                            <button 
                                onClick={logout}
                                title="Logout"
                                className={`ml-2 p-2.5 rounded-xl border flex items-center gap-2 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg group
                                    ${isDark 
                                        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                                        : 'bg-red-50/80 border-red-100 text-red-600 hover:bg-red-600 hover:text-white'}`}
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-xs font-bold sm:block hidden">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
